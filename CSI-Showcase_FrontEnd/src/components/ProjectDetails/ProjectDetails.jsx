import React from 'react';
import ImageSlider from '../ImageSlider/ImageSlider';

const ProjectDetails = ({ project }) => {
  // Collect all images (including images from other sections like coursework, competition, etc.)
  const allImages = [
    ...(project.images || []), // From the images array (if available)
    project.coursework?.courseworkImage, // From coursework (if available)
    project.competition?.competitionPoster, // From competition (if available)
  ].filter(Boolean); // Remove any undefined or null values

  return (
    <div className="max-w-4xl w-full mt-6">
      {/* ✅ Image Slider for Images & Video */}
      <ImageSlider 
        images={allImages}  // Send all images to ImageSlider
        video={project.coursework?.courseworkVideo || project.video || null}  // Pass video if available (either from coursework or general video field)
        pdfFile={project.pdfFiles && project.pdfFiles.length > 0 ? project.pdfFiles[0] : null} // Pass first PDF file if exists
        title={project.title} 
      />

      {/* ✅ Date & Title */}
      <p className="text-gray-500 mt-4">{new Date(project.projectCreatedAt).toLocaleDateString()}</p>
      <h2 className="text-2xl font-bold text-[#90278E]">{project.title}</h2>

      {/* ✅ Project Description */}
      <p className="text-gray-700 mt-4">{project.description}</p>

      {/* ✅ Project Level */}
      <p className="text-gray-500 mt-2">ระดับ: {project.level}</p>

      {/* ✅ PDF Files */}
      {project.pdfFiles && project.pdfFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">เอกสารที่เกี่ยวข้อง:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {project.pdfFiles.map((pdf, index) => (
              <li key={index}>
                <a href={pdf.url} download className="text-blue-600 underline cursor-pointer">
                  ดาวน์โหลด: {pdf.name}
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
