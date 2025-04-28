import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Skeleton, Tag, message, Modal, Divider } from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  EyeOutlined, 
  HistoryOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useProject } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { PROJECT } from '../../constants/routes';
import { formatThaiDate } from '../../utils/dateUtils';
import ProjectDetailsCard from '../../components/ProjectInfo/ProjectDetailsCard';
import ProjectMediaDisplay from '../../components/ProjectInfo/ProjectMediaDisplay';
import ProjectContributors from '../../components/ProjectInfo/ProjectContributors';
import RelatedProjects from '../../components/ProjectInfo/RelatedProjects';

const { confirm } = Modal;

const ProjectInfo = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, hasPermission } = useAuth();
  const { project, isLoading, error, fetchProjectDetails, deleteProject, fetchTopProjects } = useProject(projectId);
  const [isOwner, setIsOwner] = useState(false);

  // ดึงโปรเจค
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProjectDetails(projectId);
  }, [projectId, fetchProjectDetails]);

  // ดึงโปรเจคที่น่าสนใจโดยใช้ fetchTopProjects
  const [relatedProjects, setRelatedProjects] = useState([]);
  
  useEffect(() => {
    const getTopProjects = async () => {
      try {
        // ใช้ fetchTopProjects เพื่อดึงโปรเจคยอดนิยม
        const topProjects = await fetchTopProjects(4);
        
        if (topProjects && topProjects.length > 0) {
          // กรองโปรเจคปัจจุบันออก
          const filtered = topProjects.filter(
            item => item.id !== parseInt(projectId) && 
                   item.projectId !== parseInt(projectId)
          );
          
          // กำหนดข้อมูลโปรเจคที่น่าสนใจ
          setRelatedProjects(filtered);
        }
      } catch (err) {
        console.error('Error fetching top projects:', err);
        // ถ้าเกิดข้อผิดพลาด ให้ใช้ข้อมูลว่าง
        setRelatedProjects([]);
      }
    };
    
    // เรียกใช้ฟังก์ชันดึงข้อมูลโปรเจคยอดนิยม
    getTopProjects();
  }, [projectId, fetchTopProjects]);

  useEffect(() => {
    if (project && user) {
      // ตรวจสอบว่าผู้ใช้ปัจจุบันเป็นเจ้าของโปรเจคหรือไม่
      setIsOwner(project.author.id === user.id || hasPermission('manage_all_projects'));
    }
  }, [project, user, hasPermission]);

  // แสดง loading
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  }

  // แสดงข้อความถ้ามี error
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button type="primary" onClick={() => navigate('/projects/all')} 
                  className="bg-[#90278E] hover:bg-[#7b1f79] shadow-md">
            กลับไปหน้ารวมโปรเจค
          </Button>
        </div>
      </div>
    );
  }

  // แสดงข้อความถ้าไม่พบโปรเจค
  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบโปรเจค</h2>
          <p className="text-gray-600 mb-6">ไม่พบข้อมูลโปรเจคที่คุณต้องการดู</p>
          <Button type="primary" onClick={() => navigate('/projects/all')}
                  className="bg-[#90278E] hover:bg-[#7b1f79] shadow-md">
            กลับไปหน้ารวมโปรเจค
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(PROJECT.EDIT(projectId));
  };

  const handleDelete = () => {
    confirm({
      title: 'คุณต้องการลบโปรเจคนี้ใช่หรือไม่?',
      icon: <ExclamationCircleOutlined />,
      content: 'การลบโปรเจคจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?',
      okText: 'ใช่ ลบโปรเจค',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteProject(projectId);
          message.success('ลบโปรเจคสำเร็จ');
          navigate('/projects/my');
        } catch (err) {
          message.error('เกิดข้อผิดพลาดในการลบโปรเจค');
        }
      },
    });
  };

  const getProjectTypeTag = () => {
    switch (project.type) {
      case 'coursework':
        return <Tag color="green" icon={<TeamOutlined />}>งานในชั้นเรียน</Tag>;
      case 'academic':
        return <Tag color="blue" icon={<BookOutlined />}>บทความวิชาการ</Tag>;
      case 'competition':
        return <Tag color="gold" icon={<TrophyOutlined />}>การแข่งขัน</Tag>;
      default:
        return <Tag>{project.type}</Tag>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header section with galaxy theme */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-purple-100 relative overflow-hidden">
          {/* Galaxy decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900 opacity-5 rounded-full blur-xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600 opacity-5 rounded-full blur-xl -ml-6 -mb-6"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-[#90278E] mb-4">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-3 mb-6">
              {getProjectTypeTag()}
              <span className="inline-flex items-center text-gray-500 text-sm">
                <HistoryOutlined className="mr-1" /> อัปเดตล่าสุด: {formatThaiDate(project.updatedAt)}
              </span>
              <span className="inline-flex items-center text-gray-500 text-sm">
                <EyeOutlined className="mr-1" /> {project.viewsCount} ครั้ง
              </span>
              <span className="inline-flex items-center text-gray-500 text-sm">
                <CalendarOutlined className="mr-1" /> ปีการศึกษา {project.year} / {project.semester}
              </span>
              <span className="inline-flex items-center text-gray-500 text-sm">
                <TeamOutlined className="mr-1" /> ชั้นปีที่ {project.studyYear}
              </span>
            </div>

            {isOwner && (
              <div className="flex gap-3 mb-2">
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                  className="bg-[#90278E] hover:bg-[#7b1f79] shadow-md transition-all"
                >
                  แก้ไขโปรเจค
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleDelete}
                  className="shadow-md transition-all"
                >
                  ลบโปรเจค
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media section - takes 2/3 of space on large screens */}
          <div className="lg:col-span-2">
            <ProjectMediaDisplay project={project} />
            
            <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <h2 className="text-xl font-semibold text-[#90278E] mb-4 flex items-center">
                <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
                รายละเอียดโปรเจค
              </h2>
              <div className="text-gray-700 whitespace-pre-line">{project.description}</div>
            </div>
          </div>

          {/* Details section - takes 1/3 of space on large screens */}
          <div className="space-y-8">
            <ProjectDetailsCard project={project} />
            <ProjectContributors 
              author={project.author} 
              contributors={project.contributors || []} 
            />
          </div>
        </div>
        
        {/* Related Projects section */}
        <RelatedProjects projects={relatedProjects} />
      </div>
    </div>
  );
};

export default ProjectInfo;