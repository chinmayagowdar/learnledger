'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function VerifyPage() {
  // Sample credential data - in a real app, this would come from URL params or an API
  const credential = {
    title: 'React Advanced',
    issuer: 'Tech Academy Pro',
    date: 'December 15, 2024',
    credentialId: 'REACT-ADV-20241215-001',
    blockchainHash: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    verified: true,
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Verification Status */}
        <div className="glass p-12 rounded-xl text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            {credential.verified ? (
              <div className="relative">
                <CheckCircle className="w-24 h-24 text-green-500" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-green-500 opacity-50"
                />
              </div>
            ) : (
              <AlertCircle className="w-24 h-24 text-yellow-500" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              {credential.verified ? 'Credential Verified' : 'Verification Pending'}
            </h1>
            <p className="text-xl text-foreground/70">
              {credential.verified
                ? 'This credential has been verified on the blockchain.'
                : 'This credential is being verified. Please check back soon.'}
            </p>
          </motion.div>
        </div>

        {/* Credential Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass p-8 rounded-xl space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credential Info */}
            <div className="space-y-4">
              <div>
                <p className="text-foreground/60 text-sm font-medium">Credential Title</p>
                <p className="text-2xl font-bold mt-1">{credential.title}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm font-medium">Issued By</p>
                <p className="text-lg mt-1">{credential.issuer}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm font-medium">Issue Date</p>
                <p className="text-lg mt-1">{credential.date}</p>
              </div>
            </div>

            {/* QR Code */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex justify-center items-center"
            >
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={`https://learnledger.io/verify/${credential.credentialId}`}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </motion.div>
          </div>

          {/* Blockchain Hash */}
          <div className="border-t border-border/50 pt-6">
            <p className="text-foreground/60 text-sm font-medium mb-2">Blockchain Hash</p>
            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm break-all">
              <code className="text-foreground/70">{credential.blockchainHash}</code>
            </div>
          </div>

          {/* Credential ID */}
          <div>
            <p className="text-foreground/60 text-sm font-medium mb-2">Credential ID</p>
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
              <code className="text-foreground/70">{credential.credentialId}</code>
            </div>
          </div>
        </motion.div>

        {/* Verification Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass p-6 rounded-xl space-y-3 text-sm"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Blockchain Verified</p>
              <p className="text-foreground/60">This credential is recorded on the blockchain</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Issuer Verified</p>
              <p className="text-foreground/60">The issuer organization is verified</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Not Revoked</p>
              <p className="text-foreground/60">This credential has not been revoked</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
