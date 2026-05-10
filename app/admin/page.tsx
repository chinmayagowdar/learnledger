'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Award, BookOpen, Shield, Search, Filter, ChevronDown, CheckCircle } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import type { AppUser } from '@/lib/auth';
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

interface UserWithSkills extends AppUser {
  completedSkillsCount: number;
  inProgressSkillsCount: number;
  totalRoundsCompleted: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState<UserWithSkills[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithSkills[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    async function fetchUsers() {
      if (!db || !isAdmin) return;

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);

        const usersData: UserWithSkills[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const skills = data.skills || {};

          let completedSkillsCount = 0;
          let inProgressSkillsCount = 0;
          let totalRoundsCompleted = 0;

          Object.entries(skills).forEach(([, progress]: [string, unknown]) => {
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
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            role: data.role || 'user',
            createdAt: data.createdAt?.toDate() || new Date(),
            skills,
            completedSkillsCount,
            inProgressSkillsCount,
            totalRoundsCompleted,
          };
        });

        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
      );
    }

    // Apply skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter((u) => {
        const skillProgress = u.skills?.[skillFilter as SkillId];
        return skillProgress && skillProgress.roundsCompleted?.length > 0;
      });
    }

    setFilteredUsers(filtered);
  }, [searchQuery, skillFilter, users]);

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

  // Calculate stats
  const totalUsers = users.length;
  const usersWithCredentials = users.filter((u) => u.completedSkillsCount > 0).length;
  const totalCredentialsIssued = users.reduce((acc, u) => acc + u.completedSkillsCount, 0);
  const totalRoundsCompleted = users.reduce((acc, u) => acc + u.totalRoundsCompleted, 0);

  return (
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
                    <TableHead className="text-center">In Progress</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.photoURL || undefined} alt={u.displayName || 'User'} />
                            <AvatarFallback className="gradient-primary text-white text-sm">
                              {getInitials(u.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{u.displayName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {getSkillProgressBadges(u.skills).length > 0 ? (
                            getSkillProgressBadges(u.skills)
                          ) : (
                            <span className="text-xs text-muted-foreground">No progress yet</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {u.completedSkillsCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">
                          {u.inProgressSkillsCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {u.createdAt.toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
