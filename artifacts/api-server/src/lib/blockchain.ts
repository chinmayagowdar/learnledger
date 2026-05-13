import crypto from 'crypto';

/**
 * Calculate SHA-256 hash of data
 */
export function calculateHash(data: string | Buffer): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Generate a simulated blockchain transaction hash
 */
export function generateTxHash(): string {
  const randomBytes = crypto.randomBytes(32);
  return '0x' + randomBytes.toString('hex');
}

/**
 * Simulate blockchain registration
 * Returns a mock blockchain record with simulated block/tx data
 */
export function simulateBlockchainRegistration(documentHash: string, entityType: 'certificate' | 'resume', entityId: string) {
  const blockNumber = Math.floor(Math.random() * 1000000) + 18000000; // Simulated block number (post-2024)
  const txHash = generateTxHash();
  
  return {
    tx_hash: txHash,
    entity_type: entityType,
    entity_id: entityId,
    document_hash: documentHash,
    block_number: blockNumber,
    timestamp: new Date().toISOString(),
    sender_address: generateEthereumAddress(),
    status: 'confirmed' as const,
    chain_id: 'learnledger-mainnet',
  };
}

/**
 * Generate a simulated Ethereum-like address
 */
export function generateEthereumAddress(): string {
  const randomBytes = crypto.randomBytes(20);
  return '0x' + randomBytes.toString('hex');
}

/**
 * Extract text from PDF (placeholder - in production use pdfparse or similar)
 */
export function extractTextFromPdf(_buffer: Buffer): string {
  // In production, use a proper PDF library like pdf-parse or pdfjs-dist
  // For now, return placeholder
  return '[PDF text extraction - requires pdf-parse library]';
}

/**
 * Mock AI resume scoring
 * In production, integrate with OpenAI, Gemini, or other LLM
 */
export function scoreResumeMock(resumeText: string): { score: number; feedback: string } {
  // Keywords and experience indicators
  const skillKeywords = ['python', 'javascript', 'react', 'nodejs', 'sql', 'docker', 'aws', 'kubernetes', 'typescript'];
  const experienceKeywords = ['senior', 'lead', 'architect', 'manager', 'principal'];
  const educationKeywords = ['bachelor', 'master', 'phd', 'certification'];

  let score = 50; // Base score
  const lowerText = resumeText.toLowerCase();

  // Score based on skills found
  const skillsFound = skillKeywords.filter(skill => lowerText.includes(skill)).length;
  score += Math.min(skillsFound * 5, 20); // Max +20 for skills

  // Score based on experience level
  const experienceFound = experienceKeywords.filter(exp => lowerText.includes(exp)).length;
  score += Math.min(experienceFound * 3, 15); // Max +15 for experience

  // Score based on education
  const educationFound = educationKeywords.filter(edu => lowerText.includes(edu)).length;
  score += Math.min(educationFound * 2, 10); // Max +10 for education

  // Penalty for very short text
  if (resumeText.length < 500) {
    score -= 10;
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  const feedback = generateMockFeedback(score, skillsFound, experienceFound);

  return { score: Math.round(score), feedback };
}

function generateMockFeedback(score: number, skillsCount: number, experienceCount: number): string {
  let feedback = '';

  if (score >= 85) {
    feedback = `Excellent resume! Strong skills profile with ${skillsCount} key technologies and ${experienceCount} indicators of senior experience. Well-structured and comprehensive.`;
  } else if (score >= 70) {
    feedback = `Good resume with solid foundation. You have ${skillsCount} relevant skills mentioned. Consider expanding on your ${experienceCount} areas of expertise and adding more specific achievements.`;
  } else if (score >= 60) {
    feedback = `Your resume shows potential. You've mentioned ${skillsCount} relevant skills. To improve, add more specific project details, metrics, and clarify your experience level.`;
  } else if (score >= 50) {
    feedback = `Basic resume structure. With ${skillsCount} skills mentioned, consider expanding your technical background, adding quantifiable achievements, and providing more context about your experience.`;
  } else {
    feedback = `Resume needs improvement. Add more relevant skills (currently ${skillsCount}), clarify your professional experience, and include specific accomplishments with measurable results.`;
  }

  return feedback;
}
