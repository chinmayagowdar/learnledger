'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Shield, Users, Award, BookOpen } from 'lucide-react';
import SkeletonLoader from '@/components/skeleton-loader';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UserStats {
  totalAttempts: number;
  totalCredentials: number;
  skillsCompleted: string[];
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles) {
        setUsers(profiles as UserProfile[]);

        const statsMap: Record<string, UserStats> = {};
        for (const profile of profiles) {
          const { data: attempts } = await supabase
            .from('attempts')
            .select('skill_id, passed')
            .eq('user_id', profile.id);

          const { data: creds } = await supabase
            .from('credentials')
            .select('skill_id')
            .eq('user_id', profile.id);

          const completedSkills = new Set<string>();
          attempts?.forEach((a) => {
            if (a.passed) completedSkills.add(a.skill_id);
          });

          statsMap[profile.id] = {
            totalAttempts: attempts?.length || 0,
            totalCredentials: creds?.length || 0,
            skillsCompleted: Array.from(completedSkills),
          };
        }
        setUserStats(statsMap);
      }
      setLoading(false);
    };

    fetchData();
  }, [isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen space-y-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          </div>
          <p className="text-foreground/60">Manage users and monitor assessment progress.</p>
        </motion.div>
      </section>

      {/* Summary Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-5 rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">Total Users</p>
                <p className="text-2xl font-semibold">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent/10">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">Total Attempts</p>
                <p className="text-2xl font-semibold">
                  {Object.values(userStats).reduce((sum, s) => sum + s.totalAttempts, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="glass p-5 rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">Credentials Issued</p>
                <p className="text-2xl font-semibold">
                  {Object.values(userStats).reduce((sum, s) => sum + s.totalCredentials, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="glass rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-foreground/60">Name</th>
                  <th className="text-left p-4 font-medium text-foreground/60">Email</th>
                  <th className="text-left p-4 font-medium text-foreground/60">Role</th>
                  <th className="text-left p-4 font-medium text-foreground/60">Attempts</th>
                  <th className="text-left p-4 font-medium text-foreground/60">Credentials</th>
                  <th className="text-left p-4 font-medium text-foreground/60">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const stats = userStats[user.id] || { totalAttempts: 0, totalCredentials: 0, skillsCompleted: [] };
                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{user.full_name || '—'}</td>
                      <td className="p-4 text-foreground/70">{user.email}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground/60'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">{stats.totalAttempts}</td>
                      <td className="p-4">{stats.totalCredentials}</td>
                      <td className="p-4 text-foreground/60">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-8 text-center text-foreground/50">
              No users found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
