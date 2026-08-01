export interface OtpRecord {
  code: string;
  expiresAt: number;
  name?: string;
}

// In Vercel serverless environments, global variable survives warm lambdas
const g = globalThis as unknown as { _otpStore?: Map<string, OtpRecord> };
if (!g._otpStore) {
  g._otpStore = new Map<string, OtpRecord>();
}

export const otpStore = g._otpStore;
