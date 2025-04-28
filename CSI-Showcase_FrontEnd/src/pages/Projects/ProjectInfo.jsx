import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Divider, Space, Button, Skeleton } from 'antd';
import { RocketOutlined, StarOutlined } from '@ant-design/icons';

// นำเข้า hooks ที่ใช้งาน
import { useProject } from '../../hooks';
import { PROJECT } from '../../constants/routes';

// นำเข้า components ที่ใช้งาน
import ProjectDetails from '../../components/ProjectDetails/ProjectDetails';
import RelatedProjects from '../../components/RelatedProjects/RelatedProjects';
import ErrorMessage from '../../components/common/ErrorMessage';

const { Title } = Typography;

/**
 * หน้าแสดงรายละเอียดโปรเจค
 * แสดงรายละเอียดโปรเจคและโปรเจคที่เกี่ยวข้อง
 */
const ProjectInfo = () => {
  const { projectId } = useParams();
  const { 
    project, 
    isLoading, 
    error, 
    fetchProjectDetails, 
    fetchLatestProjects,
    projects: relatedProjects
  } = useProject(projectId);

  // ดึงข้อมูลโปรเจคเมื่อ component mount
  useEffect(() => {
    // ดึงข้อมูลโปรเจค
    fetchProjectDetails();
    console.log(project)
    
    // ดึงโปรเจคที่เกี่ยวข้อง (โปรเจคล่าสุด)
    fetchLatestProjects(8); // ลดจำนวนลงจาก 9 เป็น 8 เพื่อให้แสดงเป็นแถวละ 4 ได้สวยงาม
  }, [projectId, fetchProjectDetails, fetchLatestProjects]);

  // แสดงสถานะการโหลด
  if (isLoading && !project) {
    return (
      <div className="min-h-screen w-full py-10 px-4 mt-16 bg-gradient-to-b from-[#0D0221]/50 to-[#0D0221]/30">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/95 rounded-xl shadow-xl p-8 backdrop-blur-md">
            <Skeleton active paragraph={{ rows: 4 }} />
            <Divider />
            <Skeleton active paragraph={{ rows: 2 }} />
            <Divider />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton.Image key={i} className="w-full h-48" active />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // แสดงข้อความผิดพลาด
  if (error && !project) {
    return (
      <div className="min-h-screen w-full py-10 px-4 mt-16 bg-gradient-to-b from-[#0D0221]/50 to-[#0D0221]/30 flex items-center justify-center">
        <ErrorMessage 
          title="ไม่สามารถโหลดข้อมูลโปรเจคได้" 
          message={error} 
          showReloadButton
        />
      </div>
    );
  }

  // แสดงข้อความเมื่อไม่พบข้อมูลโปรเจค
  if (!project && !isLoading) {
    return (
      <div className="min-h-screen w-full py-10 px-4 mt-16 bg-gradient-to-b from-[#0D0221]/50 to-[#0D0221]/30 flex items-center justify-center">
        <ErrorMessage 
          title="ไม่พบข้อมูลโปรเจค" 
          message="ไม่พบข้อมูลโปรเจคที่คุณกำลังค้นหา โปรดตรวจสอบรหัสโปรเจคของคุณ"
          status={404}
          showBackButton
          showHomeButton
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-12 px-4 mt-16 relative">
      {/* Background with gradient */}
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          backgroundImage: `linear-gradient(to bottom, #090114, #0D0221)`,
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Stars background effect */}
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px), 
            radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 100px 100px',
          opacity: 0.4
        }}
      ></div>
      
      {/* Animated space objects */}
      <div className="fixed inset-0 -z-5 overflow-hidden">
        {/* Large purple planet */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#90278E]/10 blur-3xl"></div>
        
        {/* Small bright star */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white animate-pulse"></div>
        
        {/* Medium star */}
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 rounded-full bg-white animate-pulse"
             style={{ animationDuration: '3s' }}></div>
             
        {/* Pink nebula */}
        <div className="absolute bottom-0 left-20 w-96 h-96 rounded-full bg-[#FF5E8C]/10 blur-3xl"></div>
      </div>
      
      {/* Breadcrumb navigation */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg inline-flex items-center text-black/80 text-sm">
          <a href="/" className="hover:text-black transition-colors">หน้าหลัก</a>
          <span className="mx-2">/</span>
          <a href="/projects" className="hover:text-black transition-colors">โปรเจคทั้งหมด</a>
          <span className="mx-2">/</span>
          <span className="text-black/90">{project?.title || 'รายละเอียดโปรเจค'}</span>
        </div>
      </div>
      
      {/* Main content container */}
      <div className="max-w-6xl mx-auto">
        {/* Heading with orbit decoration */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-[#90278E]/30 rounded-full"></div>
              <div className="w-2 h-2 bg-[#FF5E8C] rounded-full absolute" 
                style={{
                  animation: 'orbit 8s linear infinite',
                }}></div>
              <RocketOutlined className="text-2xl text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-black">
            รายละเอียดโปรเจค
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#90278E] to-[#FF5E8C] mx-auto mt-2 rounded-full"></div>
        </div>
        
        {/* Main content with glass effect */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
          {/* Purple accent top border */}
          <div className="h-1.5 bg-gradient-to-r from-[#90278E] via-[#FF5E8C] to-[#90278E]"></div>
          
          {/* Main Content */}
          <div className="p-8">
            {/* Project Details */}
            <ProjectDetails project={project} />
            
          </div>
          
          <Divider style={{ margin: '0' }} />
          
          {/* Related Projects */}
          {relatedProjects && relatedProjects.length > 0 && (
            <div className="pb-8">
              <RelatedProjects projects={relatedProjects.filter(p => p.id !== projectId)} />
            </div>
          )}
          
          {/* Bottom actions */}
          <div className="px-8 py-6 bg-gray-50 flex justify-between items-center">
            <Button type="default" icon={<RocketOutlined />} href={PROJECT.ALL}>
              กลับสู่หน้าโปรเจคทั้งหมด
            </Button>
            
            {project?.createdAt && (
              <div className="text-sm text-gray-500">
                อัพเดทล่าสุด: {new Date(project.updatedAt || project.createdAt).toLocaleDateString('th-TH')}
              </div>
            )}
          </div>
          
          {/* Purple accent bottom border */}
          <div className="h-1.5 bg-gradient-to-r from-[#90278E] via-[#FF5E8C] to-[#90278E]"></div>
        </div>
      </div>
      
      {/* Style for orbit animation */}
      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(15px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProjectInfo;