import crypto from "crypto";

const SECRET_SALT = process.env.SMTP_PASS || process.env.JWT_SECRET || "all-red-creation-secure-otp-key-2026";

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

    const { email, code, otpToken } = body || {};
    if (!email || !code) {
      return res.status(400).json({ success: false, error: "Email and OTP code are required." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanCode = String(code).trim();

    if (!otpToken || typeof otpToken !== "string") {
      return res.status(400).json({
        success: false,
        error: "No active OTP session found. Please click 'Get OTP Code' to send a code to your email.",
      });
    }

    // Decode and verify the HMAC signed token
    let decodedStr = "";
    try {
      decodedStr = Buffer.from(otpToken, "base64").toString("utf-8");
    } catch (e) {
      return res.status(400).json({ success: false, error: "Invalid OTP session token format." });
    }

    const parts = decodedStr.split(":");
    if (parts.length !== 4) {
      return res.status(400).json({ success: false, error: "Malformed OTP session token." });
    }

    const [tokenEmail, tokenCode, tokenExpiresAtStr, tokenSignature] = parts;
    const expiresAt = parseInt(tokenExpiresAtStr, 10);

    // Verify token HMAC signature
    const expectedPayload = `${tokenEmail}:${tokenCode}:${tokenExpiresAtStr}`;
    const expectedSignature = crypto.createHmac("sha256", SECRET_SALT).update(expectedPayload).digest("hex");

    if (tokenSignature !== expectedSignature) {
      return res.status(400).json({ success: false, error: "Security validation failed. Invalid OTP token signature." });
    }

    // Verify recipient email matches
    if (tokenEmail !== cleanEmail) {
      return res.status(400).json({
        success: false,
        error: `OTP code was requested for a different email address. Please request a new OTP for ${cleanEmail}.`,
      });
    }

    // Verify expiry (10 minutes)
    if (Date.now() > expiresAt) {
      return res.status(400).json({
        success: false,
        error: "OTP code has expired (10 min limit). Please click 'Get OTP Code' to resend.",
      });
    }

    // Verify exact 6-digit OTP code match
    if (tokenCode !== cleanCode) {
      return res.status(400).json({
        success: false,
        error: "Incorrect OTP Code! Please enter the exact 6-digit OTP code sent to your Gmail inbox.",
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Email address successfully verified via OTP!",
    });
  } catch (err: any) {
    return res.status(200).json({ success: false, error: err.message || "Verification failed." });
  }
}
