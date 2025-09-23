import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// GET /api/admin/resume - Read resume data
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'resume.json')
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'Resume data file not found' },
        { status: 404 }
      )
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const resumeData = JSON.parse(fileContent)
    
    return NextResponse.json({ 
      success: true, 
      data: resumeData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error reading resume data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to read resume data' },
      { status: 500 }
    )
  }
}

// POST /api/admin/resume - Create/Update entire resume data
export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json()
    
    if (!resumeData || typeof resumeData !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid resume data format' },
        { status: 400 }
      )
    }
    
    const filePath = path.join(process.cwd(), 'data', 'resume.json')
    
    // Create backup before writing
    if (fs.existsSync(filePath)) {
      const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`)
      fs.copyFileSync(filePath, backupPath)
    }
    
    // Ensure data directory exists
    const dataDir = path.dirname(filePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    // Write the updated data
    fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Resume data saved successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving resume data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save resume data' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/resume - Reset resume data to default
export async function DELETE() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'resume.json')
    
    // Create backup before deletion
    if (fs.existsSync(filePath)) {
      const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`)
      fs.copyFileSync(filePath, backupPath)
    }
    
    // Reset to default structure
    const defaultResumeData = {
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
        technical: [],
        soft: [],
        languages: [],
        tools: []
      },
      projects: [],
      additionalInfo: ""
    }
    
    // Ensure data directory exists
    const dataDir = path.dirname(filePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    fs.writeFileSync(filePath, JSON.stringify(defaultResumeData, null, 2), 'utf8')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Resume data reset to default',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resetting resume data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to reset resume data' },
      { status: 500 }
    )
  }
}