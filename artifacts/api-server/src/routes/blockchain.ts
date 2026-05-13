import { Router, type IRouter, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

const router: IRouter = Router();

/**
 * GET /api/blockchain/tx/:txHash
 * Get transaction details from blockchain
 */
router.get('/blockchain/tx/:txHash', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;

    const { data, error } = await supabase
      .from('blockchain_records')
      .select('*')
      .eq('tx_hash', txHash)
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Get the related entity (certificate or resume)
    let entityData = null;
    if (data.entity_type === 'certificate') {
      const { data: cert } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', data.entity_id)
        .single();
      entityData = cert;
    } else if (data.entity_type === 'resume') {
      const { data: resume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', data.entity_id)
        .single();
      entityData = resume;
    }

    res.json({
      success: true,
      transaction: data,
      entity: entityData,
      verification: {
        documentHash: data.document_hash,
        blockNumber: data.block_number,
        confirmed: data.status === 'confirmed',
        chainId: data.chain_id,
      },
    });
  } catch (error) {
    logger.error('Failed to get transaction', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/blockchain/blocks?limit=20&offset=0
 * Get recent blocks from the ledger
 */
router.get('/blockchain/blocks', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    // Get unique block numbers sorted descending
    const { data, error, count } = await supabase
      .from('blockchain_records')
      .select('*', { count: 'exact' })
      .order('block_number', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to get blocks', { error });
      res.status(500).json({ success: false, error: 'Failed to fetch blocks' });
      return;
    }

    // Group by block number
    const blocks = new Map();
    data?.forEach((record) => {
      if (!blocks.has(record.block_number)) {
        blocks.set(record.block_number, {
          blockNumber: record.block_number,
          timestamp: record.timestamp,
          transactionCount: 0,
          transactions: [],
        });
      }
      const block = blocks.get(record.block_number);
      block.transactionCount += 1;
      block.transactions.push({
        txHash: record.tx_hash,
        entityType: record.entity_type,
        status: record.status,
      });
    });

    const blocksList = Array.from(blocks.values());

    res.json({
      success: true,
      blocks: blocksList,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error) {
    logger.error('Blockchain blocks error', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/blockchain/stats
 * Get overall blockchain statistics
 */
router.get('/blockchain/stats', async (req: Request, res: Response) => {
  try {
    // Count total transactions
    const { count: totalTx } = await supabase
      .from('blockchain_records')
      .select('*', { count: 'exact', head: true });

    // Count total certificates
    const { count: certCount } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true });

    // Count total resumes
    const { count: resumeCount } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true });

    // Get unique block count
    const { data: blockData } = await supabase
      .from('blockchain_records')
      .select('block_number')
      .order('block_number', { ascending: false })
      .limit(1);

    const latestBlockNumber = blockData?.[0]?.block_number || 0;

    res.json({
      success: true,
      stats: {
        totalTransactions: totalTx || 0,
        totalCertificates: certCount || 0,
        totalResumes: resumeCount || 0,
        latestBlockNumber,
        chainId: 'learnledger-mainnet',
        networkName: 'LearnLedger Mainnet',
      },
    });
  } catch (error) {
    logger.error('Failed to get blockchain stats', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/blockchain/verify/:documentHash
 * Verify a document on the blockchain
 */
router.get('/blockchain/verify/:documentHash', async (req: Request, res: Response) => {
  try {
    const { documentHash } = req.params;

    const { data, error } = await supabase
      .from('blockchain_records')
      .select('*')
      .eq('document_hash', documentHash)
      .single();

    if (error || !data) {
      res.status(404).json({
        success: false,
        verified: false,
        error: 'Document not found on blockchain',
      });
      return;
    }

    res.json({
      success: true,
      verified: true,
      documentHash,
      txHash: data.tx_hash,
      blockNumber: data.block_number,
      timestamp: data.timestamp,
      entityType: data.entity_type,
      status: data.status,
      chainId: data.chain_id,
    });
  } catch (error) {
    logger.error('Document verification error', { error });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
