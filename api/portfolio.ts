import { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug parameter is required' })
    }

    // Read resume.json to get project info
    const resumePath = path.join(process.cwd(), 'data', 'resume.json')
    const resumeData = JSON.parse(fs.readFileSync(resumePath, 'utf-8'))
    
    // Find project by slug
    const project = resumeData.projects?.find((p: any) => p.slug === slug)
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // If not a private repo, return error (should fetch from GitHub)
    if (!project.isPrivateRepo || !project.portfolioFile) {
      return res.status(400).json({ 
        error: 'Project portfolio should be fetched from GitHub',
        githubUrl: project.githubUrl 
      })
    }

    // Read portfolio file
    const portfolioPath = path.join(process.cwd(), 'data', 'portfolios', project.portfolioFile)
    
    if (!fs.existsSync(portfolioPath)) {
      return res.status(404).json({ error: 'Portfolio file not found' })
    }

    const content = fs.readFileSync(portfolioPath, 'utf-8')
    
    return res.status(200).json({
      success: true,
      slug,
      content,
      project: {
        name: project.name,
        description: project.description,
        githubUrl: project.githubUrl,
        isPrivateRepo: project.isPrivateRepo
      }
    })

  } catch (error) {
    console.error('Error serving portfolio:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

