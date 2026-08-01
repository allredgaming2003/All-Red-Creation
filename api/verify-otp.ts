import { otpStore } from "./_store";

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { email, code } = body || {};
    if (!email || !code) {
      return res.status(400).json({ success: false, error: "Email and OTP code are required." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanCode = String(code).trim();

    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: "No active OTP request found for this email. Please click 'Get OTP Code' to receive a code.",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        error: "OTP code has expired (10 min limit). Please request a new OTP code.",
      });
    }

    if (record.code !== cleanCode) {
      return res.status(400).json({
        success: false,
        error: "Incorrect OTP Code! Please enter the exact 6-digit OTP code sent to your email.",
      });
    }

    otpStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Email address successfully verified via OTP!",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Verification failed." });
  }
}
