import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  Copy,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
  Clock,
  AlertCircle,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchResume, type ResumeRecord } from '@/lib/supabase-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SkeletonLoader from '@/components/skeleton-loader';

interface ResumeResultPageProps {
  resumeId: string;
}

interface ParsedData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    title: string;
    duration: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
}

export default function ResumeResultPage({ resumeId }: ResumeResultPageProps) {
  const { user } = useAuth();
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setError('No resume ID provided');
        setIsLoading(false);
        return;
      }

      const data = await fetchResume(resumeId);
      if (data) {
        setResume(data);
      } else {
        setError('Resume not found');
      }
      setIsLoading(false);
    };

    loadResume();
  }, [resumeId]);

  const copyHash = async () => {
    if (resume?.file_hash) {
      await navigator.clipboard.writeText(resume.file_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyVerificationUrl = async () => {
    const url = `${window.location.origin}/verify/${resumeId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Resume Not Found</h2>
            <p className="text-muted-foreground">{error || 'The requested resume could not be found.'}</p>
            <Link href="/resume">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parsedData = resume.extracted_data as ParsedData | null;
  const score = resume.score || 0;

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <Link href="/resume">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Resume Analysis</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {resume.original_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={resume.status === 'completed' ? 'default' : 'secondary'}
              className={resume.status === 'completed' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}
            >
              {resume.status === 'completed' ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                resume.status
              )}
            </Badge>
          </div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="glass h-full">
              <CardHeader className="text-center">
                <CardTitle>Resume Score</CardTitle>
                <CardDescription>AI-powered analysis</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 440} 440`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={`${score >= 60 ? 'stop-color-primary' : 'stop-color-red-500'}`} style={{ stopColor: score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444' }} />
                        <stop offset="100%" className={`${score >= 60 ? 'stop-color-accent' : 'stop-color-rose-500'}`} style={{ stopColor: score >= 80 ? '#10b981' : score >= 60 ? '#f97316' : '#f43f5e' }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="text-center">
                  <Badge className={`bg-gradient-to-r ${getScoreGradient(score)} text-white border-0`}>
                    {getScoreLabel(score)}
                  </Badge>
                </div>
                {resume.feedback && (
                  <p className="text-sm text-muted-foreground text-center">{resume.feedback}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Verification Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Blockchain Verification
                </CardTitle>
                <CardDescription>
                  Your resume has been hashed for tamper-proof verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">File Hash (SHA-256)</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted/50 rounded-lg text-xs font-mono break-all">
                      {resume.file_hash}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyHash}>
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Verification URL</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted/50 rounded-lg text-xs font-mono truncate">
                      {window.location.origin}/verify/{resumeId}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyVerificationUrl}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-3 glass rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Uploaded</p>
                      <p className="text-sm font-medium">
                        {new Date(resume.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 glass rounded-lg">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">File Size</p>
                      <p className="text-sm font-medium">
                        {(resume.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Extracted Data */}
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Skills */}
            {parsedData.skills && parsedData.skills.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="w-5 h-5 text-primary" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {parsedData.experience && parsedData.experience.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="w-5 h-5 text-accent" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parsedData.experience.map((exp, i) => (
                    <div key={i} className="space-y-1">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground">{exp.duration}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {parsedData.education && parsedData.education.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parsedData.education.map((edu, i) => (
                    <div key={i} className="space-y-1">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">{edu.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link href="/resume">
            <Button variant="outline" size="lg">
              Upload Another Resume
            </Button>
          </Link>
          <Link href="/credentials">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Award className="w-4 h-4 mr-2" />
              View All Credentials
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
