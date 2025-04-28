import React from 'react';
import { Card, Tag, Divider, Button } from 'antd';
import { BookOutlined, LinkOutlined, FilePdfOutlined, GlobalOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '../../constants';

/**
 * Component แสดงรายละเอียดของโปรเจคประเภทบทความวิชาการ (Academic)
 * 
 * @param {Object} props - Props ของ component
 * @param {Object} props.academic - ข้อมูลบทความวิชาการ
 * @param {Object} props.project - ข้อมูลโปรเจคทั้งหมด
 * @returns {JSX.Element} AcademicDetails component
 */
const AcademicDetails = ({ academic, project }) => {
  if (!academic) return null;

  return (
    <Card 
      className="mb-6 shadow-sm border-[#90278E]/10 hover:shadow-md transition-shadow"
      title={
        <div className="flex items-center text-[#90278E]">
          <BookOutlined className="mr-2" />
          <span>ข้อมูลบทความวิชาการ</span>
        </div>
      }
      bordered={false}
    >
      {/* Abstract Section */}
      {academic.abstract && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">บทคัดย่อ</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-gray-700 whitespace-pre-line">{academic.abstract}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {academic.authors && (
            <div className="flex">
              <span className="font-medium w-32">ผู้เขียน:</span>
              <span className="text-gray-700">{academic.authors}</span>
            </div>
          )}
          
          {academic.publication && (
            <div className="flex">
              <span className="font-medium w-32">แหล่งตีพิมพ์:</span>
              <span className="text-gray-700">{academic.publication}</span>
            </div>
          )}
          
          {academic.published_year && (
            <div className="flex">
              <span className="font-medium w-32">ปีที่ตีพิมพ์:</span>
              <span className="text-gray-700">{academic.published_year}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {academic.doi && (
            <div className="flex">
              <span className="font-medium w-32">DOI:</span>
              <a 
                href={academic.doi.startsWith('http') ? academic.doi : `https://doi.org/${academic.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#90278E] hover:text-[#FF5E8C] flex items-center"
              >
                <LinkOutlined className="mr-1" />
                {academic.doi}
              </a>
            </div>
          )}
          
          {academic.publication_date && (
            <div className="flex">
              <span className="font-medium w-32">วันที่ตีพิมพ์:</span>
              <span className="text-gray-700">
                {new Date(academic.publication_date).toLocaleDateString('th-TH')}
              </span>
            </div>
          )}
          
          {academic.journal && (
            <div className="flex">
              <span className="font-medium w-32">วารสาร:</span>
              <span className="text-gray-700">{academic.journal}</span>
            </div>
          )}
        </div>
      </div>

      {/* Keywords Section */}
      {academic.keywords && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center mb-2">
            <span className="font-medium">คำสำคัญ:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {academic.keywords.split(',').map((keyword, index) => (
              <Tag 
                key={index}
                className="px-2 py-1 rounded-md"
                color="#90278E"
              >
                {keyword.trim()}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Paper File Section */}
      {academic.paper_file && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center mb-2">
            <FilePdfOutlined className="text-[#FF5E8C] mr-2" />
            <span className="font-medium">เอกสารฉบับเต็ม</span>
          </div>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            href={`${API_ENDPOINTS.BASE}/${academic.paper_file}`}
            target="_blank"
            className="bg-[#90278E] hover:bg-[#FF5E8C]"
          >
            ดาวน์โหลดเอกสารฉบับเต็ม
          </Button>
        </div>
      )}

      {/* External Link Section */}
      {academic.external_link && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center mb-2">
            <GlobalOutlined className="text-[#90278E] mr-2" />
            <span className="font-medium">แหล่งข้อมูลเพิ่มเติม</span>
          </div>
          <a 
            href={academic.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#90278E] hover:text-[#FF5E8C] flex items-center"
          >
            <LinkOutlined className="mr-1" />
            {academic.external_link}
          </a>
        </div>
      )}
    </Card>
  );
};

export default AcademicDetails;