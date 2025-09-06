import { NextApiRequest, NextApiResponse } from "next";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("=== API Request Started ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   // Preflight
//   if (req.method === "OPTIONS") {
//     console.log("OPTIONS request received, ending early.");
//     return res.status(200).end();
//   }

  // Method check
//   if (req.method !== "POST") {
//     console.log("Invalid method:", req.method);
//     return res.status(405).json({ message: "Method not allowed" });
//   }

  // Body check
  console.log("Raw body received:", req.body);
  const { html } = req.body || {};
  if (!html) {
    console.log("No HTML provided in body.");
    return res.status(400).json({ message: "Missing HTML" });
  }
  console.log("HTML received (first 100 chars):", html.slice(0, 100));

  try {
    console.log("Launching Chromium...");
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    console.log("Chromium launched successfully.");

    const page = await browser.newPage();
    console.log("New page created.");

    await page.setContent(html, { waitUntil: "networkidle0" });
    console.log("HTML content set in page.");

    const pdf = await page.pdf({ format: "a4", printBackground: true });
    console.log("PDF generated successfully. Size:", pdf.length, "bytes");

    await browser.close();
    console.log("Browser closed.");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    console.log("Sending PDF response...");
    res.end(pdf);

    console.log("=== API Request Completed Successfully ===");
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ message: "Failed to generate PDF", error: String(err) });
  }
}
