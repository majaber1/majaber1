export type StorageVerificationState = 'configured' | 'not_configured' | 'unverified';

export interface StorageVerification {
  state: StorageVerificationState;
  provider: string;
  evidence: string;
  verifiedAt: string;
}

export const storageVerification: Record<string, StorageVerification> = {
  sponsorloop: {
    state: 'not_configured',
    provider: 'Cloudflare R2',
    evidence: 'Production /api/health on main a3d686d reports storage=not_configured and storageProvider=none. Upload code is R2-ready and checks R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.',
    verifiedAt: '2026-08-26',
  },
  'scrap-ai': {
    state: 'not_configured',
    provider: 'Cloudflare R2',
    evidence: 'Production /api/health on main 85033f6 reports storage=false and storageProvider=none. Upload API is R2-ready and checks the four R2 production variables.',
    verifiedAt: '2026-08-26',
  },
  'qarar-ai': {
    state: 'unverified',
    provider: 'S3-compatible / Cloudflare R2 capable',
    evidence: 'Repository supports S3-compatible durable storage, but the Qarar backend production deployment is currently blocked because the Vercel project Root Directory is set to backend even though that directory is absent from the current repository layout. Storage cannot be verified live until backend deployment is fixed.',
    verifiedAt: '2026-08-26',
  },
};
