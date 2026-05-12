/**
 * In-memory certificate store.
 * In production, swap these functions for real DB queries against a
 * `certificates` table with columns: certificate_id, recipient_name,
 * skill_title, issued_at, expires_at, issued_by.
 *
 * Example SQL:
 *   SELECT * FROM certificates
 *   WHERE certificate_id = $1
 *   AND LOWER(recipient_name) = LOWER($2)
 */

export interface Certificate {
  certificate_id: string;
  recipient_name: string;
  skill_title: string;
  issued_by: string;
  issued_at: string;   // ISO date string
  expires_at: string;  // ISO date string
}

// Seed data — replace with real DB rows
const store = new Map<string, Certificate>([
  [
    'CERT-001',
    {
      certificate_id: 'CERT-001',
      recipient_name: 'John Doe',
      skill_title: 'React Advanced',
      issued_by: 'Tech Academy Pro',
      issued_at: '2024-12-15',
      expires_at: '2025-12-15',
    },
  ],
  [
    'CERT-002',
    {
      certificate_id: 'CERT-002',
      recipient_name: 'Jane Smith',
      skill_title: 'JavaScript Mastery',
      issued_by: 'Code Excellence',
      issued_at: '2024-11-20',
      expires_at: '2025-11-20',
    },
  ],
  [
    'CERT-003',
    {
      certificate_id: 'CERT-003',
      recipient_name: 'Alex Johnson',
      skill_title: 'TypeScript Pro',
      issued_by: 'Tech Academy Pro',
      issued_at: '2025-01-10',
      expires_at: '2026-01-10',
    },
  ],
]);

/** Look up a certificate by ID only. Returns null if not found. */
export function getCertificateById(id: string): Certificate | null {
  return store.get(id) ?? null;
}

/** Look up a certificate by ID, then verify the name case-insensitively. */
export function verifyCertificate(
  id: string,
  name: string,
): { valid: true; certificate: Certificate } | { valid: false; reason: string } {
  const cert = store.get(id);
  if (!cert) {
    return { valid: false, reason: 'Certificate not found' };
  }
  if (cert.recipient_name.toLowerCase() !== name.trim().toLowerCase()) {
    return { valid: false, reason: 'Name does not match certificate records' };
  }
  return { valid: true, certificate: cert };
}

/** Add a new certificate to the store (persists only for the server's lifetime). */
export function issueCertificate(cert: Certificate): void {
  store.set(cert.certificate_id, cert);
}

/** Return all stored certificates (admin use only). */
export function listCertificates(): Certificate[] {
  return Array.from(store.values());
}
