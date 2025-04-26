import React from 'react';
import { Tag, Avatar, Tooltip, Space, Divider, Badge, Card } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined, CalendarOutlined, EyeOutlined, UserOutlined, 
         DownloadOutlined, LinkOutlined, HeartOutlined, FilePdfOutlined } from '@ant-design/icons';
import ImageSlider from '../ImageSlider/ImageSlider';
import { formatThaiDate } from '../../utils/dateUtils';
import { getProjectTypeInfo } from '../../constants/projectTypes';
import { API_ENDPOINTS } from '../../constants';


/**
 * ProjectDetails component แสดงรายละเอียดของโปรเจค
 * ด้วยการออกแบบที่เรียบง่ายแต่สวยงาม
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.project - ข้อมูลโปรเจค
 * @returns {JSX.Element} ProjectDetails component
 */
const ProjectDetails = ({ project }) => {
  if (!project) return null;
  console.log(project)

  // Get project type information
  const projectTypeInfo = getProjectTypeInfo(project.type);

  // Prepare files for display
  const imageFiles = project?.files?.filter(file => file.type === 'image') || [];
  const pdfFiles = project?.files?.filter(file => file.type === 'pdf') || [];
  
  // Format coursework info if available
  const courseInfo = project.coursework ? {
    courseCode: project.coursework.course_code,
    courseName: project.coursework.course_name,
    instructor: project.coursework.instructor
  } : null;

  // Format contributors
  const contributors = project.contributors || [];
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return '#52c41a';
      case 'pending':
        return '#faad14';
      default:
        return '#d9d9d9';
    }
  };
  
  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'pending':
        return 'รออนุมัติ';
      default:
        return 'ไม่อนุมัติ';
    }
  };
  
  return (
    <div className="w-full relative">
      {/* Project Status Badge - ย้ายไปทางบนมุมขวา */}
      <div className="absolute top-0 right-0 z-20">
        <Badge
          color={getStatusColor(project.status)}
          text={
            <span className="text-sm font-medium">
              {getStatusText(project.status)}
            </span>
          }
        />
      </div>

      {/* Title Header - สวยงามและดึงดูดความสนใจ */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0D0221] mb-2">
          {project.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm">
          {/* โค้ดผสมระหว่าง Ant Design และ Tailwind */}
          <div className="flex items-center">
            <CalendarOutlined className="mr-1 text-[#90278E]" />
            <span>{formatThaiDate(project.createdAt, true)}</span>
          </div>
          
          <span className="text-gray-300">•</span>
          
          <div className="flex items-center">
            <EyeOutlined className="mr-1 text-[#90278E]" />
            <span>{project.viewsCount || 0} ครั้ง</span>
          </div>
          
          <span className="text-gray-300">•</span>
          
          {/* Project Type - แสดงอย่างชัดเจน */}
          {projectTypeInfo && (
            <Tag color={projectTypeInfo.color} icon={
              project.type === 'academic' ? <BookOutlined /> : 
              project.type === 'coursework' ? <TeamOutlined /> : 
              <TrophyOutlined />
            }>
              {projectTypeInfo.label}
            </Tag>
          )}
        </div>
      </div>

      {/* Image Slider - ปรับขนาดให้เหมาะสม */}
      <div className="mb-8">
        <ImageSlider 
          images={imageFiles.map(file => file.path)}
          video={project.coursework?.video_file_id || null}
          pdfFile={pdfFiles.length > 0 ? pdfFiles[0] : null}
          title={project.title} 
        />
      </div>

      {/* Content Section - จัดเป็น Layout สองคอลัมน์เมื่อหน้าจอใหญ่พอ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - ⅔ ของหน้าจอในหน้าจอใหญ่ */}
        <div className="lg:col-span-2">
          {/* Project Description Card - ตกแต่งให้น่าอ่าน */}
          <Card 
            className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
            title={
              <div className="flex items-center text-[#90278E]">
                <BookOutlined className="mr-2" />
                <span>รายละเอียดโปรเจค</span>
              </div>
            }
            bordered={false}
          >
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          </Card>

          {/* Course Information Card - เฉพาะเมื่อมีข้อมูล */}
          {courseInfo && (
            <Card 
              className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
              title={
                <div className="flex items-center text-[#90278E]">
                  <TeamOutlined className="mr-2" />
                  <span>ข้อมูลรายวิชา</span>
                </div>
              }
              bordered={false}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium w-32">รหัสวิชา:</span>
                    <span>{courseInfo.courseCode}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">ชื่อวิชา:</span>
                    <span>{courseInfo.courseName}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">อาจารย์ผู้สอน:</span>
                    <span>{courseInfo.instructor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium w-32">ชั้นปี:</span>
                    <span>{project.studyYear}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">ภาคการศึกษา:</span>
                    <span>{project.semester}/{project.year}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* PDF Files Card - แสดงเฉพาะเมื่อมีไฟล์ */}
          {pdfFiles.length > 0 && (
            <Card 
              className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
              title={
                <div className="flex items-center text-[#90278E]">
                  <DownloadOutlined className="mr-2" />
                  <span>เอกสารดาวน์โหลด</span>
                </div>
              }
              bordered={false}
            >
              <ul className="space-y-2">
                {pdfFiles.map((pdf, index) => (
                  <li key={index} className="flex items-center">
                    <FilePdfOutlined className="text-[#FF5E8C] mr-2" />
                    <a 
                      href={pdf.path} 
                      download={pdf.name}
                      className="text-[#90278E] hover:text-[#FF5E8C] transition-colors"
                    >
                      {pdf.name}
                    </a>
                    <span className="text-xs text-gray-400 ml-2">
                      {pdf.size && `(${Math.round(pdf.size / 1024)} KB)`}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar - ⅓ ของหน้าจอในหน้าจอใหญ่ */}
        <div className="lg:col-span-1">
          {/* Author and Contributors Card */}
          <Card 
            className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
            title={
              <div className="flex items-center text-[#90278E]">
                <UserOutlined className="mr-2" />
                <span>ผู้จัดทำ</span>
              </div>
            }
            bordered={false}
          >
            {/* Main Author */}
            {project.author && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="font-semibold mb-2 text-gray-500">ผู้จัดทำหลัก:</p>
                <div className="flex items-center">
                  <Avatar 
                    src={`${API_ENDPOINTS.BASE}/${project.author.image}`} 
                    size="large"
                    className="bg-gradient-to-r from-[#90278E] to-[#FF5E8C]"
                  >
                    {project.author.fullName?.charAt(0) || project.author.username?.charAt(0) || '?'}
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{project.author.fullName}</p>
                    <p className="text-gray-500 text-sm">@{project.author.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contributors */}
            {contributors.length > 0 && (
              <div>
                <p className="font-semibold mb-2 text-gray-500">ผู้ร่วมจัดทำ:</p>
                <div className="space-y-3">
                  {contributors.map((contributor, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar 
                        src={`${API_ENDPOINTS.BASE}/${contributor?.image}`} 
                        size="small"
                        className="bg-gradient-to-r from-[#90278E] to-[#FF5E8C]"
                      >
                        {contributor.full_name?.charAt(0) || contributor.username?.charAt(0) || '?'}
                      </Avatar>
                      <span className="ml-2">{contributor.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ถ้าไม่มีผู้ร่วมจัดทำ */}
            {contributors.length === 0 && project.author && (
              <div className="text-gray-500 text-sm italic">
                ไม่มีผู้ร่วมจัดทำเพิ่มเติม
              </div>
            )}
          </Card>
          
          {/* Project Stats Card */}
          <Card 
            className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
            title={
              <div className="flex items-center text-[#90278E]">
                <TrophyOutlined className="mr-2" />
                <span>สถิติโปรเจค</span>
              </div>
            }
            bordered={false}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ยอดเข้าชม:</span>
                <span className="font-medium">{project.viewsCount || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">สร้างเมื่อ:</span>
                <span className="font-medium">{formatThaiDate(project.createdAt)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ปรับปรุงล่าสุด:</span>
                <span className="font-medium">{formatThaiDate(project.updatedAt || project.createdAt)}</span>
              </div>
            </div>
          </Card>
          
          {/* Tags Card - เป็นส่วนเสริมที่มีประโยชน์สำหรับ SEO */}
          {project.tags && project.tags.length > 0 && (
            <Card 
              className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
              title={
                <div className="flex items-center text-[#90278E]">
                  <span className="mr-2">#</span>
                  <span>แท็ก</span>
                </div>
              }
              bordered={false}
            >
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Tag 
                    key={index}
                    className="px-2 py-1 rounded-md cursor-pointer"
                    color={index % 2 === 0 ? '#90278E' : '#FF5E8C'}
                  >
                    #{tag}
                  </Tag>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;