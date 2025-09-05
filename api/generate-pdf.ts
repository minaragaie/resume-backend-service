import { VercelRequest, VercelResponse } from "@vercel/node";
import chromium from "chrome-aws-lambda";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for your frontend domain (or "*" for any)
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight OPTIONS request
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { html } = req.body;
  if (!html) return res.status(400).json({ message: "Missing HTML" });

  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "a4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.end(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
}
