// Admin Experience CRUD Endpoints for Vercel Backend Service
// Deploy these to: https://github.com/minaragaie/resume-backend-service.git

// GET /api/admin/resume/experience?id=123 - Read specific experience entry
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { success: false, message: 'Experience ID is required' },
        { status: 400 }
      );
    }
    
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'data', 'resume.json');
    
    if (!fs.existsSync(filePath)) {
      return Response.json(
        { success: false, message: 'Resume data file not found' },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const resumeData = JSON.parse(fileContent);
    
    const experience = resumeData.experience.find(exp => exp.id === parseInt(id));
    
    if (!experience) {
      return Response.json(
        { success: false, message: 'Experience entry not found' },
        { status: 404 }
      );
    }
    
    return Response.json({ 
      success: true, 
      data: experience,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading experience entry:', error);
    return Response.json(
      { success: false, message: 'Failed to read experience entry' },
      { status: 500 }
    );
  }
}

// POST /api/admin/resume/experience - Add new experience entry
export async function POST(request) {
  try {
    const experienceData = await request.json();
    
    if (!experienceData || typeof experienceData !== 'object') {
      return Response.json(
        { success: false, message: 'Invalid experience data format' },
        { status: 400 }
      );
    }
    
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'data', 'resume.json');
    
    if (!fs.existsSync(filePath)) {
      return Response.json(
        { success: false, message: 'Resume data file not found' },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const resumeData = JSON.parse(fileContent);
    
    // Create backup
    const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
    
    // Add new experience entry with proper ID
    const newId = resumeData.experience.length;
    const newExperience = { ...experienceData, id: newId };
    resumeData.experience.push(newExperience);
    
    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');
    
    return Response.json({ 
      success: true, 
      message: 'Experience entry added successfully',
      data: newExperience,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding experience entry:', error);
    return Response.json(
      { success: false, message: 'Failed to add experience entry' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/resume/experience?id=123 - Update specific experience entry
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const experienceData = await request.json();
    
    if (!id) {
      return Response.json(
        { success: false, message: 'Experience ID is required' },
        { status: 400 }
      );
    }
    
    if (!experienceData || typeof experienceData !== 'object') {
      return Response.json(
        { success: false, message: 'Invalid experience data format' },
        { status: 400 }
      );
    }
    
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'data', 'resume.json');
    
    if (!fs.existsSync(filePath)) {
      return Response.json(
        { success: false, message: 'Resume data file not found' },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const resumeData = JSON.parse(fileContent);
    
    const experienceIndex = resumeData.experience.findIndex(exp => exp.id === parseInt(id));
    
    if (experienceIndex === -1) {
      return Response.json(
        { success: false, message: 'Experience entry not found' },
        { status: 404 }
      );
    }
    
    // Create backup
    const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
    
    // Update the experience entry
    resumeData.experience[experienceIndex] = { 
      ...resumeData.experience[experienceIndex], 
      ...experienceData 
    };
    
    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');
    
    return Response.json({ 
      success: true, 
      message: 'Experience entry updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating experience entry:', error);
    return Response.json(
      { success: false, message: 'Failed to update experience entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/resume/experience?id=123 - Remove specific experience entry
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { success: false, message: 'Experience ID is required' },
        { status: 400 }
      );
    }
    
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'data', 'resume.json');
    
    if (!fs.existsSync(filePath)) {
      return Response.json(
        { success: false, message: 'Resume data file not found' },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const resumeData = JSON.parse(fileContent);
    
    const experienceIndex = resumeData.experience.findIndex(exp => exp.id === parseInt(id));
    
    if (experienceIndex === -1) {
      return Response.json(
        { success: false, message: 'Experience entry not found' },
        { status: 404 }
      );
    }
    
    // Create backup
    const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
    
    // Remove the experience entry
    resumeData.experience.splice(experienceIndex, 1);
    
    // Reindex remaining entries
    resumeData.experience.forEach((exp, index) => {
      exp.id = index;
    });
    
    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');
    
    return Response.json({ 
      success: true, 
      message: 'Experience entry deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting experience entry:', error);
    return Response.json(
      { success: false, message: 'Failed to delete experience entry' },
      { status: 500 }
    );
  }
}
