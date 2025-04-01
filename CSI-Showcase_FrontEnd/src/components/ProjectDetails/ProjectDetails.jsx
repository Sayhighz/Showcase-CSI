import React from 'react';
import ImageSlider from '../ImageSlider/ImageSlider';

const ProjectDetails = ({ project }) => {
  // Collect all images (including images from other sections like coursework, competition, etc.)
  const allImages = [
    ...(project.images || []), // From the images array (if available)
    project.coursework?.courseworkImage, // From coursework (if available)
    project.competition?.competitionPoster, // From competition (if available)
  ].filter(Boolean); // Remove any undefined or null values

  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Date(date).toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-4xl w-full mt-8 relative">
      {/* Space-themed decorative elements */}
      <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-[#90278E]/10 blur-xl z-0"></div>
      <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-[#90278E]/10 blur-xl z-0"></div>
      
      {/* ✅ Image Slider for Images & Video */}
      <div className="relative z-10">
        <ImageSlider 
          images={allImages}  // Send all images to ImageSlider
          video={project.coursework?.courseworkVideo || project.video || null}  // Pass video if available
          pdfFile={project.pdfFiles && project.pdfFiles.length > 0 ? project.pdfFiles[0] : null} 
          title={project.title} 
        />
      </div>

      {/* ✅ Date & Title with space theme */}
      <div className="mt-10 text-center">
        <p className="text-[#D4B2D8] mb-2">{formatDate(project.projectCreatedAt)}</p>
        <h2 className="text-3xl font-bold text-[#90278E] mb-1 relative inline-block">
          {project.title}
          <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#90278E] to-transparent"></span>
        </h2>
      </div>

      {/* ✅ Project Description */}
      <div className="mt-6 p-6 bg-[#0D0221]/5 rounded-lg border border-[#90278E]/20 relative backdrop-blur-sm">
        <p className="text-gray-700 leading-relaxed">{project.description}</p>
        
        {/* Small space-themed decoration */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#90278E]"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-[#FF5E8C]"></div>
      </div>

      {/* ✅ Project Level */}
      <div className="mt-4 flex justify-center">
        <div className="px-6 py-2 bg-[#0D0221] text-white rounded-full inline-flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#90278E] mr-2"></span>
          ระดับ: {project.level}
        </div>
      </div>

      {/* ✅ PDF Files */}
      {project.pdfFiles && project.pdfFiles.length > 0 && (
        <div className="mt-8 p-6 bg-[#0D0221]/5 rounded-lg border border-[#90278E]/20">
          <h4 className="text-lg font-semibold text-[#90278E] flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span>เอกสารที่เกี่ยวข้อง</span>
          </h4>
          <ul className="mt-3 space-y-3">
            {project.pdfFiles.map((pdf, index) => (
              <li key={index} className="flex">
                <a 
                  href={pdf.url} 
                  download 
                  className="text-[#90278E] hover:text-[#FF5E8C] flex items-center transition-all hover:translate-x-1"
                >
                  <span className="w-2 h-2 bg-[#90278E] rounded-full mr-2"></span>
                  <span className="underline underline-offset-2">ดาวน์โหลด: {pdf.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;