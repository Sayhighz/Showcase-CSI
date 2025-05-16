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
    
    // แก้ไขการแปลง URL YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // ดึง video ID จาก URL
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        // รูปแบบ youtube.com/watch?v=VIDEO_ID
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v');
      } else if (url.includes('youtu.be/')) {
        // รูปแบบ youtu.be/VIDEO_ID
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        // รูปแบบ youtube.com/embed/VIDEO_ID
        videoId = url.split('youtube.com/embed/')[1].split('?')[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // ใช้ฟังก์ชันเดิมสำหรับ URL อื่นๆ
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
              <div className="p-4 text-center bg-gradient-to-b from-[#F5EAFF] to-white">
                <Image 
                  src={`${import.meta.env.VITE_API_URL}/${project.coursework.poster}`} 
                  alt="Poster" 
                  className="max-h-[500px] object-contain rounded-lg shadow-lg"
                  preview={{
                    mask: <div className="text-white bg-[#90278E] bg-opacity-70 px-3 py-1 rounded-md transition-all">ดูเต็มจอ</div>
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
              <div className="p-4 text-center bg-gradient-to-b from-[#F5EAFF] to-white">
                <Image 
                  src={`${import.meta.env.VITE_API_URL}/${project.coursework.image}`} 
                  alt="Additional Image" 
                  className="max-h-[500px] object-contain rounded-lg shadow-lg"
                  preview={{
                    mask: <div className="text-white bg-[#90278E] bg-opacity-70 px-3 py-1 rounded-md transition-all">ดูเต็มจอ</div>
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
                <div className="relative w-full h-0 pb-[56.25%] overflow-hidden my-4 rounded-lg shadow-lg">
                  <iframe 
                    src={embedUrl}
                    title="Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg border-none"
                  />
                </div>
              )
            });
          } else {
            // กรณีที่ไม่สามารถแปลง URL ได้ให้แสดงเป็นลิงก์เปิดในแท็บใหม่
            tabs.push({
              key: '3',
              title: 'วิดีโอ',
              icon: <VideoCameraOutlined />,
              content: (
                <div className="p-6 text-center bg-gradient-to-b from-[#F5EAFF] to-white rounded-lg">
                  <div className="mb-4">
                    <VideoCameraOutlined className="text-5xl text-[#90278E] opacity-80" />
                  </div>
                  <h3 className="text-lg font-bold text-[#90278E] mb-3">ไม่สามารถแสดงผลวิดีโอในเว็บไซต์ได้</h3>
                  <p className="text-[#24292f] mb-4">คุณสามารถดูวิดีโอโดยคลิกที่ปุ่มด้านล่างเพื่อเปิดในแท็บใหม่</p>
                  <Button 
                    type="primary" 
                    icon={<VideoCameraOutlined />}
                    href={project.coursework.clip_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#90278E] hover:bg-[#5E1A5C] shadow-md transition-all duration-300"
                  >
                    ดูวิดีโอในแท็บใหม่
                  </Button>
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
              <div className="relative w-full h-0 pb-[56.25%] overflow-hidden my-4 rounded-lg shadow-lg">
                <video 
                  controls 
                  src={`${import.meta.env.VITE_API_URL}/${project.coursework.courseworkVideo}`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
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
              <div className="p-4 bg-gradient-to-b from-[#F5EAFF] to-white">
                <Card 
                  title="เอกสารบทความวิชาการ" 
                  className="rounded-lg shadow-lg border border-[#90278E] border-opacity-20 backdrop-filter backdrop-blur-md bg-white bg-opacity-80"
                  headStyle={{ 
                    background: 'linear-gradient(90deg, #90278E 0%, #B252B0 100%)', 
                    color: 'white',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px'
                  }}
                >
                  <p className="mb-4 text-[#24292f]">คุณสามารถดาวน์โหลดหรือเปิดดูเอกสารบทความได้จากลิงก์ด้านล่าง</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      href={`${import.meta.env.VITE_API_URL}/${project.academic.paper_file}`}
                      target="_blank"
                      className="bg-[#90278E] hover:bg-[#5E1A5C] shadow-md transition-all duration-300"
                    >
                      ดาวน์โหลดเอกสาร
                    </Button>
                    <Button
                      icon={<FileTextOutlined />}
                      href={`${import.meta.env.VITE_API_URL}/${project.academic.paper_file}`}
                      target="_blank"
                      className="border-[#90278E] border-opacity-20 text-[#90278E] hover:bg-[#F5EAFF] shadow-sm hover:shadow transition-all duration-300"
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
              <div className="p-4 text-center bg-gradient-to-b from-[#F5EAFF] to-white">
                <Image 
                  src={`${import.meta.env.VITE_API_URL}/${project.competition.poster}`} 
                  alt="Competition Poster" 
                  className="max-h-[500px] object-contain rounded-lg shadow-lg"
                  preview={{
                    mask: <div className="text-white bg-[#90278E] bg-opacity-70 px-3 py-1 rounded-md transition-all">ดูเต็มจอ</div>
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
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#90278E] mb-4 flex items-center">
          <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
          สื่อโปรเจค
        </h2>
        <Card 
          title="ไม่มีสื่อสำหรับโปรเจคนี้" 
          className="rounded-xl shadow-lg border border-[#90278E] border-opacity-20 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md"
          headStyle={{ 
            background: 'linear-gradient(90deg, #F5EAFF 0%, #E0D1FF 100%)', 
            color: '#90278E',
            fontWeight: 'bold',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        >
          <p className="text-[#8b949e]">โปรเจคนี้ไม่มีโปสเตอร์ รูปภาพ วิดีโอ หรือไฟล์เอกสารที่แสดงได้</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#90278E] mb-4 flex items-center">
        <span className="w-1 h-6 bg-[#90278E] mr-2 rounded inline-block"></span>
        สื่อโปรเจค
      </h2>
      <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-md rounded-xl shadow-lg p-1 border border-[#90278E] border-opacity-20 relative overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Galaxy decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#B252B0] opacity-10 rounded-full blur-xl -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#5E1A5C] opacity-10 rounded-full blur-xl -ml-8 -mb-8"></div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          type="card"
          tabBarStyle={{ 
            marginBottom: 0,
            borderBottom: '1px solid rgba(144, 39, 142, 0.2)'
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