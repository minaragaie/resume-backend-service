import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { html } = req.body || {};
  if (!html) return res.status(400).json({ message: "Missing HTML" });

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: { width: 1200, height: 800 },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "a4", printBackground: true });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.end(pdf);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ message: "Failed to generate PDF", error: String(err) });
  }
}
