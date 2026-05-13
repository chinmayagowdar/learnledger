import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  resumeId?: string;
}

export default function ResumeUploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', message: '' });
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9)); // Mock user ID
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadState({ status: 'uploading', message: 'Reading file...' });

    try {
      const text = await file.text();
      setFileContent(text);
      setUploadState({ status: 'idle', message: '' });
    } catch (error) {
      setUploadState({
        status: 'error',
        message: 'Failed to read file. Please ensure it is a valid text or PDF file.',
      });
    }
  };

  const handleUpload = async () => {
    if (!fileContent) {
      setUploadState({ status: 'error', message: 'Please select a file first' });
      return;
    }

    setUploadState({ status: 'processing', message: 'Uploading and analyzing resume...' });

    try {
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fileName,
          fileContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUploadState({
          status: 'success',
          message: 'Resume uploaded and analyzed successfully!',
          resumeId: data.resume.id,
        });
        // Redirect to results page after 2 seconds
        setTimeout(() => {
          setLocation(`/resume/result/${data.resume.id}`);
        }, 2000);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      setUploadState({
        status: 'error',
        message: error.message || 'Failed to upload resume',
      });
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Upload & Analyze Resume</h1>
          <p className="text-foreground/60">
            Upload your resume for AI-powered analysis and blockchain verification.
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-8 space-y-6"
        >
          {/* Upload area */}
          {uploadState.status === 'idle' && !fileContent && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center cursor-pointer hover:border-primary/60 transition-colors"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag and drop or click to upload</h3>
              <p className="text-sm text-foreground/60 mb-4">Supported formats: PDF, TXT</p>
              <p className="text-xs text-foreground/50">Maximum file size: 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* File selected */}
          {fileContent && uploadState.status === 'idle' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">{fileName}</p>
                  <p className="text-sm text-foreground/60">
                    {Math.round(fileContent.length / 1024)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFileName('');
                    setFileContent('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-sm text-foreground/60 hover:text-foreground"
                >
                  Remove
                </button>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="max-h-48 bg-background/50 rounded-lg p-4 overflow-y-auto text-sm text-foreground/70 border border-foreground/10">
                  {fileContent.substring(0, 500)}...
                </div>
              </div>

              <Button
                onClick={handleUpload}
                className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Analyze with AI
              </Button>
            </div>
          )}

          {/* Processing states */}
          {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
            <div className="text-center py-12 space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent"
              />
              <div>
                <p className="text-lg font-semibold text-foreground">{uploadState.message}</p>
                <p className="text-sm text-foreground/60 mt-2">This may take a moment...</p>
              </div>
            </div>
          )}

          {/* Success state */}
          {uploadState.status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-green-500 mb-2">Resume Analyzed!</h3>
                <p className="text-foreground/60">Your resume has been uploaded and analyzed with AI.</p>
              </div>
              <p className="text-sm text-foreground/50">Redirecting to results...</p>
            </motion.div>
          )}

          {/* Error state */}
          {uploadState.status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
            >
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-500">Error</p>
                <p className="text-sm text-foreground/70 mt-1">{uploadState.message}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Info section */}
        {uploadState.status === 'idle' && !fileContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-lg">What happens next?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {[
                {
                  icon: <FileText className="w-5 h-5" />,
                  title: 'Upload',
                  desc: 'Your resume is securely uploaded to our servers.',
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: 'AI Analysis',
                  desc: 'Our AI analyzes your skills, experience, and structure.',
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5" />,
                  title: 'Blockchain',
                  desc: 'Results are registered on our blockchain for verification.',
                },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="text-primary flex-shrink-0">{step.icon}</div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{step.title}</p>
                    <p className="text-foreground/60">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
