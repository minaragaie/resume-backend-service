const { Octokit } = require('@octokit/rest');

class GitHubStorage {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.filePath = 'data/resume.json';
  }

  async readResumeData() {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.filePath,
      });
      
      const content = Buffer.from(data.content, 'base64').toString();
      return JSON.parse(content);
    } catch (error) {
      if (error.status === 404) {
        // File doesn't exist, return default data
        return this.getDefaultResumeData();
      }
      console.error('Error reading from GitHub:', error);
      throw error;
    }
  }

  async writeResumeData(resumeData) {
    try {
      // Get current file to get SHA (required for updates)
      let sha = null;
      try {
        const { data: currentFile } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: this.filePath,
        });
        sha = currentFile.sha;
      } catch (error) {
        // File doesn't exist, we'll create it
        if (error.status !== 404) throw error;
      }

      // Update or create file
      const content = JSON.stringify(resumeData, null, 2);
      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: this.filePath,
        message: `Update resume data - ${new Date().toISOString()}`,
        content: Buffer.from(content).toString('base64'),
        sha: sha, // null for new files, existing SHA for updates
      });

      return {
        success: true,
        commit: data.commit.sha,
        message: 'Resume data updated successfully in GitHub',
        url: data.content.html_url
      };
    } catch (error) {
      console.error('Error writing to GitHub:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createBackup(resumeData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `data/backups/resume-backup-${timestamp}.json`;
      
      const content = JSON.stringify(resumeData, null, 2);
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: backupPath,
        message: `Backup resume data - ${timestamp}`,
        content: Buffer.from(content).toString('base64'),
      });

      return { success: true, backupPath };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }

  getDefaultResumeData() {
    return {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
        summary: ""
      },
      experience: [],
      education: [],
      certifications: [],
      skills: {
        languages: [],
        frameworks: [],
        databases: [],
        technologies: [],
        versionControl: [],
        methodologies: [],
        standards: []
      },
      projects: [],
      additionalInfo: ""
    };
  }
}

module.exports = GitHubStorage;
