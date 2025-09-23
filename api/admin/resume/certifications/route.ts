// Admin Certifications CRUD Endpoints for Vercel Backend Service
// Deploy these to: https://github.com/minaragaie/resume-backend-service.git

// DELETE /api/admin/resume/certifications?index=0 - Remove specific certification entry
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const index = searchParams.get('index');
    
    if (!index) {
      return Response.json(
        { success: false, message: 'Certification index is required' },
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
    
    const certificationIndex = parseInt(index);
    
    if (certificationIndex < 0 || certificationIndex >= resumeData.certifications.length) {
      return Response.json(
        { success: false, message: 'Certification entry not found' },
        { status: 404 }
      );
    }
    
    // Create backup
    const backupPath = path.join(process.cwd(), 'data', `resume.backup.${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
    
    // Remove the certification entry
    resumeData.certifications.splice(certificationIndex, 1);
    
    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(resumeData, null, 2), 'utf8');
    
    return Response.json({ 
      success: true, 
      message: 'Certification entry deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting certification entry:', error);
    return Response.json(
      { success: false, message: 'Failed to delete certification entry' },
      { status: 500 }
    );
  }
}
