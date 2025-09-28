import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

// Define API request and response types
interface ApiRequest {
  method?: string;
  body?: any;
  headers?: { [key: string]: string | string[] | undefined };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: (data?: any) => void;
}

// Dynamic import for chromium to avoid CommonJS/ESM issues
const chromium = require("@sparticuz/chromium");

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// Helper function to highlight skills in text with orange color only
function highlightSkills(text: string, skills: string[]): string {
  if (!text || !skills) return text;
  
  let highlightedText = text;
  
  skills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="skill-highlight">${skill}</span>`);
  });
  
  return highlightedText;
}

// Helper function to highlight metrics and numbers
function highlightMetrics(text: string): string {
  if (!text) return text;
  
  // Highlight percentages, numbers, and common metrics
  let highlightedText = text;
  
  // Highlight percentages
  highlightedText = highlightedText.replace(/(\d+%)/g, '<span class="metric-highlight">$1</span>');
  
  // Highlight numbers with common metric words
  highlightedText = highlightedText.replace(/(\d+)\s*(years?|months?|days?|hours?|times?|x|fold|million|billion|thousand|k|M|B)/gi, '<span class="metric-highlight">$1 $2</span>');
  
  // Highlight dollar amounts
  highlightedText = highlightedText.replace(/(\$[\d,]+(?:\.\d{2})?)/g, '<span class="metric-highlight">$1</span>');
  
  // Highlight ratios and comparisons
  highlightedText = highlightedText.replace(/(\d+:\d+|\d+\/\d+)/g, '<span class="metric-highlight">$1</span>');
  
  return highlightedText;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
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

    // Collect all skills from skills object and experience technologies
    const allSkills = [
      ...resumeData.skills.frameworks,
      ...resumeData.skills.technologies,
      ...resumeData.skills.databases,
      ...resumeData.skills.versionControl,
      ...resumeData.skills.methodologies,
      ...resumeData.skills.standards
    ];
    
    // Add technologies from each experience
    resumeData.experience.forEach((exp: any) => {
      if (exp.technologies) {
        allSkills.push(...exp.technologies);
      }
    });

    // Prepare data for template with skill and metric highlighting
    const templateData = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        summary: highlightMetrics(highlightSkills(resumeData.summary || resumeData.personalInfo.summary, allSkills))
      },
      experience: resumeData.experience.map((exp: any) => ({
        ...exp,
        description: highlightMetrics(highlightSkills(exp.description, allSkills)),
        achievements: exp.achievements?.map((achievement: string) => 
          highlightMetrics(highlightSkills(achievement, allSkills))
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
