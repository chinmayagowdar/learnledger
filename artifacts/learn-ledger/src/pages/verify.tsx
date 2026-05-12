import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Camera, RefreshCw, KeyboardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CertificateDetails {
  certificate_id: string;
  recipient_name: string;
  skill_title: string;
  issued_by: string;
  issued_at: string;
  expires_at: string;
}

type VerifyResult =
  | { valid: true; details: CertificateDetails }
  | { valid: false; reason: string };

type ScannerState = 'idle' | 'scanning' | 'loading' | 'done' | 'error';

// ─── API call ─────────────────────────────────────────────────────────────────

async function verifyCertificate(id: string, name: string): Promise<VerifyResult> {
  const res = await fetch('/api/verify-certificate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerifyPage() {
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualId, setManualId] = useState('');
  const [manualName, setManualName] = useState('');
  const [showManual, setShowManual] = useState(false);
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(false);

  // ── Start QR scanner ────────────────────────────────────────────────────────
  const startScanner = async () => {
    setScannerState('scanning');
    setResult(null);
    setErrorMsg('');

    // Dynamically import html5-qrcode to avoid SSR issues
    const { Html5Qrcode } = await import('html5-qrcode');

    // Clean up any previous instance
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR code successfully scanned
          await scanner.stop();
          scannerRef.current = null;
          await handleScannedText(decodedText);
        },
        () => { /* ignore scan errors (not found on frame) */ },
      );
    } catch (err: any) {
      setScannerState('error');
      setErrorMsg(err?.message ?? 'Camera access denied or not available');
    }
  };

  // ── Parse scanned text and call API ─────────────────────────────────────────
  const handleScannedText = async (text: string) => {
    setScannerState('loading');
    try {
      // QR code payload format: { "id": "CERT-123", "name": "John Doe" }
      let id: string;
      let name: string;

      try {
        const parsed = JSON.parse(text);
        id = parsed.id;
        name = parsed.name;
        if (!id || !name) throw new Error('Missing id or name in QR code');
      } catch {
        throw new Error('QR code does not contain valid certificate data (expected JSON with id and name)');
      }

      const res = await verifyCertificate(id, name);
      setResult(res);
      setScannerState('done');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Verification failed');
      setScannerState('error');
    }
  };

  // ── Manual entry submit ──────────────────────────────────────────────────────
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim() || !manualName.trim()) return;
    setScannerState('loading');
    setResult(null);
    setErrorMsg('');
    try {
      const res = await verifyCertificate(manualId.trim(), manualName.trim());
      setResult(res);
      setScannerState('done');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Verification failed');
      setScannerState('error');
    }
  };

  // ── Reset everything ─────────────────────────────────────────────────────────
  const reset = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScannerState('idle');
    setResult(null);
    setErrorMsg('');
    setManualId('');
    setManualName('');
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Verify Certificate</h1>
          <p className="text-foreground/60">
            Scan the QR code on a certificate to verify its authenticity instantly.
          </p>
        </motion.div>

        {/* Scanner / idle state */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-8 space-y-6">

          {/* QR reader mount point — always in DOM so html5-qrcode can attach */}
          <div
            id="qr-reader"
            className={`w-full rounded-lg overflow-hidden transition-all duration-300 ${scannerState === 'scanning' ? 'block' : 'hidden'}`}
            style={{ minHeight: scannerState === 'scanning' ? '300px' : '0' }}
          />

          {/* Idle: show scan button */}
          {scannerState === 'idle' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-2xl gradient-primary flex items-center justify-center">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
                <p className="text-sm text-foreground/60">Point your camera at the QR code on the certificate</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={startScanner} className="bg-gradient-to-r from-primary to-accent text-white rounded-lg">
                  <Camera className="w-4 h-4 mr-2" />Open Camera
                </Button>
                <Button variant="outline" onClick={() => setShowManual(!showManual)} className="rounded-lg">
                  <KeyboardIcon className="w-4 h-4 mr-2" />Enter Manually
                </Button>
              </div>
            </div>
          )}

          {/* Scanning: show stop button below mounted scanner */}
          {scannerState === 'scanning' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-foreground/70 animate-pulse">Scanning… point camera at QR code</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={reset} className="rounded-lg">
                  Stop
                </Button>
                <Button variant="ghost" onClick={() => setShowManual(!showManual)} className="rounded-lg">
                  <KeyboardIcon className="w-4 h-4 mr-2" />Enter Manually
                </Button>
              </div>
            </div>
          )}

          {/* Loading */}
          {scannerState === 'loading' && (
            <div className="text-center py-8 space-y-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-foreground/70 font-medium">Verifying certificate…</p>
            </div>
          )}

          {/* Result: done */}
          {scannerState === 'done' && result && (
            <AnimatePresence>
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {result.valid ? (
                  <>
                    <div className="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/40 rounded-xl">
                      <CheckCircle2 className="w-10 h-10 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-xl font-bold text-green-500">✅ Valid Certificate</p>
                        <p className="text-sm text-foreground/70">Name matches certificate records</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {([
                        ['Certificate ID', result.details.certificate_id],
                        ['Recipient', result.details.recipient_name],
                        ['Skill / Title', result.details.skill_title],
                        ['Issued By', result.details.issued_by],
                        ['Issued', result.details.issued_at],
                        ['Expires', result.details.expires_at],
                      ] as [string, string][]).map(([label, value]) => (
                        <div key={label} className="space-y-1">
                          <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold">{label}</p>
                          <p className="font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-4 p-5 bg-red-500/10 border border-red-500/40 rounded-xl">
                    <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-xl font-bold text-red-500">❌ Invalid or Name Mismatch</p>
                      <p className="text-sm text-foreground/70 mt-1">{result.reason}</p>
                    </div>
                  </div>
                )}
                <Button variant="outline" onClick={reset} className="w-full rounded-lg">
                  <RefreshCw className="w-4 h-4 mr-2" />Verify Another
                </Button>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Error state */}
          {scannerState === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-500">Error</p>
                  <p className="text-sm text-foreground/70 mt-1">{errorMsg}</p>
                </div>
              </div>
              <Button variant="outline" onClick={reset} className="w-full rounded-lg">
                <RefreshCw className="w-4 h-4 mr-2" />Try Again
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Manual entry form */}
        <AnimatePresence>
          {showManual && (scannerState === 'idle' || scannerState === 'scanning') && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-xl p-8 space-y-5"
            >
              <h2 className="text-xl font-semibold">Manual Entry</h2>
              <p className="text-sm text-foreground/60">Enter the certificate ID and recipient name to verify without scanning.</p>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="manual-id">Certificate ID</label>
                  <Input
                    id="manual-id"
                    placeholder="e.g. CERT-001"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    className="rounded-lg bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="manual-name">Recipient Name</label>
                  <Input
                    id="manual-name"
                    placeholder="e.g. John Doe"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="rounded-lg bg-background/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!manualId.trim() || !manualName.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-lg"
                >
                  Verify Certificate
                </Button>
              </form>

              {/* Demo hint */}
              <div className="pt-4 border-t border-foreground/10 text-xs text-foreground/50 space-y-1">
                <p className="font-semibold">Demo certificates to try:</p>
                <p>ID: <code className="bg-muted px-1 rounded">CERT-001</code> · Name: <code className="bg-muted px-1 rounded">John Doe</code></p>
                <p>ID: <code className="bg-muted px-1 rounded">CERT-002</code> · Name: <code className="bg-muted px-1 rounded">Jane Smith</code></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        {scannerState === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">How verification works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-foreground/70">
              {[
                { n: '1', t: 'Scan QR Code', d: 'The QR code on the certificate encodes the certificate ID and recipient name.' },
                { n: '2', t: 'Server Check', d: 'The ID and name are sent to our API, which checks the records and matches the name case-insensitively.' },
                { n: '3', t: 'Instant Result', d: "You see a clear ✅ Valid or ❌ Invalid result with the certificate's full details." },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{n}</div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{t}</p>
                    <p>{d}</p>
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
