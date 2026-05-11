'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Award, BookOpen, Shield, Search, Filter, CheckCircle, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth, type AppUser } from '@/providers/AuthProvider';
import { SKILL_LIST, getAllRoundsCompleted, type SkillId } from '@/lib/skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import UserDetailModal from './components/UserDetailModal';

interface CredentialData {
  id: string;
  skillId: string;
  skillTitle: string;
  blockchainHash: string;
  rounds?: Array<{ round: number; score: number; percentage: number }>;
  issuedAt: Date;
  expiresAt?: Date;
  isVerified: boolean;
  isRevoked?: boolean;
}

interface UserWithSkills extends AppUser {
  completedSkillsCount: number;
  inProgressSkillsCount: number;
  totalRoundsCompleted: number;
  credentialsCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState<UserWithSkills[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithSkills[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  // Modal state
  const [selectedUser, setSelectedUser] = useState<UserWithSkills | null>(null);
  const [selectedUserCredentials, setSelectedUserCredentials] = useState<CredentialData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return;

      try {
        // Fetch users with their credentials count
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select(`
            *,
            credentials(id)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          toast.error('Failed to load users');
          return;
        }

        const formattedUsers: UserWithSkills[] = (usersData || []).map((userData) => {
          const skillsProgress = userData.skills_progress || {};

          let completedSkillsCount = 0;
          let inProgressSkillsCount = 0;
          let totalRoundsCompleted = 0;

          Object.entries(skillsProgress).forEach(([, progress]: [string, unknown]) => {
            const skillProgress = progress as { roundsCompleted?: number[] };
            const completedRounds = skillProgress?.roundsCompleted || [];
            totalRoundsCompleted += completedRounds.length;

            if (getAllRoundsCompleted(completedRounds)) {
              completedSkillsCount++;
            } else if (completedRounds.length > 0) {
              inProgressSkillsCount++;
            }
          });

          return {
            id: userData.id,
            email: userData.email,
            displayName: userData.display_name,
            avatarUrl: userData.avatar_url,
            role: userData.role || 'user',
            createdAt: new Date(userData.created_at),
            skillsProgress,
            completedSkillsCount,
            inProgressSkillsCount,
            totalRoundsCompleted,
            credentialsCount: userData.credentials?.length || 0,
          };
        });

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [isAdmin, supabase]);

  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    if (skillFilter !== 'all') {
      filtered = filtered.filter((u) => {
        const skillProgress = u.skillsProgress?.[skillFilter as SkillId];
        return skillProgress && (skillProgress as { roundsCompleted?: number[] }).roundsCompleted?.length > 0;
      });
    }

    setFilteredUsers(filtered);
  }, [searchQuery, skillFilter, users]);

  const handleViewUser = async (userData: UserWithSkills) => {
    setSelectedUser(userData);
    setIsModalOpen(true);
    setIsLoadingCredentials(true);

    try {
      const { data: credentialsData, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', userData.id);

      if (error) {
        console.error('Error fetching credentials:', error);
        toast.error('Failed to load user credentials');
        return;
      }

      const credentials: CredentialData[] = (credentialsData || []).map((cred) => {
        const skillInfo = SKILL_LIST.find(s => s.id === cred.skill_id);
        return {
          id: cred.id,
          skillId: cred.skill_id,
          skillTitle: skillInfo?.name || cred.skill_id,
          blockchainHash: cred.hash,
          rounds: cred.round_scores?.map((score: number, idx: number) => ({
            round: idx + 1,
            score,
            percentage: score,
          })),
          issuedAt: new Date(cred.issued_at),
          isVerified: true,
          isRevoked: false,
        };
      });

      setSelectedUserCredentials(credentials);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load user credentials');
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const handleResetSkill = async (userId: string, skillId: SkillId) => {
    if (!user) return;

    try {
      // Get current user's skills_progress
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('skills_progress')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const skillsProgress = userData?.skills_progress || {};
      delete skillsProgress[skillId];

      // Update the user's skills_progress
      const { error: updateError } = await supabase
        .from('users')
        .update({ skills_progress: skillsProgress })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Delete any credentials for this skill
      await supabase
        .from('credentials')
        .delete()
        .eq('user_id', userId)
        .eq('skill_id', skillId);

      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const newSkills = { ...u.skillsProgress };
            delete newSkills[skillId];
            const completedSkillsCount = Object.values(newSkills).filter(
              (s: unknown) => getAllRoundsCompleted((s as { roundsCompleted?: number[] })?.roundsCompleted || [])
            ).length;
            const inProgressSkillsCount = Object.values(newSkills).filter((s: unknown) => {
              const rounds = (s as { roundsCompleted?: number[] })?.roundsCompleted || [];
              return rounds.length > 0 && !getAllRoundsCompleted(rounds);
            }).length;
            const totalRoundsCompleted = Object.values(newSkills).reduce(
              (acc: number, s: unknown) => acc + ((s as { roundsCompleted?: number[] })?.roundsCompleted?.length || 0),
              0
            );

            return {
              ...u,
              skillsProgress: newSkills,
              completedSkillsCount,
              inProgressSkillsCount,
              totalRoundsCompleted,
              credentialsCount: Math.max(0, u.credentialsCount - 1),
            };
          }
          return u;
        })
      );

      // Update selected user if viewing
      if (selectedUser?.id === userId) {
        const newSkills = { ...selectedUser.skillsProgress };
        delete newSkills[skillId];
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                skillsProgress: newSkills,
              }
            : null
        );
        setSelectedUserCredentials((prev) =>
          prev.filter((c) => c.skillId !== skillId)
        );
      }

      toast.success('Skill progress reset successfully');
    } catch (error) {
      console.error('Error resetting skill:', error);
      toast.error('Failed to reset skill progress');
    }
  };

  const handleIssueCredential = async (
    userId: string,
    skillId: SkillId,
    skillName: string,
    finalScore: number,
    roundScores: Array<{ round: number; score: number; percentage: number }>
  ) => {
    if (!user) return;

    try {
      // Generate a mock blockchain hash
      const hash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      const verificationUrl = `${window.location.origin}/verify/${hash}`;

      // Insert credential
      const { data: credData, error: credError } = await supabase
        .from('credentials')
        .insert({
          user_id: userId,
          skill_id: skillId,
          final_score: finalScore,
          hash,
          verification_url: verificationUrl,
          round_scores: roundScores.map(r => r.percentage),
          views: 0,
        })
        .select()
        .single();

      if (credError) throw credError;

      // Update user's skills_progress
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('skills_progress')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const skillsProgress = userData?.skills_progress || {};
      skillsProgress[skillId] = { roundsCompleted: [1, 2, 3] };

      const { error: updateError } = await supabase
        .from('users')
        .update({ skills_progress: skillsProgress })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              skillsProgress: {
                ...u.skillsProgress,
                [skillId]: { roundsCompleted: [1, 2, 3] },
              },
              completedSkillsCount: u.completedSkillsCount + 1,
              credentialsCount: u.credentialsCount + 1,
            };
          }
          return u;
        })
      );

      // Update selected user if viewing
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                skillsProgress: {
                  ...prev.skillsProgress,
                  [skillId]: { roundsCompleted: [1, 2, 3] },
                },
                completedSkillsCount: prev.completedSkillsCount + 1,
                credentialsCount: prev.credentialsCount + 1,
              }
            : null
        );
        setSelectedUserCredentials((prev) => [
          ...prev,
          {
            id: credData.id,
            skillId,
            skillTitle: skillName,
            blockchainHash: hash,
            rounds: roundScores,
            issuedAt: new Date(),
            isVerified: true,
            isRevoked: false,
          },
        ]);
      }

      toast.success('Credential issued successfully');
    } catch (error) {
      console.error('Error issuing credential:', error);
      toast.error('Failed to issue credential');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!user) return;

    try {
      // Delete user from Supabase (cascades to credentials and attempts)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== userId));
      setIsModalOpen(false);

      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSkillProgressBadges = (userSkills: Record<string, unknown>) => {
    return SKILL_LIST.map((skill) => {
      const progress = userSkills?.[skill.id] as { roundsCompleted?: number[] } | undefined;
      const completedRounds = progress?.roundsCompleted || [];
      const isComplete = getAllRoundsCompleted(completedRounds);

      if (completedRounds.length === 0) return null;

      return (
        <div
          key={skill.id}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
            isComplete
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-primary/20 text-primary'
          )}
        >
          {isComplete && <CheckCircle className="w-3 h-3" />}
          {skill.name} ({completedRounds.length}/3)
        </div>
      );
    }).filter(Boolean);
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalUsers = users.length;
  const usersWithCredentials = users.filter((u) => u.credentialsCount > 0).length;
  const totalCredentialsIssued = users.reduce((acc, u) => acc + u.credentialsCount, 0);
  const totalRoundsCompleted = users.reduce((acc, u) => acc + u.totalRoundsCompleted, 0);

  return (
    <>
      <div className="min-h-screen space-y-8 pb-12">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users and track skill progress</p>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Credentials Issued</p>
                  <p className="text-2xl font-bold text-foreground">{totalCredentialsIssued}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Rounds Completed</p>
                  <p className="text-2xl font-bold text-foreground">{totalRoundsCompleted}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Certified Users</p>
                  <p className="text-2xl font-bold text-foreground">{usersWithCredentials}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* User Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl overflow-hidden"
          >
            {/* Filters */}
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {SKILL_LIST.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Skills Progress</TableHead>
                      <TableHead className="text-center">Completed</TableHead>
                      <TableHead className="text-center">Credentials</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow
                        key={u.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewUser(u)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={u.avatarUrl || undefined} />
                              <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {u.displayName || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              u.role === 'admin'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getSkillProgressBadges(u.skillsProgress).slice(0, 3)}
                            {getSkillProgressBadges(u.skillsProgress).length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{getSkillProgressBadges(u.skillsProgress).length - 3} more
                              </span>
                            )}
                            {getSkillProgressBadges(u.skillsProgress).length === 0 && (
                              <span className="text-xs text-muted-foreground">No progress</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-foreground">
                            {u.completedSkillsCount}
                          </span>
                          <span className="text-muted-foreground">/{SKILL_LIST.length}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-foreground">{u.credentialsCount}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {u.createdAt.toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewUser(u);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        </section>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        credentials={selectedUserCredentials}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setSelectedUserCredentials([]);
        }}
        isLoadingCredentials={isLoadingCredentials}
        onResetSkill={handleResetSkill}
        onIssueCredential={handleIssueCredential}
        onDeleteUser={handleDeleteUser}
      />
    </>
  );
}
