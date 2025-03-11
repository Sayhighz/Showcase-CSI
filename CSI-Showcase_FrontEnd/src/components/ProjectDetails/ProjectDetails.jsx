import React from 'react';
import ImageSlider from '../ImageSlider/ImageSlider';

const ProjectDetails = ({ project }) => {
  return (
    <div className="max-w-4xl w-full mt-6">
      {/* ✅ Image Slider for Images & Video */}
      <ImageSlider 
        images={project.images} 
        video={project.video} 
        title={project.title} 
      />

      {/* ✅ Date & Title */}
      <p className="text-gray-500 mt-4">{project.date}</p>
      <h2 className="text-2xl font-bold text-[#90278E]">{project.title}</h2>

      {/* ✅ Display Multiple PDF Files */}
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


      {/* ✅ Project Description */}
      <p className="text-gray-700 mt-4">{project.description}</p>
    </div>
  );
};

export default ProjectDetails;
