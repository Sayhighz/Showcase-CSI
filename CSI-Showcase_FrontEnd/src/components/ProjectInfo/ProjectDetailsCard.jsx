import React from 'react';
import { Card, Tag } from 'antd';
import { BookOutlined, TeamOutlined, TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { formatThaiDate } from '../../utils/dateUtils';

const ProjectDetailsCard = ({ project }) => {
  if (!project) return null;

  // แสดงรายละเอียดตามประเภทของโปรเจค
  const renderProjectTypeDetails = () => {
    switch (project.type) {
      case 'coursework':
        return (
          <div className="space-y-4">
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ประเภท</span>
              <Tag color="green" icon={<TeamOutlined />} className="m-0">งานในชั้นเรียน</Tag>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ชั้นปีที่เรียน</span>
              <span className="text-gray-800">ปี {project.studyYear}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ปีการศึกษา</span>
              <span className="text-gray-800">{project.year}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ภาคการศึกษา</span>
              <span className="text-gray-800">{project.semester === '1' ? '1' : project.semester === '2' ? '2' : 'ฤดูร้อน'}</span>
            </div>
          </div>
        );
      
      case 'academic':
        return (
          <div className="space-y-4">
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ประเภท</span>
              <Tag color="blue" icon={<BookOutlined />} className="m-0">บทความวิชาการ</Tag>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ชั้นปีที่เรียน</span>
              <span className="text-gray-800">ปี {project.studyYear}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ปีที่ตีพิมพ์</span>
              <span className="text-gray-800">{project.academic?.published_year || project.year}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">วันที่ตีพิมพ์</span>
              <span className="text-gray-800">
                {project.academic?.publication_date 
                  ? formatThaiDate(project.academic.publication_date) 
                  : 'ไม่ระบุ'}
              </span>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ปรับปรุงล่าสุด</span>
              <span className="text-gray-800">
                {project.academic?.last_updated 
                  ? formatThaiDate(project.academic.last_updated) 
                  : formatThaiDate(project.updatedAt)}
              </span>
            </div>
          </div>
        );
      
      case 'competition':
        return (
          <div className="space-y-4">
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ประเภท</span>
              <Tag color="gold" icon={<TrophyOutlined />} className="m-0">การแข่งขัน</Tag>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ชื่อการแข่งขัน</span>
              <span className="text-gray-800">{project.competition?.competition_name || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ปีที่แข่งขัน</span>
              <span className="text-gray-800">{project.competition?.competition_year || project.year}</span>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ชั้นปีที่แข่งขัน</span>
              <span className="text-gray-800">ปี {project.studyYear}</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ประเภท</span>
              <Tag>{project.type}</Tag>
            </div>
            <div className="flex justify-between border-b border-purple-100 pb-3">
              <span className="font-medium text-gray-600">ปีการศึกษา</span>
              <span className="text-gray-800">{project.year}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[#90278E] mb-4 flex items-center">
        <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
        ข้อมูลโปรเจค
      </h2>
      <Card 
        bordered={false} 
        className="rounded-xl shadow-lg border border-purple-100 relative overflow-hidden"
      >
        {/* Galaxy decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600 opacity-5 rounded-full blur-xl -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-800 opacity-5 rounded-full blur-xl -ml-6 -mb-6"></div>
        
        <div className="space-y-4 relative z-10">
          {renderProjectTypeDetails()}
          
          <div className="flex justify-between border-b border-purple-100 pb-3">
            <span className="font-medium text-gray-600">สถานะ</span>
            {project.status === 'approved' ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>อนุมัติแล้ว</Tag>
            ) : project.status === 'pending' ? (
              <Tag color="warning" icon={<ClockCircleOutlined />}>รอการอนุมัติ</Tag>
            ) : (
              <Tag color="error" icon={<CloseCircleOutlined />}>ไม่อนุมัติ</Tag>
            )}
          </div>
          
          <div className="flex justify-between border-b border-purple-100 pb-3">
            <span className="font-medium text-gray-600">ผู้ชม</span>
            <span className="flex items-center text-gray-800">
              <EyeOutlined className="mr-1 text-[#90278E]" /> {project.viewsCount || 0} ครั้ง
            </span>
          </div>
          
          <div className="flex justify-between border-b border-purple-100 pb-3">
            <span className="font-medium text-gray-600">วันที่สร้าง</span>
            <span className="flex items-center text-gray-800">
              <CalendarOutlined className="mr-1 text-[#90278E]" /> {formatThaiDate(project.createdAt)}
            </span>
          </div>
          
          <div className="flex justify-between pb-2">
            <span className="font-medium text-gray-600">อัปเดตล่าสุด</span>
            <span className="flex items-center text-gray-800">
              <CalendarOutlined className="mr-1 text-[#90278E]" /> {formatThaiDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectDetailsCard;