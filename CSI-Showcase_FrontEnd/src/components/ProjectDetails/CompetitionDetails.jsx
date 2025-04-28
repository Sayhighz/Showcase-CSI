import React from 'react';
import { Card, Tag, Divider } from 'antd';
import { TrophyOutlined, CalendarOutlined } from '@ant-design/icons';

/**
 * Component แสดงรายละเอียดของโปรเจคประเภทการแข่งขัน (Competition)
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.competition - ข้อมูลการแข่งขัน
 * @param {Object} props.project - ข้อมูลโปรเจคทั้งหมด
 * @returns {JSX.Element} CompetitionDetails component
 */
const CompetitionDetails = ({ competition, project }) => {
  if (!competition) return null;

  return (
    <Card 
      className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
      title={
        <div className="flex items-center text-[#90278E]">
          <TrophyOutlined className="mr-2" />
          <span>ข้อมูลการแข่งขัน</span>
        </div>
      }
      bordered={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex">
            <span className="font-medium w-32">ชื่อการแข่งขัน:</span>
            <span className="text-gray-700">{competition.competition_name}</span>
          </div>
          
          <div className="flex">
            <span className="font-medium w-32">ปีที่แข่งขัน:</span>
            <span className="text-gray-700">{competition.competition_year || '-'}</span>
          </div>

          {competition.achievement && (
            <div className="flex">
              <span className="font-medium w-32">ผลงาน/รางวัล:</span>
              <span className="text-gray-700">{competition.achievement}</span>
            </div>
          )}

          {competition.competition_level && (
            <div className="flex">
              <span className="font-medium w-32">ระดับการแข่งขัน:</span>
              <span className="text-gray-700">{competition.competition_level}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {competition.team_members && (
            <div className="flex">
              <span className="font-medium w-32">สมาชิกทีม:</span>
              <span className="text-gray-700">{competition.team_members}</span>
            </div>
          )}
          
          {competition.venue && (
            <div className="flex">
              <span className="font-medium w-32">สถานที่จัดงาน:</span>
              <span className="text-gray-700">{competition.venue}</span>
            </div>
          )}
          
          {competition.organizer && (
            <div className="flex">
              <span className="font-medium w-32">ผู้จัดงาน:</span>
              <span className="text-gray-700">{competition.organizer}</span>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Highlight - เฉพาะเมื่อมีผลงานหรือรางวัล */}
      {competition.achievement && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center mb-2">
            <TrophyOutlined className="text-yellow-500 mr-2" />
            <span className="font-medium">ผลงาน/รางวัลที่ได้รับ</span>
          </div>
          <Tag color="gold" className="text-sm px-2 py-1">
            {competition.achievement}
          </Tag>
        </div>
      )}
    </Card>
  );
};

export default CompetitionDetails;