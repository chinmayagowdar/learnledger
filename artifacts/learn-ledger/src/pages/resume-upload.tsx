import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Shield, Zap, Award } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createResume, updateResumeStatus } from '@/lib/supabase-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import HeroSection from '@/components/hero-section';

type UploadState = 'idle' | 'uploading' | 'parsing' | 'scoring' | 'complete' | 'error';

interface ParsedResumeData {
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
  [key: string]: unknown;
}

export default function ResumeUploadPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const simulateAIParsing = async (file: File): Promise<ParsedResumeData> => {
    // Simulate AI parsing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // In a real implementation, this would call an AI service
    // For now, return mock parsed data
    return {
      name: 'Extracted Name',
      email: 'extracted@email.com',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
      experience: [
        { company: 'Tech Corp', title: 'Senior Developer', duration: '2020-2024' },
        { company: 'Startup Inc', title: 'Full Stack Developer', duration: '2018-2020' },
      ],
      education: [
        { institution: 'University of Technology', degree: 'BS Computer Science', year: '2018' },
      ],
    };
  };

  const calculateResumeScore = (data: ParsedResumeData): { score: number; feedback: string } => {
    let score = 0;
    const feedbackItems: string[] = [];

    // Skills scoring (max 30 points)
    const skillCount = data.skills?.length || 0;
    const skillScore = Math.min(skillCount * 5, 30);
    score += skillScore;
    if (skillCount < 5) {
      feedbackItems.push('Consider adding more technical skills to strengthen your profile.');
    }

    // Experience scoring (max 40 points)
    const expCount = data.experience?.length || 0;
    const expScore = Math.min(expCount * 15, 40);
    score += expScore;
    if (expCount < 2) {
      feedbackItems.push('More work experience entries would improve your resume.');
    }

    // Education scoring (max 20 points)
    const eduCount = data.education?.length || 0;
    const eduScore = Math.min(eduCount * 20, 20);
    score += eduScore;
    if (eduCount === 0) {
      feedbackItems.push('Adding educational background would strengthen your resume.');
    }

    // Contact info (max 10 points)
    if (data.name) score += 3;
    if (data.email) score += 4;
    if (data.phone) score += 3;

    const feedback = feedbackItems.length > 0
      ? feedbackItems.join(' ')
      : 'Excellent resume! Your profile looks comprehensive and well-structured.';

    return { score: Math.min(score, 100), feedback };
  };

  const processResume = async (selectedFile: File) => {
    if (!user) {
      setError('Please sign in to upload a resume.');
      return;
    }

    setError(null);
    setUploadState('uploading');
    setProgress(10);

    try {
      // Generate file hash for verification
      const fileHash = await generateFileHash(selectedFile);
      setProgress(25);

      // Create resume record in database
      const resume = await createResume(
        user.id,
        selectedFile.name,
        fileHash,
        selectedFile.size,
        selectedFile.type,
      );

      if (!resume) {
        throw new Error('Failed to create resume record');
      }

      setResumeId(resume.id);
      setProgress(40);
      setUploadState('parsing');

      // Update status to processing
      await updateResumeStatus(resume.id, 'processing');

      // Parse resume with AI (simulated)
      const parsedData = await simulateAIParsing(selectedFile);
      setProgress(70);
      setUploadState('scoring');

      // Calculate score
      const { score, feedback } = calculateResumeScore(parsedData);
      setProgress(90);

      // Update resume with results
      await updateResumeStatus(resume.id, 'completed', {
        extracted_data: parsedData,
        score,
        feedback,
      });

      setProgress(100);
      setUploadState('complete');

      // Redirect to results page after a brief delay
      setTimeout(() => {
        setLocation(`/resume/${resume.id}`);
      }, 1500);
    } catch (err) {
      console.error('Resume processing error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your resume.');
      setUploadState('error');
      
      if (resumeId) {
        await updateResumeStatus(resumeId, 'error', {
          error_message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    if (!acceptedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      processResume(file);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadState('idle');
    setProgress(0);
    setError(null);
    setResumeId(null);
  };

  const getStateIcon = () => {
    switch (uploadState) {
      case 'uploading':
        return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
      case 'parsing':
        return <FileText className="w-8 h-8 text-accent animate-pulse" />;
      case 'scoring':
        return <Award className="w-8 h-8 text-primary animate-bounce-slow" />;
      case 'complete':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-destructive" />;
      default:
        return <Upload className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getStateText = () => {
    switch (uploadState) {
      case 'uploading':
        return 'Uploading your resume...';
      case 'parsing':
        return 'AI is analyzing your resume...';
      case 'scoring':
        return 'Calculating your score...';
      case 'complete':
        return 'Resume processed successfully!';
      case 'error':
        return 'Something went wrong';
      default:
        return file ? 'Ready to upload' : 'Drag and drop your resume here';
    }
  };

  return (
    <div className="min-h-screen space-y-12">
      <HeroSection
        title="Resume Verification"
        subtitle="Upload your resume for AI-powered analysis and blockchain-verified scoring. Get instant feedback and a verifiable credential."
        cta={{ text: 'View My Resumes', href: '/credentials' }}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
              <CardDescription>
                Supported formats: PDF, DOC, DOCX (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                  ${dragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  ${uploadState !== 'idle' ? 'pointer-events-none' : 'cursor-pointer'}
                `}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadState !== 'idle'}
                />
                
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    key={uploadState}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    {getStateIcon()}
                  </motion.div>
                  
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{getStateText()}</p>
                    {uploadState === 'idle' && !file && (
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    )}
                  </div>

                  {file && uploadState === 'idle' && (
                    <div className="flex items-center gap-3 mt-4 px-4 py-2 glass rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetUpload();
                        }}
                        className="p-1 hover:bg-destructive/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <AnimatePresence>
                {uploadState !== 'idle' && uploadState !== 'error' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {progress}% complete
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                {uploadState === 'idle' && file && (
                  <Button
                    onClick={handleUpload}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </Button>
                )}

                {(uploadState === 'error' || uploadState === 'complete') && (
                  <Button onClick={resetUpload} variant="outline" size="lg">
                    Upload Another
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8 text-center"
        >
          How Resume Verification Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Upload className="w-6 h-6" />,
              title: 'Upload',
              desc: 'Upload your resume in PDF or Word format',
              num: 1,
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: 'AI Analysis',
              desc: 'Our AI extracts and scores your qualifications',
              num: 2,
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: 'Verify',
              desc: 'Get a blockchain hash for instant verification',
              num: 3,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-xl text-center relative"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                {feature.num}
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-foreground/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
