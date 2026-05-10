/**
 * Generate a blockchain-style hash from credential data
 * Uses SHA-256 simulation for browser environment
 */
export function generateCredentialHash(data: {
  userId: string;
  skillId: string;
  timestamp: number;
  score: number;
}): string {
  // Create a simple hash by combining and encoding the data
  const input = `${data.userId}-${data.skillId}-${data.timestamp}-${data.score}-${Math.random()}`;
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex and pad
  return Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64);
}

/**
 * Generate a shareable credential URL
 */
export function generateShareableUrl(hash: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/verify/${hash}`;
}

/**
 * Verify credential integrity (simplified)
 */
export function verifyCredentialIntegrity(
  hash: string,
  credential: any
): boolean {
  // In a real application, you would verify the cryptographic signature
  // For now, just check that the hash exists and credential is valid
  return !!hash && !!credential && typeof hash === 'string' && hash.length === 64;
}

/**
 * Format hash for display (shortened)
 */
export function formatHashForDisplay(hash: string, length: number = 16): string {
  return `${hash.substring(0, length)}...`;
}

/**
 * Get credential expiration status
 */
export function getCredentialStatus(expiresAt: Date | number): 'active' | 'expiring' | 'expired' {
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry < 30) {
    return 'expiring';
  } else {
    return 'active';
  }
}
