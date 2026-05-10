import { NextRequest, NextResponse } from 'next/server';

const PISTON_API = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';

interface ExecuteRequest {
  language: string;
  version: string;
  code: string;
  testCases?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { language, version, code, testCases = [] } = body;

    if (!language || !code) {
      return NextResponse.json(
        { error: 'Language and code are required' },
        { status: 400 }
      );
    }

    // If we have test cases, run the code for each test case
    if (testCases.length > 0) {
      const outputs: string[] = [];

      for (const testInput of testCases) {
        const response = await fetch(PISTON_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language,
            version,
            files: [
              {
                name: getFileName(language),
                content: code,
              },
            ],
            stdin: testInput,
            args: [],
            compile_timeout: 10000,
            run_timeout: 5000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return NextResponse.json(
            { error: `Piston API error: ${errorText}` },
            { status: response.status }
          );
        }

        const result = await response.json();

        if (result.run?.stderr) {
          outputs.push(`Error: ${result.run.stderr}`);
        } else {
          outputs.push(result.run?.stdout || '');
        }
      }

      return NextResponse.json({
        success: true,
        outputs,
      });
    }

    // Single execution without test cases
    const response = await fetch(PISTON_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        version,
        files: [
          {
            name: getFileName(language),
            content: code,
          },
        ],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Piston API error: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      stdout: result.run?.stdout || '',
      stderr: result.run?.stderr || '',
      code: result.run?.code || 0,
      signal: result.run?.signal || null,
    });
  } catch (error) {
    console.error('Execute API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute code' },
      { status: 500 }
    );
  }
}

function getFileName(language: string): string {
  const extensions: Record<string, string> = {
    python: 'main.py',
    javascript: 'main.js',
    java: 'Main.java',
    c: 'main.c',
    cpp: 'main.cpp',
    go: 'main.go',
    rust: 'main.rs',
    ruby: 'main.rb',
    php: 'main.php',
    sql: 'query.sql',
  };

  return extensions[language] || 'main.txt';
}
