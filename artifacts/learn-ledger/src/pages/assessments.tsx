import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AssessmentCard from '@/components/assessment-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { fetchUserAssessments } from '@/lib/supabase-data';

const BASE_ASSESSMENTS = [
  { id: 'react-advanced', title: 'React Advanced', description: 'Master advanced React patterns and hooks', duration: '30 min', questions: 15 },
  { id: 'js-mastery', title: 'JavaScript Mastery', description: 'Deep dive into JavaScript fundamentals and engine internals', duration: '35 min', questions: 15 },
  { id: 'typescript-pro', title: 'TypeScript Pro', description: 'Advanced TypeScript patterns and type system mastery', duration: '35 min', questions: 15 },
  { id: 'web-performance', title: 'Web Performance', description: 'Optimize web applications for speed and Core Web Vitals', duration: '40 min', questions: 15 },
];

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState(
    BASE_ASSESSMENTS.map(a => ({ ...a, status: 'pending' as const, progress: 0 }))
  );

  useEffect(() => {
    if (!user) return;
    fetchUserAssessments(user.id).then((rows: any[]) => {
      setAssessments(BASE_ASSESSMENTS.map(base => {
        const row = rows.find((r: any) => r.assessment_id === base.id);
        const status = (row?.status ?? 'pending') as 'pending' | 'in-progress' | 'completed';
        const progress = status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0;
        return { ...base, status, progress };
      }));
    });
  }, [user?.id]);

  const completedCount = assessments.filter(a => a.status === 'completed').length;
  const inProgressCount = assessments.filter(a => a.status === 'in-progress').length;

  return (
    <div className="min-h-screen space-y-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold">Assessments</h1>
          <p className="text-lg text-foreground/70 max-w-2xl">Take 3 progressive rounds to validate your skills and earn verified credentials.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Completed', value: completedCount, delay: 0.1 },
            { label: 'In Progress', value: inProgressCount, delay: 0.2 },
            { label: 'Total Assessments', value: assessments.length, delay: 0.3 },
          ].map(({ label, value, delay }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }} className="glass p-6 rounded-xl">
              <p className="text-foreground/60 text-sm mb-1">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="glass mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="pending">Not Started</TabsTrigger>
          </TabsList>

          {['all', 'completed', 'in-progress', 'pending'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assessments
                  .filter(a => tab === 'all' || a.status === tab)
                  .map((assessment, index) => (
                    <AssessmentCard key={assessment.id} {...assessment} delay={index * 0.05} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
