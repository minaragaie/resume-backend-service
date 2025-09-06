import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS (for GitHub Pages frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASSWORD, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: process.env.MY_EMAIL, // use your own email
      replyTo: email, // set sender's email here
      to: process.env.MY_EMAIL,
      subject: `New contact from ${name}`,
      text: message,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
}
