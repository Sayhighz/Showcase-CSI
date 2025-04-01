import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import ProjectDetails from '../../components/ProjectDetails/ProjectDetails';
import AuthorsList from '../../components/AuthorsList/AuthorsList';
import RelatedProjects from '../../components/RelatedProjects/RelatedProjects';
import { axiosGet } from '../../lib/axios';

const ProjectInfo = () => {
  const { projectId } = useParams();
  const [projectinfo, setProjectinfo] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project data and related projects when component mounts
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectData = await axiosGet(`/projects/project/${projectId}`);
        setProjectinfo(projectData);
        console.log(projectData);
        
        const relatedData = await axiosGet(`/projects/latest`);
        setRelatedProjects(relatedData);
      } catch (err) {
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  return (
    <div className="relative min-h-screen w-full py-10 px-4 mt-20">
      {/* Space background effect */}
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          backgroundColor: '#0D0221',
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px), 
            radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 100px 100px',
          opacity: 0.2
        }}
      ></div>
      
      {/* Animated space objects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Large purple planet */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#90278E]/20 blur-xl"></div>
        
        {/* Small bright star */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white animate-pulse"></div>
        
        {/* Medium star */}
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 rounded-full bg-white animate-pulse"
             style={{ animationDuration: '3s' }}></div>
      </div>
      
      {/* Content container with glass effect */}
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto relative backdrop-blur-sm bg-white/90 rounded-xl shadow-xl overflow-hidden">
        {/* Purple accent top border */}
        <div className="w-full max-w-lg mt-8">
          <SearchBar />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#90278E]/70 via-[#FF5E8C]/70 to-[#90278E]/70"></div>
        
        {/* Search bar */}
        
        {/* Loading state with space theme */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 w-full">
            <div className="w-16 h-16 border-4 border-[#90278E] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#90278E]">กำลังโหลด...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 text-red-600 rounded-lg mt-8">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#90278E] text-white rounded-lg hover:bg-[#7B1A73] transition-colors"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : projectinfo ? (
          <>
            <ProjectDetails project={projectinfo} />
            <AuthorsList authors={projectinfo.authors} />
            <RelatedProjects projects={relatedProjects} />
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-xl text-[#90278E]">ไม่พบข้อมูลโครงการ</p>
            <p className="mt-2 text-gray-600">โปรดตรวจสอบรหัสโครงการของคุณ</p>
          </div>
        )}
        
        {/* Purple accent bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#90278E]/70 via-[#FF5E8C]/70 to-[#90278E]/70"></div>
      </div>
    </div>
  );
};

export default ProjectInfo;