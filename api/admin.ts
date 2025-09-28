import GitHubStorage from '../github-storage';

// Define API request and response types
interface ApiRequest {
  method?: string;
  body?: any;
  query?: { [key: string]: string | string[] | undefined };
  headers?: { [key: string]: string | string[] | undefined };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: (data?: any) => void;
}

// Define the resume data interface
interface ResumeData {
  personalInfo: any;
  experience: Array<{
    id: number;
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    technologies: string[];
    versionControl: string[];
    methodologies: string[];
    standards: string[];
  };
  projects: any[];
  additionalInfo: string;
}

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

// Consolidated admin API endpoint
// Handles all admin operations based on query parameters
// GET /api/admin?type=resume - Read resume data
// POST /api/admin?type=resume - Save resume data
// DELETE /api/admin?type=resume - Reset resume data
// GET /api/admin?type=experience&id=1 - Get experience by ID
// POST /api/admin?type=experience - Add experience
// PUT /api/admin?type=experience&id=1 - Update experience
// DELETE /api/admin?type=experience&id=1 - Delete experience
// Similar for education and certifications

// GitHub storage instance
const githubStorage = new GitHubStorage();

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const type = req.query?.type;
  const id = req.query?.id;

  try {
    // Read current data from GitHub
    let resumeData: ResumeData;
    try {
      resumeData = await githubStorage.readResumeData();
    } catch (error) {
      console.error('Failed to read from GitHub:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to read resume data from GitHub',
        error: error.message
      });
    }

    if (type === 'resume') {
      if (req.method === "GET") {
        return res.status(200).json({
          success: true,
          data: resumeData,
          timestamp: new Date().toISOString()
        });
      } else if (req.method === "POST") {
        // Save resume data
        const newData = req.body;
        if (!newData || typeof newData !== 'object') {
          return res.status(400).json({
            success: false,
            message: 'Invalid resume data format'
          });
        }

        // Validate required fields
        if (!newData.personalInfo || !newData.experience || !newData.education || !newData.skills) {
          return res.status(400).json({
            success: false,
            message: 'Missing required resume sections'
          });
        }

        // Create backup before updating
        try {
          await githubStorage.createBackup(resumeData);
        } catch (backupError) {
          console.warn('Failed to create backup:', backupError);
        }

        // Write the updated data to GitHub
        try {
          const result = await githubStorage.writeResumeData(newData);
          
          if (result.success) {
            return res.status(200).json({
              success: true,
              message: 'Resume data saved successfully to GitHub',
              commit: result.commit,
              url: result.url,
              timestamp: new Date().toISOString()
            });
          } else {
            return res.status(500).json({
              success: false,
              message: 'Failed to save resume data to GitHub',
              error: result.error
            });
          }
        } catch (writeError: any) {
          console.error('GitHub write error:', writeError);
          return res.status(500).json({
            success: false,
            message: 'Failed to save resume data to GitHub',
            error: writeError?.message || 'GitHub write operation failed'
          });
        }
      } else if (req.method === "DELETE") {
        // Reset resume data
        const defaultData = {
          personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "" },
          experience: [],
          education: [],
          certifications: [],
          skills: { languages: [], frameworks: [], databases: [], technologies: [], versionControl: [], methodologies: [], standards: [] },
          projects: [],
          additionalInfo: ""
        };

        // Create backup before resetting
        try {
          await githubStorage.createBackup(resumeData);
        } catch (backupError) {
          console.warn('Failed to create backup:', backupError);
        }

        // Write default data to GitHub
        try {
          const result = await githubStorage.writeResumeData(defaultData);
          
          if (result.success) {
            return res.status(200).json({
              success: true,
              message: 'Resume data reset to default in GitHub',
              commit: result.commit,
              url: result.url,
              timestamp: new Date().toISOString()
            });
          } else {
            return res.status(500).json({
              success: false,
              message: 'Failed to reset resume data in GitHub',
              error: result.error
            });
          }
        } catch (writeError: any) {
          console.error('GitHub write error:', writeError);
          return res.status(500).json({
            success: false,
            message: 'Failed to reset resume data in GitHub',
            error: writeError?.message || 'GitHub write operation failed'
          });
        }
      }
    }

    // Handle experience operations
    if (type === 'experience') {
      if (!resumeData.experience) resumeData.experience = [];

      if (req.method === "GET") {
        if (id) {
          const experience = resumeData.experience.find((exp: any) => exp.id === parseInt(id as string));
          return res.status(200).json({
            success: true,
            data: experience || null,
            timestamp: new Date().toISOString()
          });
        } else {
          return res.status(200).json({
            success: true,
            data: resumeData.experience,
            timestamp: new Date().toISOString()
          });
        }
      } else if (req.method === "POST") {
        // Add new experience
        const newExperience = {
          id: Math.max(...resumeData.experience.map((exp: any) => exp.id || 0), 0) + 1,
          ...req.body
        };
        resumeData.experience.push(newExperience);
      } else if (req.method === "PUT" && id) {
        // Update experience
        const index = resumeData.experience.findIndex((exp: any) => exp.id === parseInt(id as string));
        if (index !== -1) {
          resumeData.experience[index] = { ...resumeData.experience[index], ...req.body };
        }
      } else if (req.method === "DELETE" && id) {
        // Delete experience
        resumeData.experience = resumeData.experience.filter((exp: any) => exp.id !== parseInt(id as string));
      }

      // Save updated data to GitHub
      try {
        const result = await githubStorage.writeResumeData(resumeData);
        
        if (result.success) {
          return res.status(200).json({
            success: true,
            message: 'Experience operation completed in GitHub',
            commit: result.commit,
            timestamp: new Date().toISOString()
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to save experience data to GitHub',
            error: result.error
          });
        }
      } catch (writeError: any) {
        console.error('GitHub write error for experience:', writeError);
        return res.status(500).json({
          success: false,
          message: 'Failed to save experience data to GitHub',
          error: writeError?.message || 'GitHub write operation failed'
        });
      }
    }

    // Handle education operations
    if (type === 'education') {
      if (!resumeData.education) resumeData.education = [];

      if (req.method === "GET") {
        return res.status(200).json({
          success: true,
          data: resumeData.education,
          timestamp: new Date().toISOString()
        });
      } else if (req.method === "POST") {
        resumeData.education.push(req.body);
      } else if (req.method === "PUT" && id) {
        const index = resumeData.education.findIndex((edu: any) => edu.id === parseInt(id as string));
        if (index !== -1) {
          resumeData.education[index] = { ...resumeData.education[index], ...req.body };
        }
      } else if (req.method === "DELETE" && id) {
        resumeData.education = resumeData.education.filter((edu: any) => edu.id !== parseInt(id as string));
      }

      // Save updated data to GitHub
      try {
        const result = await githubStorage.writeResumeData(resumeData);
        
        if (result.success) {
          return res.status(200).json({
            success: true,
            message: 'Education operation completed in GitHub',
            commit: result.commit,
            timestamp: new Date().toISOString()
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to save education data to GitHub',
            error: result.error
          });
        }
      } catch (writeError: any) {
        console.error('GitHub write error for education:', writeError);
        return res.status(500).json({
          success: false,
          message: 'Failed to save education data to GitHub',
          error: writeError?.message || 'GitHub write operation failed'
        });
      }
    }

    // Handle certifications operations
    if (type === 'certifications') {
      if (!resumeData.certifications) resumeData.certifications = [];

      if (req.method === "GET") {
        return res.status(200).json({
          success: true,
          data: resumeData.certifications,
          timestamp: new Date().toISOString()
        });
      } else if (req.method === "POST") {
        resumeData.certifications.push(req.body);
      } else if (req.method === "PUT" && id) {
        const index = resumeData.certifications.findIndex((cert: any) => cert.id === parseInt(id as string));
        if (index !== -1) {
          resumeData.certifications[index] = { ...resumeData.certifications[index], ...req.body };
        }
      } else if (req.method === "DELETE" && id) {
        resumeData.certifications = resumeData.certifications.filter((cert: any) => cert.id !== parseInt(id as string));
      }

      // Save updated data to GitHub
      try {
        const result = await githubStorage.writeResumeData(resumeData);
        
        if (result.success) {
          return res.status(200).json({
            success: true,
            message: 'Certifications operation completed in GitHub',
            commit: result.commit,
            timestamp: new Date().toISOString()
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to save certifications data to GitHub',
            error: result.error
          });
        }
      } catch (writeError: any) {
        console.error('GitHub write error for certifications:', writeError);
        return res.status(500).json({
          success: false,
          message: 'Failed to save certifications data to GitHub',
          error: writeError?.message || 'GitHub write operation failed'
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid operation type'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message || String(error)
    });
  }
}
