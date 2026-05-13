import { Router, type IRouter, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import {
  calculateHash,
  simulateBlockchainRegistration,
  scoreResumeMock,
  extractTextFromPdf,
} from '../lib/blockchain.js';
import { logger } from '../lib/logger.js';

const router: IRouter = Router();

/**
 * POST /api/resumes/upload
 * Upload and parse a resume (PDF or text)
 *
 * Body: FormData with:
 *   - file: File (PDF or text)
 *   - userId: string
 *   - fileName: string (optional, defaults to uploaded filename)
 */
router.post('/resumes/upload', async (req: Request, res: Response) => {
  try {
    const { userId, fileName: providedFileName } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, error: 'Missing userId' });
      return;
    }

    // For now, expect file content in base64 or text in request body
    // In production, use multer for file upload
    let fileContent = req.body.fileContent || '';
    const fileName = providedFileName || 'resume.txt';

    if (!fileContent) {
      res.status(400).json({ success: false, error: 'No file content provided' });
      return;
    }

    // Calculate file hash
    const fileBuffer = Buffer.from(fileContent, 'utf-8');
    const fileHash = calculateHash(fileBuffer);

    // Extract and parse text
    let resumeText = fileContent;
    if (fileName.endsWith('.pdf')) {
      // In production, use pdf-parse
      resumeText = extractTextFromPdf(fileBuffer);
    }

    // Score with mock AI
    const { score, feedback } = scoreResumeMock(resumeText);

    // Simulate blockchain registration
    const blockchainRecord = simulateBlockchainRegistration(fileHash, 'resume', userId);

    // Store in Supabase
    const { data, error } = await supabase.from('resumes').insert({
      user_id: userId,
      file_name: fileName,
      file_size: fileBuffer.length,
      file_hash: fileHash,
      original_text: resumeText,
      parsed_data: {
        extracted_at: new Date().toISOString(),
        file_type: fileName.endsWith('.pdf') ? 'pdf' : 'text',
      },
      ai_score: score,
      ai_feedback: feedback,
      blockchain_hash: blockchainRecord.tx_hash,
    }).select();

    if (error) {
      logger.error('Failed to store resume', { error });
      res.status(500).json({ success: false, error: 'Failed to store resume' });
      return;
    }

    // Store blockchain record
    const { error: blockchainError } = await supabase
      .from('blockchain_records')
      .insert({
        ...blockchainRecord,
        entity_id: data?.[0]?.id || userId,
      });

    if (blockchainError) {
      logger.error('Failed to store blockchain record', { error: blockchainError });
    }

    res.json({
      success: true,
      resume: data?.[0],
      aiScore: score,
      aiFeedback: feedback,
      blockchainTx: blockchainRecord.tx_hash,
    });
  } catch (error) {
    logger.error('Resume upload error', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/resumes/:resumeId
 * Get resume details with AI score and blockchain info
 */
router.get('/resumes/:resumeId', async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.params;

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) {
      res.status(404).json({ success: false, error: 'Resume not found' });
      return;
    }

    // Get blockchain record if exists
    const { data: blockchainData } = await supabase
      .from('blockchain_records')
      .select('*')
      .eq('entity_id', resumeId)
      .eq('entity_type', 'resume')
      .single();

    res.json({
      success: true,
      resume: data,
      blockchain: blockchainData,
    });
  } catch (error) {
    logger.error('Failed to get resume', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/resumes/user/:userId
 * Get all resumes for a user
 */
router.get('/resumes/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get user resumes', { error });
      res.status(500).json({ success: false, error: 'Failed to fetch resumes' });
      return;
    }

    res.json({ success: true, resumes: data || [] });
  } catch (error) {
    logger.error('Failed to get resumes', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/resumes/:resumeId/verify
 * Verify resume on blockchain
 */
router.post('/resumes/:resumeId/verify', async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.params;

    // Get the resume
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (fetchError || !resume) {
      res.status(404).json({ success: false, error: 'Resume not found' });
      return;
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ is_verified: true })
      .eq('id', resumeId);

    if (updateError) {
      logger.error('Failed to verify resume', { error: updateError });
      res.status(500).json({ success: false, error: 'Failed to verify resume' });
      return;
    }

    // Get updated blockchain info
    const { data: blockchainData } = await supabase
      .from('blockchain_records')
      .select('*')
      .eq('entity_id', resumeId)
      .eq('entity_type', 'resume')
      .single();

    res.json({
      success: true,
      message: 'Resume verified on blockchain',
      resume: { ...resume, is_verified: true },
      blockchain: blockchainData,
    });
  } catch (error) {
    logger.error('Resume verification error', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
