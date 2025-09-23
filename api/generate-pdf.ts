import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// Helper function to highlight skills in text
function highlightSkills(text: string, skills: string[]): string {
  if (!text || !skills) return text;
  
  let highlightedText = text;
  skills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="skill-highlight">${skill}</span>`);
  });
  
  return highlightedText;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    // Read resume data from the API
    const resumeResponse = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/admin?type=resume`);
    const resumeResult = await resumeResponse.json();
    
    if (!resumeResult.success) {
      return res.status(500).json({ message: "Failed to fetch resume data" });
    }

    const resumeData = resumeResult.data;

    // Read the HTML template
    const templatePath = path.join(process.cwd(), 'templates', 'resume-template.html');
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    // Compile the Handlebars template
    const template = Handlebars.compile(templateContent);

    // Prepare data for template with skill highlighting
    const templateData = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        summary: highlightSkills(resumeData.personalInfo.summary, [
          ...resumeData.skills.languages,
          ...resumeData.skills.frameworks,
          ...resumeData.skills.technologies
        ])
      },
      experience: resumeData.experience.map((exp: any) => ({
        ...exp,
        description: highlightSkills(exp.description, [
          ...resumeData.skills.languages,
          ...resumeData.skills.frameworks,
          ...resumeData.skills.technologies
        ]),
        achievements: exp.achievements?.map((achievement: string) => 
          highlightSkills(achievement, [
            ...resumeData.skills.languages,
            ...resumeData.skills.frameworks,
            ...resumeData.skills.technologies
          ])
        )
      }))
    };

    // Generate HTML from template
    const html = template(templateData);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: { width: 1200, height: 800 },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    // Generate PDF with optimized settings
    const pdf = await page.pdf({ 
      format: "a4", 
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      preferCSSPageSize: true
    });

    await browser.close();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume_${new Date().getFullYear()}.pdf"`);
    res.end(pdf);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ message: "Failed to generate PDF", error: String(err) });
  }
}
