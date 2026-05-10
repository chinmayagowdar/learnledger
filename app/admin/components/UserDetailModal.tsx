'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Award,
  Calendar,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SKILL_LIST, getAllRoundsCompleted, type SkillId } from '@/lib/skills';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: Date;
  skills: Record<string, { roundsCompleted?: number[]; finalScore?: number }>;
}

interface UserDetailModalProps {
  user: UserData | null;
  credentials: CredentialData[];
  isOpen: boolean;
  onClose: () => void;
  onResetSkill: (userId: string, skillId: SkillId) => Promise<void>;
  onIssueCredential: (userId: string, skillId: SkillId, skillName: string, finalScore: number, roundScores: Array<{ round: number; score: number; percentage: number }>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  adminUserId: string;
}

export default function UserDetailModal({
  user,
  credentials,
  isOpen,
  onClose,
  onResetSkill,
  onIssueCredential,
  onDeleteUser,
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [issueSkillId, setIssueSkillId] = useState<SkillId | ''>('');
  const [issueFinalScore, setIssueFinalScore] = useState(85);

  if (!user) return null;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleResetSkill = async (skillId: SkillId) => {
    setIsResetting(skillId);
    try {
      await onResetSkill(user.uid, skillId);
    } finally {
      setIsResetting(null);
    }
  };

  const handleIssueCredential = async () => {
    if (!issueSkillId) {
      toast.error('Please select a skill');
      return;
    }

    const skill = SKILL_LIST.find((s) => s.id === issueSkillId);
    if (!skill) return;

    setIsIssuing(true);
    try {
      const roundScores = [
        { round: 1, score: Math.round(issueFinalScore * 0.9), percentage: Math.round(issueFinalScore * 0.9) },
        { round: 2, score: Math.round(issueFinalScore), percentage: Math.round(issueFinalScore) },
        { round: 3, score: Math.round(issueFinalScore * 1.05), percentage: Math.min(100, Math.round(issueFinalScore * 1.05)) },
      ];
      await onIssueCredential(user.uid, issueSkillId, skill.name, issueFinalScore, roundScores);
      setShowIssueDialog(false);
      setIssueSkillId('');
      setIssueFinalScore(85);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await onDeleteUser(user.uid);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const skillsWithProgress = SKILL_LIST.map((skill) => {
    const progress = user.skills?.[skill.id] || {};
    const completedRounds = progress.roundsCompleted || [];
    const isComplete = getAllRoundsCompleted(completedRounds);
    const credential = credentials.find((c) => c.skillId === skill.id && !c.isRevoked);

    return {
      ...skill,
      completedRounds,
      isComplete,
      finalScore: progress.finalScore,
      credential,
      status: isComplete ? 'completed' : completedRounds.length > 0 ? 'in_progress' : 'not_started',
    };
  });

  const activeCredentials = credentials.filter((c) => !c.isRevoked);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="gradient-primary text-white text-lg">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {user.displayName || 'Unknown User'}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <div className="border-b border-border px-6">
                  <TabsList className="h-12 bg-transparent">
                    <TabsTrigger value="profile" className="gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="gap-2">
                      <Award className="h-4 w-4" />
                      Skills Progress
                    </TabsTrigger>
                    <TabsTrigger value="credentials" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Credentials ({activeCredentials.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6">
                  {/* Profile Tab */}
                  <TabsContent value="profile" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium text-foreground">{user.email || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Shield className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Account Created</p>
                            <p className="font-medium text-foreground">
                              {user.createdAt.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-2">Quick Stats</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {skillsWithProgress.filter((s) => s.isComplete).length}
                              </p>
                              <p className="text-xs text-muted-foreground">Skills Completed</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {activeCredentials.length}
                              </p>
                              <p className="text-xs text-muted-foreground">Credentials</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {skillsWithProgress.reduce((acc, s) => acc + s.completedRounds.length, 0)}
                              </p>
                              <p className="text-xs text-muted-foreground">Rounds Passed</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {skillsWithProgress.filter((s) => s.status === 'in_progress').length}
                              </p>
                              <p className="text-xs text-muted-foreground">In Progress</p>
                            </div>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                          <p className="text-sm font-medium text-destructive mb-3">Danger Zone</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={user.role === 'admin'}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User Account
                          </Button>
                          {user.role === 'admin' && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Cannot delete admin accounts
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Skills Progress Tab */}
                  <TabsContent value="skills" className="mt-0 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Skill Progress</h3>
                      <Button size="sm" onClick={() => setShowIssueDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Issue Credential
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Round 1</TableHead>
                          <TableHead className="text-center">Round 2</TableHead>
                          <TableHead className="text-center">Round 3</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skillsWithProgress.map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br', skill.color)}>
                                  <skill.icon className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium">{skill.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  skill.status === 'completed'
                                    ? 'default'
                                    : skill.status === 'in_progress'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className={cn(
                                  skill.status === 'completed' && 'bg-green-500/20 text-green-600 border-green-500/30'
                                )}
                              >
                                {skill.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {skill.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                                {skill.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            {[1, 2, 3].map((round) => (
                              <TableCell key={round} className="text-center">
                                {skill.completedRounds.includes(round) ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted mx-auto" />
                                )}
                              </TableCell>
                            ))}
                            <TableCell>
                              {skill.finalScore ? (
                                <span className="font-semibold">{skill.finalScore}%</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {skill.completedRounds.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResetSkill(skill.id)}
                                  disabled={isResetting === skill.id}
                                >
                                  {isResetting === skill.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Credentials Tab */}
                  <TabsContent value="credentials" className="mt-0 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Earned Credentials</h3>

                    {activeCredentials.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No credentials earned yet</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {activeCredentials.map((credential) => (
                          <div
                            key={credential.id}
                            className="p-4 rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {credential.skillTitle}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Issued: {credential.issuedAt.toLocaleDateString()}
                                </p>
                                {credential.rounds && (
                                  <div className="flex gap-4 mt-2">
                                    {credential.rounds.map((r) => (
                                      <span key={r.round} className="text-xs text-muted-foreground">
                                        R{r.round}: {r.percentage}%
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {credential.isVerified && (
                                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/verify/${credential.blockchainHash}`, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 p-2 rounded bg-muted/50">
                              <p className="text-xs text-muted-foreground font-mono break-all">
                                Hash: {credential.blockchainHash}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{user.displayName || user.email}</strong>?
              This action cannot be undone and will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User account and profile</li>
                <li>All credentials ({activeCredentials.length})</li>
                <li>All skill progress and attempts</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Credential Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manually Issue Credential</DialogTitle>
            <DialogDescription>
              Issue a credential for {user.displayName || user.email}. This will mark all rounds
              as completed and generate a blockchain hash.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Skill</Label>
              <Select value={issueSkillId} onValueChange={(v) => setIssueSkillId(v as SkillId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a skill" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LIST.filter((s) => !skillsWithProgress.find((sp) => sp.id === s.id)?.isComplete).map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Final Score (%)</Label>
              <Input
                type="number"
                min={70}
                max={100}
                value={issueFinalScore}
                onChange={(e) => setIssueFinalScore(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssueCredential} disabled={isIssuing || !issueSkillId}>
              {isIssuing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Award className="h-4 w-4 mr-2" />
              )}
              Issue Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
