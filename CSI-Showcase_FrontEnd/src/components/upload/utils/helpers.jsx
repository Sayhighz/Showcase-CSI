// Helper function to generate star background
export const generateStarBackground = () => {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-white rounded-full" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              boxShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
            }}
          ></div>
        ))}
      </div>
    );
  };
  
  // Helper function to get icon for file inputs
  export const getIcon = (file, type) => {
    if (!file) {
      if (type === 'videoFile' || type === 'videoLink') {
        return <VideoCameraOutlined className="text-[#FF5E8C] text-5xl mb-2" />;
      }
      return <CloudUploadOutlined className="text-[#90278E] text-5xl mb-2" />;
    }
    if (type === 'videoFile' || type === 'videoLink') {
      return <VideoCameraOutlined className="text-green-400 text-5xl mb-2" />;
    }
    return <FileImageOutlined className="text-blue-400 text-5xl mb-2" />;
  };
  
  // Helper function for video embed URL conversion
  export const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com')) return url.replace("watch?v=", "embed/");
    if (url.includes('tiktok.com')) return url;
    if (url.includes('facebook.com')) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    return url;
  };
  
  // Import the icons here to avoid importing them in every component
  import { 
    RocketOutlined, 
    FileTextOutlined, 
    TeamOutlined, 
    EyeOutlined, 
    CloudUploadOutlined, 
    FileImageOutlined, 
    VideoCameraOutlined, 
    LinkOutlined, 
    UserOutlined, 
    PlusOutlined,
    SendOutlined,
    EyeInvisibleOutlined,
    EditOutlined,
    TrophyOutlined,
    CalendarOutlined,
    FileOutlined
  } from '@ant-design/icons';