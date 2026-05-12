import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Plus, RefreshCw, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IssuedCertificate {
  certificate_id: string;
  recipient_name: string;
  skill_title: string;
  issued_by: string;
  issued_at: string;
  expires_at: string;
}

interface IssueResult {
  success: boolean;
  qrCodeDataUrl?: string;
  certificate?: IssuedCertificate;
  reason?: string;
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function issueNewCertificate(fields: {
  certificate_id: string;
  recipient_name: string;
  skill_title: string;
  issued_by: string;
  issued_at: string;
  expires_at: string;
}): Promise<IssueResult> {
  const res = await fetch('/api/issue-certificate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ reason: `Server error ${res.status}` }));
    return { success: false, reason: err.reason ?? 'Unknown error' };
  }
  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

function newId() {
  return `CERT-${Date.now().toString().slice(-6)}`;
}

export default function AdminIssuePage() {
  const [form, setForm] = useState({
    certificate_id: newId(),
    recipient_name: '',
    skill_title: '',
    issued_by: 'LearnLedger',
    issued_at: today,
    expires_at: nextYear,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IssueResult | null>(null);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await issueNewCertificate(form);
      setResult(res);
    } catch (err: any) {
      setResult({ success: false, reason: err.message ?? 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setForm({
      certificate_id: newId(),
      recipient_name: '',
      skill_title: '',
      issued_by: 'LearnLedger',
      issued_at: today,
      expires_at: nextYear,
    });
  };

  const handleDownloadQR = () => {
    if (!result?.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = result.qrCodeDataUrl;
    a.download = `${result.certificate?.certificate_id ?? 'certificate'}-qr.png`;
    a.click();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Issue Certificate</h1>
          </div>
          <p className="text-foreground/60 ml-13">
            Create a new certificate and generate its QR code for printing or digital distribution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-6">Certificate Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {([
                { field: 'certificate_id', label: 'Certificate ID', placeholder: 'e.g. CERT-001', required: true },
                { field: 'recipient_name', label: 'Recipient Name', placeholder: 'e.g. John Doe', required: true },
                { field: 'skill_title', label: 'Skill / Course Title', placeholder: 'e.g. React Advanced', required: true },
                { field: 'issued_by', label: 'Issued By', placeholder: 'e.g. Tech Academy Pro', required: false },
                { field: 'issued_at', label: 'Issue Date', placeholder: '', required: false, type: 'date' },
                { field: 'expires_at', label: 'Expiry Date', placeholder: '', required: false, type: 'date' },
              ] as Array<{ field: keyof typeof form; label: string; placeholder: string; required: boolean; type?: string }>).map(({ field, label, placeholder, required, type }) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor={field}>
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    id={field}
                    type={type ?? 'text'}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={handleChange(field)}
                    required={required}
                    className="rounded-lg bg-background/50"
                  />
                </div>
              ))}

              <div className="pt-2 flex gap-3">
                <Button
                  type="submit"
                  disabled={loading || !form.recipient_name.trim() || !form.skill_title.trim()}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white rounded-lg"
                >
                  {loading ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">
                      <RefreshCw className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" />Issue Certificate</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">
                  Reset
                </Button>
              </div>
            </form>
          </motion.div>

          {/* QR Code / result panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-8 flex flex-col">
            <h2 className="text-xl font-semibold mb-6">Generated QR Code</h2>

            <AnimatePresence mode="wait">
              {/* Loading */}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-foreground/60 text-sm">Generating…</p>
                </motion.div>
              )}

              {/* Success */}
              {!loading && result?.success && result.qrCodeDataUrl && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2 text-green-500 self-start">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">Certificate issued successfully</span>
                  </div>

                  {/* QR code image */}
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img src={result.qrCodeDataUrl} alt="Certificate QR Code" className="w-56 h-56" />
                  </div>
                  <p className="text-xs text-foreground/50 text-center max-w-xs">
                    This QR code encodes the certificate ID and recipient name. Scan it on the{' '}
                    <a href="/verify" className="underline text-primary">Verify</a> page to confirm authenticity.
                  </p>

                  {/* Certificate details summary */}
                  {result.certificate && (
                    <div className="w-full space-y-2 border-t border-foreground/10 pt-4 text-sm">
                      {([
                        ['ID', result.certificate.certificate_id],
                        ['Recipient', result.certificate.recipient_name],
                        ['Skill', result.certificate.skill_title],
                        ['Issued', result.certificate.issued_at],
                        ['Expires', result.certificate.expires_at],
                      ] as [string, string][]).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-foreground/50">{k}</span>
                          <span className="font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={handleDownloadQR} className="w-full rounded-lg bg-gradient-to-r from-primary to-accent text-white">
                    <Download className="w-4 h-4 mr-2" />Download QR Code
                  </Button>
                </motion.div>
              )}

              {/* Error */}
              {!loading && result && !result.success && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
                  <XCircle className="w-12 h-12 text-red-500" />
                  <p className="text-red-500 font-semibold text-center">{result.reason}</p>
                </motion.div>
              )}

              {/* Placeholder */}
              {!loading && !result && (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-foreground/20 rounded-xl">
                  <Award className="w-12 h-12 text-foreground/30" />
                  <p className="text-foreground/40 text-sm text-center">Fill in the form and click<br />"Issue Certificate" to generate the QR code</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* QR payload explanation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-6 space-y-3">
          <h3 className="font-semibold">QR Code payload format</h3>
          <p className="text-sm text-foreground/60">Each QR code encodes the following JSON, signed to the certificate record in the database:</p>
          <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-foreground/80 overflow-x-auto">
{`{
  "id": "${form.certificate_id}",
  "name": "${form.recipient_name || 'Recipient Name'}"
}`}
          </pre>
          <p className="text-xs text-foreground/50">
            The <code className="bg-muted px-1 rounded">POST /api/verify-certificate</code> endpoint accepts this JSON body, 
            queries the <code className="bg-muted px-1 rounded">certificates</code> table, and performs a case-insensitive name match.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
