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
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ประเภท</span>
              <Tag color="green" icon={<TeamOutlined />} className="m-0">งานในชั้นเรียน</Tag>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ชั้นปีที่เรียน</span>
              <span className="text-[#24292f]">ปี {project.studyYear}</span>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ปีการศึกษา</span>
              <span className="text-[#24292f]">{project.year}</span>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ภาคการศึกษา</span>
              <span className="text-[#24292f]">{project.semester === '1' ? '1' : project.semester === '2' ? '2' : 'ฤดูร้อน'}</span>
            </div>
          </div>
        );
      
      case 'academic':
        return (
          <div className="space-y-4">
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ประเภท</span>
              <Tag color="blue" icon={<BookOutlined />} className="m-0">บทความวิชาการ</Tag>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ชั้นปีที่เรียน</span>
              <span className="text-[#24292f]">ปี {project.studyYear}</span>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ปีที่ตีพิมพ์</span>
              <span className="text-[#24292f]">{project.academic?.published_year || project.year}</span>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">วันที่ตีพิมพ์</span>
              <span className="text-[#24292f]">
                {project.academic?.publication_date 
                  ? formatThaiDate(project.academic.publication_date) 
                  : 'ไม่ระบุ'}
              </span>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ปรับปรุงล่าสุด</span>
              <span className="text-[#24292f]">
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
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ประเภท</span>
              <Tag color="gold" icon={<TrophyOutlined />} className="m-0">การแข่งขัน</Tag>
            </div>
            <div className="border-b border-opacity-20 border-[#90278E] pb-3">
              <div className="font-medium text-[#24292f] mb-1">ชื่อการแข่งขัน</div>
              <div className="text-[#24292f] text-left break-words">{project.competition?.competition_name || 'ไม่ระบุ'}</div>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ปีที่แข่งขัน</span>
              <span className="text-[#24292f]">{project.competition?.competition_year || project.year}</span>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ชั้นปีที่แข่งขัน</span>
              <span className="text-[#24292f]">ปี {project.studyYear}</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ประเภท</span>
              <Tag>{project.type}</Tag>
            </div>
            <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
              <span className="font-medium text-[#24292f]">ปีการศึกษา</span>
              <span className="text-[#24292f]">{project.year}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#90278E] mb-4 flex items-center">
        <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
        ข้อมูลโปรเจค
      </h2>
      <Card 
        bordered={false} 
        className="rounded-xl shadow-lg bg-white bg-opacity-80 backdrop-filter backdrop-blur-md border border-[#90278E] border-opacity-20 relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* Galaxy decorative elements with proper purple theme colors */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#B252B0] opacity-10 rounded-full blur-xl -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#5E1A5C] opacity-10 rounded-full blur-xl -ml-6 -mb-6"></div>
        
        <div className="space-y-4 relative z-10">
          {renderProjectTypeDetails()}
          
          <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
            <span className="font-medium text-[#24292f]">สถานะ</span>
            {project.status === 'approved' ? (
              <Tag color="#90278E" icon={<CheckCircleOutlined />}>อนุมัติแล้ว</Tag>
            ) : project.status === 'pending' ? (
              <Tag color="#B252B0" icon={<ClockCircleOutlined />}>รอการอนุมัติ</Tag>
            ) : (
              <Tag color="#5E1A5C" icon={<CloseCircleOutlined />}>ไม่อนุมัติ</Tag>
            )}
          </div>
          
          <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
            <span className="font-medium text-[#24292f]">ผู้ชม</span>
            <span className="flex items-center text-[#24292f]">
              <EyeOutlined className="mr-1 text-[#90278E]" /> {project.viewsCount || 0} ครั้ง
            </span>
          </div>
          
          <div className="flex justify-between border-b border-opacity-20 border-[#90278E] pb-3">
            <span className="font-medium text-[#24292f]">วันที่สร้าง</span>
            <span className="flex items-center text-[#24292f]">
              <CalendarOutlined className="mr-1 text-[#90278E]" /> {formatThaiDate(project.createdAt)}
            </span>
          </div>
          
          <div className="flex justify-between pb-2">
            <span className="font-medium text-[#24292f]">อัปเดตล่าสุด</span>
            <span className="flex items-center text-[#24292f]">
              <CalendarOutlined className="mr-1 text-[#90278E]" /> {formatThaiDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectDetailsCard;