export function generateCredentialHash(data: {
  userId: string;
  skillId: string;
  timestamp: number;
  score: number;
}): string {
  const input = `${data.userId}-${data.skillId}-${data.timestamp}-${data.score}-${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64);
}

export function generateShareableUrl(hash: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return `${baseUrl}/verify/${hash}`;
}

export function formatHashForDisplay(hash: string, length: number = 16): string {
  return `${hash.substring(0, length)}...`;
}

export function getCredentialStatus(expiresAt: Date | number | string): 'active' | 'expiring' | 'expired' {
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry < 30) return 'expiring';
  return 'active';
}
