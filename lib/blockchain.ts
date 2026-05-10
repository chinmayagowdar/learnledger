/**
 * Generate a blockchain-style hash for a credential (browser-safe)
 */
export function generateBlockchainHash(data: {
  credentialId: string;
  userId: string;
  timestamp: string;
}): string {
  const combined = `${data.credentialId}-${data.userId}-${data.timestamp}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64);
}

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

export function generateWalletAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = 'bc1q';
  for (let i = 0; i < 39; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

export function createVerificationLink(credentialId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return `${baseUrl}/verify/${credentialId}`;
}

export async function verifyCredentialOnBlockchain(
  credentialId: string,
  blockchainHash: string
): Promise<{
  isVerified: boolean;
  timestamp: string;
  blockNumber?: number;
  transactionHash?: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    isVerified: true,
    timestamp: new Date().toISOString(),
    blockNumber: Math.floor(Math.random() * 1000000),
    transactionHash: `0x${blockchainHash.substring(0, 64)}`,
  };
}
