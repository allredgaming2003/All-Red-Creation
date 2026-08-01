import nodemailer from "nodemailer";
import { otpStore } from "./_store";

function createMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

export default async function handler(req: any, res: any) {
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
    const { email, name } = body || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email address is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const recipientName = name ? String(name).trim() : "Valued Member";

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(cleanEmail, { code, expiresAt, name: recipientName });

    const transporter = createMailTransporter();
    let emailSent = false;
    let emailNotice = "";

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"ALL RED CREATION" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: `${code} is your ALL RED CREATION Verification Code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0d0d0d; border-radius: 16px; color: #ffffff; border: 1px solid #ff1e2733;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #ff1e27; margin: 0; font-size: 24px; font-weight: 900; tracking-widest: 2px;">ALL RED CREATION</h1>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Official Account Verification</p>
              </div>
              <p style="font-size: 14px; color: #e5e7eb; line-height: 1.5;">Hello <strong>${recipientName}</strong>,</p>
              <p style="font-size: 14px; color: #9ca3af; line-height: 1.5;">Use the following 6-digit OTP code to verify your email address and complete your account creation:</p>
              
              <div style="background-color: #1a1a1a; border: 2px dashed #ff1e27; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ff1e27;">${code}</span>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; text-align: center;">This verification code is valid for 10 minutes. Do not share this code with anyone.</p>
              <hr style="border: 0; border-top: 1px solid #374151; margin: 24px 0;" />
              <p style="font-size: 11px; color: #4b5563; text-align: center;">© ALL RED CREATION. All rights reserved.</p>
            </div>
          `,
        });
        emailSent = true;
        emailNotice = `Verification email sent successfully to ${cleanEmail}`;
      } catch (mailErr: any) {
        console.error("Nodemailer SMTP Error:", mailErr?.message || mailErr);
        emailNotice = `SMTP error sending to inbox: ${mailErr?.message}.`;
      }
    } else {
      emailNotice = `SMTP credentials not configured on Vercel environment variables (SMTP_USER/SMTP_PASS).`;
    }

    return res.status(200).json({
      success: true,
      message: `OTP dispatched to ${cleanEmail}`,
      emailSent,
      emailNotice,
      devOtp: code,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to dispatch OTP." });
  }
}
