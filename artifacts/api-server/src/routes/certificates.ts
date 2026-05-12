import { Router, type IRouter } from 'express';
import QRCode from 'qrcode';
import {
  verifyCertificate,
  issueCertificate,
  listCertificates,
  type Certificate,
} from '../lib/certificate-store.js';

const router: IRouter = Router();

/**
 * POST /api/verify-certificate
 * Body: { id: string, name: string }
 * Returns:
 *   { valid: true,  details: Certificate }
 *   { valid: false, reason: string }
 */
router.post('/verify-certificate', (req, res) => {
  const { id, name } = req.body ?? {};

  if (typeof id !== 'string' || !id.trim()) {
    res.status(400).json({ valid: false, reason: 'Missing or invalid certificate ID' });
    return;
  }
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ valid: false, reason: 'Missing or invalid name' });
    return;
  }

  const result = verifyCertificate(id.trim(), name.trim());

  if (result.valid) {
    res.json({ valid: true, details: result.certificate });
  } else {
    res.json({ valid: false, reason: result.reason });
  }
});

/**
 * POST /api/issue-certificate
 * Body: { certificate_id, recipient_name, skill_title, issued_by, issued_at, expires_at }
 * Returns: { success: true, qrCodeDataUrl: string, certificate: Certificate }
 *
 * The QR code encodes: { "id": "CERT-123", "name": "John Doe" }
 */
router.post('/issue-certificate', async (req, res) => {
  const { certificate_id, recipient_name, skill_title, issued_by, issued_at, expires_at } =
    req.body ?? {};

  // Validate required fields
  const missing = ['certificate_id', 'recipient_name', 'skill_title'].filter(
    (k) => typeof req.body[k] !== 'string' || !req.body[k].trim(),
  );
  if (missing.length > 0) {
    res.status(400).json({ success: false, reason: `Missing fields: ${missing.join(', ')}` });
    return;
  }

  const cert: Certificate = {
    certificate_id: String(certificate_id).trim(),
    recipient_name: String(recipient_name).trim(),
    skill_title: String(skill_title).trim(),
    issued_by: String(issued_by || 'LearnLedger').trim(),
    issued_at: String(issued_at || new Date().toISOString().split('T')[0]),
    expires_at: String(
      expires_at ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ),
  };

  // Persist to in-memory store
  issueCertificate(cert);

  // Generate QR code that encodes { id, name } as JSON
  const qrPayload = JSON.stringify({ id: cert.certificate_id, name: cert.recipient_name });
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' },
    });
    res.json({ success: true, qrCodeDataUrl, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, reason: 'Failed to generate QR code' });
  }
});

/**
 * GET /api/certificates
 * Returns all issued certificates (admin only — add auth in production).
 */
router.get('/certificates', (_req, res) => {
  res.json({ certificates: listCertificates() });
});

export default router;
