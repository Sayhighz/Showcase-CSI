import React, { useEffect, useState, useMemo } from 'react';
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
  TrophyOutlined,
  HomeOutlined,
  RightOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useProject } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { PROJECT, HOME } from '../../constants/routes';
import { formatThaiDate } from '../../utils/dateUtils';
import ProjectDetailsCard from '../../components/ProjectInfo/ProjectDetailsCard';
import ProjectMediaDisplay from '../../components/ProjectInfo/ProjectMediaDisplay';
import ProjectContributors from '../../components/ProjectInfo/ProjectContributors';
import RelatedProjects from '../../components/ProjectInfo/RelatedProjects';

const { confirm } = Modal;

// CSS Variables สำหรับสีหลักตามธีม - ย้ายออกมานอก component เพื่อหลีกเลี่ยงการสร้างใหม่ทุกรอบ
const themeColors = {
  primary: '#90278E',        // สีม่วงเข้ม
  secondary: '#B252B0',      // สีม่วงอ่อน
  dark: '#5E1A5C',           // สีม่วงเข้มมาก
  lightPurple: '#F5EAFF',    // สีม่วงอ่อนมาก (background)
  mediumPurple: '#E0D1FF',   // สีม่วงกลาง
  textLight: '#FFE6FF',      // สีตัวอักษรบนพื้นเข้ม
  textSecondary: '#F8CDFF'   // สีตัวอักษรรอง
};

// กำหนด styles สำหรับ gradient text
const headingGradient = {
  background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

// Animation variants
const containerAnimation = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const buttonAnimation = {
  hover: { scale: 1.05, boxShadow: '0 5px 15px rgba(144, 39, 142, 0.3)' },
  tap: { scale: 0.95 }
};

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

  // สร้าง background stars สำหรับพื้นหลัง
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.4 + 0.1;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      
      return (
        <div 
          key={`star-${i}`} 
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            left: `${left}%`,
            top: `${top}%`,
            backgroundColor: themeColors.primary,
            opacity: opacity,
            boxShadow: `0 0 ${size}px rgba(144, 39, 142, ${opacity * 0.7})`
          }}
        />
      );
    });
  }, []);

  // แสดง loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5EAFF] to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#E0D1FF] backdrop-filter backdrop-blur-md bg-opacity-80">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        </div>
      </div>
    );
  }

  // แสดงข้อความถ้ามี error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5EAFF] to-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-red-100 backdrop-filter backdrop-blur-md bg-opacity-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
              <Button 
                type="primary" 
                onClick={() => navigate('/projects/all')} 
                style={{ 
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(144, 39, 142, 0.2)'
                }}
                className="rounded-full h-10 px-6"
              >
                กลับไปหน้ารวมโปรเจค
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // แสดงข้อความถ้าไม่พบโปรเจค
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5EAFF] to-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-[#E0D1FF] backdrop-filter backdrop-blur-md bg-opacity-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold" style={headingGradient}>ไม่พบโปรเจค</h2>
            <p className="text-gray-600 mb-6">ไม่พบข้อมูลโปรเจคที่คุณต้องการดู</p>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
              <Button 
                type="primary" 
                onClick={() => navigate('/projects/all')}
                style={{ 
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(144, 39, 142, 0.2)'
                }}
                className="rounded-full h-10 px-6"
              >
                กลับไปหน้ารวมโปรเจค
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const prepareContributorsData = (contributors) => {
    if (!contributors) return [];
    
    // ถ้าเป็น JSON string ให้แปลงเป็น array
    if (typeof contributors === 'string') {
      try {
        const parsed = JSON.parse(contributors);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse contributors JSON:', e);
        return [];
      }
    }
    
    // ถ้าเป็น array อยู่แล้ว
    if (Array.isArray(contributors)) {
      return contributors;
    }
    
    return [];
  };

  const handleEdit = () => {
    navigate(PROJECT.EDIT(projectId));
  };

  const handleDelete = () => {
    confirm({
      title: 'คุณต้องการลบโปรเจคนี้ใช่หรือไม่?',
      icon: <ExclamationCircleOutlined style={{ color: themeColors.primary }} />,
      content: 'การลบโปรเจคจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?',
      okText: 'ใช่ ลบโปรเจค',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      okButtonProps: {
        style: { backgroundColor: '#f5222d', borderColor: '#f5222d' }
      },
      cancelButtonProps: {
        style: { borderColor: themeColors.primary, color: themeColors.primary }
      },
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
        return (
          <Tag 
            color="#52C41A" 
            icon={<TeamOutlined />}
            style={{ 
              borderRadius: '16px', 
              padding: '0 12px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(82, 196, 26, 0.2)'
            }}
          >
            งานในชั้นเรียน
          </Tag>
        );
      case 'academic':
        return (
          <Tag 
            color="#1890FF" 
            icon={<BookOutlined />}
            style={{ 
              borderRadius: '16px', 
              padding: '0 12px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(24, 144, 255, 0.2)'
            }}
          >
            บทความวิชาการ
          </Tag>
        );
      case 'competition':
        return (
          <Tag 
            color="#FAAD14" 
            icon={<TrophyOutlined />}
            style={{ 
              borderRadius: '16px', 
              padding: '0 12px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(250, 173, 20, 0.2)'
            }}
          >
            การแข่งขัน
          </Tag>
        );
      default:
        return (
          <Tag
            color={themeColors.primary}
            style={{ 
              borderRadius: '16px', 
              padding: '0 12px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(144, 39, 142, 0.2)'
            }}
          >
            {project.type}
          </Tag>
        );
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#F5EAFF] to-white relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerAnimation}
    >
      {/* กลุ่มของดาวพื้นหลัง */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        {backgroundStars}
        
        {/* Decorative blobs */}
        <motion.div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-[#B252B0]"
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute top-1/3 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-[#90278E]"
          animate={{ 
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2 
          }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb */}
        <motion.div 
          className="mb-4"
          variants={itemAnimation}
        >
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer flex items-center">
              <HomeOutlined className="mr-1" />
              <span onClick={() => navigate(HOME)}>หน้าหลัก</span>
            </motion.div>
            <span className="mx-2 text-gray-400"><RightOutlined style={{ fontSize: '10px' }}/></span>
            <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer">
              <span onClick={() => navigate('/projects/all')}>ผลงานทั้งหมด</span>
            </motion.div>
            <span className="mx-2 text-gray-400"><RightOutlined style={{ fontSize: '10px' }}/></span>
            <span className="text-[#90278E]">รายละเอียดผลงาน</span>
          </div>
        </motion.div>
        
        {/* Header section with galaxy theme */}
        <motion.div 
          className="mb-8 rounded-xl shadow-lg p-6 relative overflow-hidden"
          variants={itemAnimation}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(144, 39, 142, 0.1)',
            boxShadow: '0 8px 32px rgba(144, 39, 142, 0.08)'
          }}
        >
          {/* Galaxy decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#90278E] opacity-5 rounded-full blur-xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#B252B0] opacity-5 rounded-full blur-xl -ml-6 -mb-6"></div>
          
          <div className="relative z-10">
            <h1 
              className="text-3xl font-bold mb-4"
              style={headingGradient}
            >
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-3 mb-6">
              {getProjectTypeTag()}
              <span className="inline-flex items-center text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full">
                <HistoryOutlined className="mr-1" style={{ color: themeColors.primary }} /> อัปเดตล่าสุด: {formatThaiDate(project.updatedAt)}
              </span>
              <span className="inline-flex items-center text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full">
                <EyeOutlined className="mr-1" style={{ color: themeColors.primary }} /> {project.viewsCount} ครั้ง
              </span>
              <span className="inline-flex items-center text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full">
                <CalendarOutlined className="mr-1" style={{ color: themeColors.primary }} /> ปีการศึกษา {project.year} / {project.semester}
              </span>
              <span className="inline-flex items-center text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full">
                <TeamOutlined className="mr-1" style={{ color: themeColors.primary }} /> ชั้นปีที่ {project.studyYear}
              </span>
            </div>

            {isOwner && (
              <div className="flex gap-3 mb-2">
                <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={handleEdit}
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(144, 39, 142, 0.2)'
                    }}
                    className="transition-all"
                  >
                    แก้ไขโปรเจค
                  </Button>
                </motion.div>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={handleDelete}
                    style={{ 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)'
                    }}
                    className="transition-all"
                  >
                    ลบโปรเจค
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media section - takes 2/3 of space on large screens */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemAnimation}
          >
            <ProjectMediaDisplay project={project} />
            
            <motion.div 
              className="mb-6 rounded-xl shadow-lg p-6 relative"
              variants={itemAnimation}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(144, 39, 142, 0.1)',
                boxShadow: '0 8px 32px rgba(144, 39, 142, 0.08)'
              }}
            >
              <h2 
                className="text-xl font-semibold mb-4 flex items-center"
                style={headingGradient}
              >
                <span className="w-1 h-6 bg-gradient-to-b from-[#90278E] to-[#B252B0] mr-2 rounded inline-block"></span>
                รายละเอียดโปรเจค
              </h2>
              <div className="text-gray-700 whitespace-pre-line">{project.description}</div>
            </motion.div>
          </motion.div>

          {/* Details section - takes 1/3 of space on large screens */}
          <motion.div 
            className="space-y-8"
            variants={itemAnimation}
          >
            <ProjectDetailsCard project={project} />
            <ProjectContributors 
              author={project.author} 
              contributors={prepareContributorsData(project.contributors)} 
            />
          </motion.div>
        </div>
        
        {/* Related Projects section */}
        <motion.div variants={itemAnimation}>
          <RelatedProjects projects={relatedProjects} />
        </motion.div>
      </div>
      
      {/* Global style overrides */}
      <style jsx global>{`
        .ant-tag {
          border: none;
          display: inline-flex;
          align-items: center;
        }
        
        .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(144, 39, 142, 0.15);
          border: 1px solid rgba(144, 39, 142, 0.1);
        }
        
        .ant-modal-header {
          border-bottom: 1px solid rgba(144, 39, 142, 0.1);
        }
        
        .ant-modal-title {
          color: ${themeColors.primary};
          font-weight: 600;
        }
        
        .ant-btn:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .ant-skeleton-title, .ant-skeleton-paragraph li {
          background: linear-gradient(90deg, #F5EAFF 25%, #FFFFFF 50%, #F5EAFF 75%);
          background-size: 400% 100%;
          animation: skeleton-loading 1.5s ease infinite;
        }
        
        @keyframes skeleton-loading {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ProjectInfo;