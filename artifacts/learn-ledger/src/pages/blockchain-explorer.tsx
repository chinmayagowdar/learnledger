import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Home,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface Transaction {
  tx_hash: string;
  entity_type: string;
  entity_id: string;
  document_hash: string;
  block_number: number;
  timestamp: string;
  status: string;
  chain_id: string;
}

interface BlockExplorerData {
  transaction: Transaction;
  entity: any;
  verification: {
    documentHash: string;
    blockNumber: number;
    confirmed: boolean;
    chainId: string;
  };
}

export default function BlockExplorerPage({ txHash }: { txHash: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BlockExplorerData | null>(null);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/blockchain/tx/${txHash}`);
        if (!response.ok) throw new Error('Transaction not found');

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [txHash]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent"
          />
          <p className="text-foreground/60">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-500">Error</p>
              <p className="text-sm text-foreground/70 mt-1">{error}</p>
            </div>
          </motion.div>
          <Button onClick={() => setLocation("/")}} className="rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            Back Home
          </Button>
        </div>
      </div>
    );
  }

  const { transaction, entity, verification } = data;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Block Explorer</h1>
          </div>
          <p className="text-foreground/60">Explore transaction and verification details on LearnLedger blockchain.</p>
        </motion.div>

        {/* Transaction Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Transaction Status</h2>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
            >
              {verification.confirmed ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">Confirmed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                  <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                  <span className="text-sm font-semibold text-yellow-500">Pending</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-background/50 rounded-lg border border-foreground/10">
            {[
              ['Transaction Hash', transaction.tx_hash],
              ['Block Number', `#${transaction.block_number.toLocaleString()}`],
              ['Entity Type', transaction.entity_type.charAt(0).toUpperCase() + transaction.entity_type.slice(1)],
              ['Chain ID', transaction.chain_id],
              ['Timestamp', new Date(transaction.timestamp).toLocaleString()],
              ['Status', verification.confirmed ? 'Confirmed' : 'Pending'],
            ].map(([label, value]) => (
              <div key={label} className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold">{label}</p>
                <div className="flex items-center gap-2 group">
                  <p className="font-mono text-sm font-semibold break-all">{value}</p>
                  {(label.includes('Hash') || label.includes('ID')) && (
                    <button
                      onClick={() => copyToClipboard(value as string)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4 text-foreground/50 hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Document Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold">Document Verification</h2>

          <div className="space-y-4 p-6 bg-background/50 rounded-lg border border-foreground/10">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold">Document Hash (SHA-256)</p>
              <div className="flex items-center gap-2 group">
                <p className="font-mono text-xs break-all bg-background p-3 rounded border border-foreground/5">
                  {verification.documentHash}
                </p>
                <button
                  onClick={() => copyToClipboard(verification.documentHash)}
                  className="flex-shrink-0"
                  title="Copy"
                >
                  <Copy className="w-4 h-4 text-foreground/50 hover:text-foreground transition-colors" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-foreground/10">
              {[
                ['Verification Status', verification.confirmed ? '✓ Verified' : 'Pending Verification'],
                ['Block Confirmations', verification.blockNumber > 1000 ? '1000+' : verification.blockNumber],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-1">
                    {label}
                  </p>
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Entity Details */}
        {entity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold">
              {transaction.entity_type === 'certificate' ? 'Certificate' : 'Resume'} Details
            </h2>

            {transaction.entity_type === 'certificate' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-background/50 rounded-lg border border-foreground/10">
                {[
                  ['Certificate ID', entity.certificate_id],
                  ['Recipient Name', entity.recipient_name],
                  ['Skill Title', entity.skill_title],
                  ['Issued By', entity.issued_by],
                  ['Issued At', entity.issued_at],
                  ['Expires At', entity.expires_at || 'Never'],
                  ['Is Verified', entity.is_verified ? '✓ Yes' : 'No'],
                  ['Views', entity.views || 0],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-1">
                      {label}
                    </p>
                    <p className="font-semibold break-all">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-background/50 rounded-lg border border-foreground/10">
                {[
                  ['File Name', entity.file_name],
                  ['File Size', `${Math.round(entity.file_size / 1024)} KB`],
                  ['AI Score', `${entity.ai_score}/100`],
                  ['Is Verified', entity.is_verified ? '✓ Yes' : 'No'],
                  ['Views', entity.views || 0],
                  ['Created At', new Date(entity.created_at).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold mb-1">
                      {label}
                    </p>
                    <p className="font-semibold break-all">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {(transaction.entity_type === 'resume' || transaction.entity_type === 'certificate') && entity.ai_feedback && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-foreground">AI Feedback:</p>
                <p className="text-sm text-foreground/70">{entity.ai_feedback}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Network Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-lg">Network Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Network', value: verification.chainId },
              { label: 'Network Type', value: 'Mainnet' },
              { label: 'Block Time', value: '~2s' },
              { label: 'Finality', value: 'Immediate' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-semibold">{item.label}</p>
                <p className="font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button onClick={() => setLocation("/")}} variant="outline" className="flex-1 rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            Back Home
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white rounded-lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
