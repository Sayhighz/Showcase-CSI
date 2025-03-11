import React, { useEffect, useState } from 'react';
import ProjectDetails from '../ProjectDetails/ProjectDetails';

const PreviewSection = ({ projectData }) => {
  if (!projectData) return null;

  const [previewPdfs, setPreviewPdfs] = useState([]);
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [posterImageUrl, setPosterImageUrl] = useState(null);

  useEffect(() => {
    let objectUrls = [];

    if (projectData.pdfFiles && Array.isArray(projectData.pdfFiles)) {
      const updatedPdfs = projectData.pdfFiles.map((pdfObj) => {
        if (pdfObj.file instanceof Blob) {
          const objectUrl = URL.createObjectURL(pdfObj.file);
          objectUrls.push(objectUrl);
          return { url: objectUrl, name: pdfObj.name || "ไฟล์ PDF" };
        } else {
          return pdfObj;
        }
      });
      setPreviewPdfs(updatedPdfs);
    } else {
      setPreviewPdfs([]);
    }

    if (projectData.coverImage && typeof projectData.coverImage === "object") {
      const coverUrl = URL.createObjectURL(projectData.coverImage);
      objectUrls.push(coverUrl);
      setCoverImageUrl(coverUrl);
    } else {
      setCoverImageUrl(projectData.coverImage);
    }

    if (projectData.posterImage && typeof projectData.posterImage === "object") {
      const posterUrl = URL.createObjectURL(projectData.posterImage);
      objectUrls.push(posterUrl);
      setPosterImageUrl(posterUrl);
    } else {
      setPosterImageUrl(projectData.posterImage);
    }

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url)); // Cleanup URLs
    };
  }, [projectData]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com')) return url.replace("watch?v=", "embed/");
    if (url.includes('tiktok.com')) return url;
    if (url.includes('facebook.com')) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    return url;
  };

  const videoEmbedUrl = projectData.videoLink ? getEmbedUrl(projectData.videoLink) : null;

  return (
    <div className="max-w-2xl mx-auto mt-6 scale-90 border p-4 rounded-lg shadow-md bg-gray-100 overflow-hidden">
      <div className="mt-4">
        <ProjectDetails project={{
          images: [coverImageUrl, posterImageUrl].filter(Boolean),
          video: videoEmbedUrl,
          pdfFiles: previewPdfs.length > 0 ? previewPdfs : [],
          title: <span className="break-words whitespace-normal">{projectData.title}</span>,
          date: `Jan 1 ${projectData.year || ''}`,
          description: <span className="break-words whitespace-normal">{projectData.description}</span>,
        }} />
      </div>

      {/* Contributors List - Responsive */}
      {projectData.contributors && projectData.contributors.length > 0 && (
        <div className="mt-4 max-w-full overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {projectData.contributors.map((contributor, index) => (
              <div key={index} className="flex flex-col items-center p-2">
                <img
                  src={contributor.profilePic && typeof contributor.profilePic === "object"
                    ? URL.createObjectURL(contributor.profilePic)
                    : contributor.profilePic}
                  alt={contributor.firstName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <p className="text-sm font-semibold mt-2 text-center break-words">{`${contributor.firstName} ${contributor.lastName}`}</p>
                <p className="text-xs text-gray-500 break-words">ชั้นปีที่ {contributor.classYear}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewSection;