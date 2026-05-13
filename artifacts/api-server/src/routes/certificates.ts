import { Router, type IRouter } from 'express';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase.js';
import { simulateBlockchainRegistration, calculateHash } from '../lib/blockchain.js';
import { logger } from '../lib/logger.js';
import type { Database } from '../lib/supabase.js';

const router: IRouter = Router();

/**
 * POST /api/verify-certificate
 * Body: { id: string, name: string }
 * Returns:
 *   { valid: true,  details: Certificate }
 *   { valid: false, reason: string }
 */
router.post('/verify-certificate', async (req, res) => {
  const { id, name } = req.body ?? {};

  if (typeof id !== 'string' || !id.trim()) {
    res.status(400).json({ valid: false, reason: 'Missing or invalid certificate ID' });
    return;
  }
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ valid: false, reason: 'Missing or invalid name' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_id', id.trim())
      .maybeSingle();

    if (error) {
      logger.error('Database error', { error });
      res.status(500).json({ valid: false, reason: 'Database error' });
      return;
    }

    if (!data) {
      res.json({ valid: false, reason: 'Certificate not found' });
      return;
    }

    // Case-insensitive name matching
    if (data.recipient_name.toLowerCase() !== name.trim().toLowerCase()) {
      res.json({ valid: false, reason: 'Name does not match certificate records' });
      return;
    }

    res.json({ valid: true, details: data });
  } catch (err) {
    logger.error('Verification error', { err });
    res.status(500).json({ valid: false, reason: 'Internal server error' });
  }
});

/**
 * POST /api/issue-certificate
 * Body: { certificate_id, recipient_name, skill_title, issued_by, issued_at, expires_at }
 * Returns: { success: true, qrCodeDataUrl: string, certificate: Certificate }
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

  try {
    const certData: Database['public']['Tables']['certificates']['Insert'] = {
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

    // Insert certificate into database
    const { data: insertedCert, error: insertError } = await supabase
      .from('certificates')
      .insert(certData)
      .select()
      .single();

    if (insertError) {
      logger.error('Failed to insert certificate', { error: insertError });
      res.status(500).json({ success: false, reason: 'Failed to issue certificate' });
      return;
    }

    // Generate QR code
    const qrPayload = JSON.stringify({
      id: insertedCert.certificate_id,
      name: insertedCert.recipient_name,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // Simulate blockchain registration
    const documentHash = calculateHash(JSON.stringify(insertedCert));
    const blockchainRecord = simulateBlockchainRegistration(documentHash, 'certificate', insertedCert.id);

    // Update certificate with blockchain hash
    await supabase
      .from('certificates')
      .update({ blockchain_hash: blockchainRecord.tx_hash })
      .eq('id', insertedCert.id);

    // Store blockchain record
    await supabase.from('blockchain_records').insert({
      ...blockchainRecord,
      entity_id: insertedCert.id,
    });

    res.json({
      success: true,
      qrCodeDataUrl,
      certificate: { ...insertedCert, blockchain_hash: blockchainRecord.tx_hash },
    });
  } catch (err) {
    logger.error('Certificate issuance error', { err });
    res.status(500).json({ success: false, reason: 'Failed to issue certificate' });
  }
});

/**
 * GET /api/certificates
 * Returns all issued certificates (admin only — add auth in production).
 */
router.get('/certificates', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch certificates', { error });
      res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
      return;
    }

    res.json({ success: true, certificates: data || [] });
  } catch (err) {
    logger.error('Certificates fetch error', { err });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
