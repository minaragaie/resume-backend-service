import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Configure your SMTP transporter (example using Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // set in Vercel Environment Variables
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER, // your receiving email
      subject: `New contact form message from ${name}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    // Success response
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err: any) {
    console.error("Email sending failed:", err);
    res.status(500).json({
      message: "Failed to send email",
      error: err.message || String(err),
    });
  }
}
