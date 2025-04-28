import React, { useState } from 'react';
import { Tabs, Image, Button, Card } from 'antd';
import { FileTextOutlined, FilePdfOutlined, DownloadOutlined, PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { getVideoEmbedUrl } from '../../utils/fileUtils';

const { TabPane } = Tabs;

const ProjectMediaDisplay = ({ project }) => {
  const [activeTab, setActiveTab] = useState('1');
  
  if (!project) return null;

  // ฟังก์ชั่นแปลง YouTube, TikTok, Facebook URL เป็น Embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    return getVideoEmbedUrl(url);
  };

  // ฟังก์ชั่นสำหรับตรวจสอบประเภทไฟล์จาก URL
  const getFileType = (url) => {
    if (!url) return null;
    
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['mp4', 'webm', 'mov'].includes(extension)) {
      return 'video';
    }
    return 'unknown';
  };

  // สร้างข้อมูลสำหรับแท็บที่จะแสดง
  const getTabs = () => {
    const tabs = [];
    
    // ตามประเภทของโปรเจค
    switch (project.type) {
      case 'coursework':
        // Poster Tab
        if (project.coursework?.poster) {
          tabs.push({
            key: '1',
            title: 'โปสเตอร์',
            icon: <PictureOutlined />,
            content: (
              <div className="p-4 text-center bg-gradient-to-b from-purple-50 to-white">
                <Image 
                  src={`${import.meta.env.VITE_API_URL}/${project.coursework.poster}`} 
                  alt="Poster" 
                  className="max-h-[500px] object-contain rounded-md shadow-md"
                  preview={{
                    mask: <div className="text-[#90278E]">ดูเต็มจอ</div>
                  }}
                />
              </div>
            )
          });
        }
        
        // Image Tab
        if (project.coursework?.image) {
          tabs.push({
            key: '2',
            title: 'รูปภาพเพิ่มเติม',
            icon: <PictureOutlined />,
            content: (
              <div className="p-4 text-center bg-gradient-to-b from-purple-50 to-white">
                <Image 
                  src={`${import.meta.env.VITE_API_URL}/${project.coursework.image}`} 
                  alt="Additional Image" 
                  className="max-h-[500px] object-contain rounded-md shadow-md"
                  preview={{
                    mask: <div className="text-[#90278E]">ดูเต็มจอ</div>
                  }}
                />
              </div>
            )
          });
        }
        
        // Video Tab (URL)
        if (project.coursework?.clip_video) {
          const embedUrl = getEmbedUrl(project.coursework.clip_video);
          if (embedUrl) {
            tabs.push({
              key: '3',
              title: 'วิดีโอ',
              icon: <VideoCameraOutlined />,
              content: (
                <div className="relative w-full h-0 pb-[56.25%] overflow-hidden my-4 rounded-lg shadow-md">
                  <iframe 
                    src={embedUrl}
                    title="Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-md"
                  />
                </div>
              )
            });
          }
        }
        
        // Video File Tab
        if (project.coursework?.courseworkVideo) {
          tabs.push({
            key: '4',
            title: 'ไฟล์วิดีโอ',
            icon: <VideoCameraOutlined />,
            content: (
              <div className="relative w-full h-0 pb-[56.25%] overflow-hidden my-4 rounded-lg shadow-md">
                <video 
                  controls 
                  src={`${import.meta.env.VITE_API_URL}/${project.coursework.courseworkVideo}`}
                  className="absolute top-0 left-0 w-full h-full rounded-md"
                />
              </div>
            )
          });
        }
        break;
        
      case 'academic':
        // Paper File Tab
        if (project.academic?.paper_file) {
          tabs.push({
            key: '1',
            title: 'เอกสารบทความ',
            icon: <FilePdfOutlined />,
            content: (
              <div className="p-4 bg-gradient-to-b from-purple-50 to-white">
                <Card 
                  title="เอกสารบทความวิชาการ" 
                  className="rounded-lg shadow-md"
                  headStyle={{ background: 'linear-gradient(90deg, #90278E 0%, #a447a2 100%)', color: 'white' }}
                >
                  <p className="mb-4">คุณสามารถดาวน์โหลดหรือเปิดดูเอกสารบทความได้จากลิงก์ด้านล่าง</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      href={`${import.meta.env.VITE_API_URL}/${project.academic.paper_file}`}
                      target="_blank"
                      className="bg-[#90278E] hover:bg-[#7b1f79] shadow-md transition-all"
                    >
                      ดาวน์โหลดเอกสาร
                    </Button>
                    <Button
                      icon={<FileTextOutlined />}
                      href={`${import.meta.env.VITE_API_URL}/${project.academic.paper_file}`}
                      target="_blank"
                      className="shadow-sm hover:shadow transition-all"
                    >
                      เปิดดูเอกสาร
                    </Button>
                  </div>
                </Card>
              </div>
            )
          });
        }
        break;
        
      case 'competition':
        // Poster Tab
        if (project.competition?.poster) {
          tabs.push({
            key: '1',
            title: 'โปสเตอร์',
            icon: <PictureOutlined />,
            content: (
              <div className="p-4 text-center bg-gradient-to-b from-purple-50 to-white">
                <Image 
                  src={`${import.meta.env.VITE_API_URL}/${project.competition.poster}`} 
                  alt="Competition Poster" 
                  className="max-h-[500px] object-contain rounded-md shadow-md"
                  preview={{
                    mask: <div className="text-[#90278E]">ดูเต็มจอ</div>
                  }}
                />
              </div>
            )
          });
        }
        break;
        
      default:
        break;
    }
    
    return tabs;
  };
  
  const tabs = getTabs();
  
  // ถ้าไม่มีสื่อใดๆ
  if (tabs.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#90278E] mb-4 flex items-center">
          <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
          สื่อโปรเจค
        </h2>
        <Card 
          title="ไม่มีสื่อสำหรับโปรเจคนี้" 
          className="rounded-xl shadow-md border border-purple-100"
          headStyle={{ background: 'linear-gradient(90deg, #f9f0ff 0%, #f0e6fa 100%)', color: '#90278E' }}
        >
          <p className="text-gray-500">โปรเจคนี้ไม่มีโปสเตอร์ รูปภาพ วิดีโอ หรือไฟล์เอกสารที่แสดงได้</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[#90278E] mb-4 flex items-center">
        <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
        สื่อโปรเจค
      </h2>
      <div className="bg-white rounded-xl shadow-lg p-1 border border-purple-100 relative overflow-hidden">
        {/* Galaxy decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500 opacity-5 rounded-full blur-xl -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-800 opacity-5 rounded-full blur-xl -ml-8 -mb-8"></div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          type="card"
          tabBarStyle={{ 
            marginBottom: 0,
            borderBottom: '1px solid #f0e6fa'
          }}
          className="project-media-tabs"
        >
          {tabs.map(tab => (
            <TabPane 
              tab={
                <span className="flex items-center">
                  {tab.icon}
                  <span className="ml-2 hidden sm:inline">{tab.title}</span>
                </span>
              } 
              key={tab.key}
            >
              {tab.content}
            </TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectMediaDisplay;