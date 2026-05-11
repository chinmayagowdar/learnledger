import crypto from 'crypto';

/**
 * Generate a blockchain-style hash for a credential
 * In a real implementation, this would use actual blockchain APIs
 */
export function generateBlockchainHash(data: {
  credentialId: string;
  userId: string;
  timestamp: string;
}): string {
  const combined = `${data.credentialId}-${data.userId}-${data.timestamp}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Verify a blockchain hash
 * In a real implementation, this would check against actual blockchain
 */
export function verifyBlockchainHash(
  hash: string,
  data: {
    credentialId: string;
    userId: string;
    timestamp: string;
  }
): boolean {
  const expectedHash = generateBlockchainHash(data);
  return hash === expectedHash;
}

/**
 * Generate a Bitcoin-style address format for display
 */
export function generateWalletAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = 'bc1q';
  for (let i = 0; i < 39; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

/**
 * Create a shareable verification link
 */
export function createVerificationLink(credentialId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/verify/${credentialId}`;
}

/**
 * Mock blockchain verification status
 * In production, this would check actual blockchain
 */
export async function verifyCredentialOnBlockchain(
  credentialId: string,
  blockchainHash: string
): Promise<{
  isVerified: boolean;
  timestamp: string;
  blockNumber?: number;
  transactionHash?: string;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    isVerified: true,
    timestamp: new Date().toISOString(),
    blockNumber: Math.floor(Math.random() * 1000000),
    transactionHash: `0x${blockchainHash.substring(0, 64)}`,
  };
}

/**
 * Store credential hash on blockchain (mock implementation)
 * In production, this would interact with actual blockchain
 * 
 * Hash is computed as SHA-256 of: userId + skillId + finalScore + timestamp
 */
export async function storeCredentialHash(data: {
  credentialId: string;
  recipientId: string;
  skillId: string;
  skillName: string;
  score: number;
  rounds: Array<{ round: number; score: number; percentage: number }>;
}): Promise<{
  blockchainHash: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
}> {
  // Simulate network delay for blockchain transaction
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const timestamp = new Date().toISOString();
  
  // Generate SHA-256 hash of userId + skillId + finalScore + timestamp
  const hashInput = `${data.recipientId}${data.skillId}${Math.round(data.score)}${timestamp}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

  return {
    blockchainHash: hash,
    transactionHash: `0x${hash.substring(0, 64)}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 800000,
    timestamp,
  };
}
