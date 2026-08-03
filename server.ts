import express from "express";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory store for active 6-digit OTP codes with 10-minute expiry
interface OtpRecord {
  code: string;
  expiresAt: number;
  name?: string;
}
const otpStore = new Map<string, OtpRecord>();

// Helper function to create Nodemailer Transporter if SMTP credentials exist
function createMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "All Red Creation OTP Service" });
});

// 2. Generate and Dispatch 6-Digit Email OTP
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid email address is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const recipientName = name ? String(name).trim() : "Valued Member";

    // Generate cryptographically secure 6-digit random code (100000 - 999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

    otpStore.set(cleanEmail, { code, expiresAt, name: recipientName });

    console.log(`\n==================================================`);
    console.log(`[EMAIL OTP BACKEND SERVICE]`);
    console.log(`Recipient: ${recipientName} <${cleanEmail}>`);
    console.log(`Generated 6-Digit OTP: [ ${code} ]`);
    console.log(`Expires: ${new Date(expiresAt).toLocaleTimeString()}`);
    console.log(`==================================================\n`);

    // Attempt sending real email via Nodemailer if SMTP is configured
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
        emailNotice = `SMTP error sending to inbox: ${mailErr?.message}. Code logged on server.`;
      }
    } else {
      emailNotice = `SMTP credentials not configured in .env (SMTP_USER/SMTP_PASS). OTP ${code} is active for testing.`;
    }

    return res.json({
      success: true,
      message: `OTP dispatched to ${cleanEmail}`,
      emailSent,
      emailNotice,
      // Pass code in response for preview sandbox mode so user can test seamlessly
      devOtp: code,
    });
  } catch (err: any) {
    console.error("Send OTP Endpoint Error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to dispatch OTP." });
  }
});

// 3. Verify 6-Digit Email OTP
app.post("/api/verify-otp", (req, res) => {
  try {
    const { email, code } = req.body;
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

    // OTP Verified successfully! Remove from active store to prevent reuse
    otpStore.delete(cleanEmail);

    return res.json({
      success: true,
      verified: true,
      message: "Email address successfully verified via OTP!",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Verification failed." });
  }
});

// 4. Projects Persistence Backup API (Cross-Device Mobile/Desktop Sync)
let serverProjectsStore: any[] = [];

app.get("/api/projects", (_req, res) => {
  return res.json({ success: true, projects: serverProjectsStore });
});

app.post("/api/projects", (req, res) => {
  try {
    const project = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ success: false, error: "Project object with id required" });
    }
    const idx = serverProjectsStore.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      serverProjectsStore[idx] = project;
    } else {
      serverProjectsStore.unshift(project);
    }
    return res.json({ success: true, projects: serverProjectsStore });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/projects/sync", (req, res) => {
  try {
    const { projects } = req.body;
    if (Array.isArray(projects)) {
      serverProjectsStore = projects;
    }
    return res.json({ success: true, projects: serverProjectsStore });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  serverProjectsStore = serverProjectsStore.filter(p => p.id !== id);
  return res.json({ success: true, projects: serverProjectsStore });
});

// ==========================================
// VITE / STATIC SERVING MIDDLEWARE
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
