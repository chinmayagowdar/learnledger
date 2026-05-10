'use client';

import { useState } from 'react';
import { Play, RotateCcw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden?: boolean;
}

interface CodeEditorProps {
  starterCode: Record<string, string>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;
  onSubmit: (code: string, language: string, results: TestResult[]) => void;
  className?: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'python', label: 'Python', pistonLang: 'python', version: '3.10.0' },
  { value: 'javascript', label: 'JavaScript', pistonLang: 'javascript', version: '18.15.0' },
  { value: 'java', label: 'Java', pistonLang: 'java', version: '15.0.2' },
  { value: 'sql', label: 'SQL', pistonLang: 'sql', version: '3.36.0' },
];

export default function CodeEditor({
  starterCode,
  testCases,
  onSubmit,
  className,
}: CodeEditorProps) {
  const availableLanguages = LANGUAGE_OPTIONS.filter((lang) => starterCode[lang.value]);
  const [selectedLanguage, setSelectedLanguage] = useState(availableLanguages[0]?.value || 'python');
  const [code, setCode] = useState(starterCode[selectedLanguage] || '');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [output, setOutput] = useState<string>('');

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setCode(starterCode[lang] || '');
    setResults([]);
    setOutput('');
  };

  const handleReset = () => {
    setCode(starterCode[selectedLanguage] || '');
    setResults([]);
    setOutput('');
  };

  const runCode = async () => {
    setIsRunning(true);
    setResults([]);
    setOutput('');

    try {
      const langConfig = LANGUAGE_OPTIONS.find((l) => l.value === selectedLanguage);
      if (!langConfig) throw new Error('Language not supported');

      // Execute code using Piston API
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langConfig.pistonLang,
          version: langConfig.version,
          code,
          testCases: testCases.map((tc) => tc.input),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setOutput(`Error: ${data.error}`);
        return;
      }

      // Process results
      const testResults: TestResult[] = testCases.map((tc, index) => {
        const actualOutput = data.outputs?.[index]?.trim() || '';
        const expectedOutput = tc.expectedOutput.trim();
        return {
          input: tc.input,
          expectedOutput,
          actualOutput,
          passed: actualOutput === expectedOutput,
          isHidden: tc.isHidden,
        };
      });

      setResults(testResults);
      setOutput(data.stdout || data.stderr || 'Execution complete');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to execute code'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(code, selectedLanguage, results);
  };

  const passedCount = results.filter((r) => r.passed).length;
  const visibleResults = results.filter((r) => !r.isHidden);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="gradient-primary text-white"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={cn(
            'w-full h-[300px] p-4 rounded-xl font-mono text-sm',
            'bg-muted/50 border border-border',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            'resize-none'
          )}
          spellCheck={false}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {code.split('\n').length} lines
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <h4 className="text-sm font-medium mb-2">Output</h4>
          <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}

      {/* Test results */}
      {visibleResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Test Results</h4>
            <span className="text-sm text-muted-foreground">
              {passedCount}/{testCases.length} passed
            </span>
          </div>

          <div className="space-y-2">
            {visibleResults.map((result, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border',
                  result.passed ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">Test Case {index + 1}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground">Input:</span>
                    <div className="mt-1 p-1 bg-muted rounded">{result.input}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected:</span>
                    <div className="mt-1 p-1 bg-muted rounded">{result.expectedOutput}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actual:</span>
                    <div className="mt-1 p-1 bg-muted rounded">{result.actualOutput || '(no output)'}</div>
                  </div>
                </div>
              </div>
            ))}

            {results.some((r) => r.isHidden) && (
              <p className="text-xs text-muted-foreground">
                + {results.filter((r) => r.isHidden).length} hidden test case(s)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit button */}
      {results.length > 0 && (
        <Button
          onClick={handleSubmit}
          className="w-full gradient-primary text-white"
          disabled={passedCount < testCases.filter((tc) => !tc.isHidden).length}
        >
          Submit Solution
        </Button>
      )}
    </div>
  );
}
