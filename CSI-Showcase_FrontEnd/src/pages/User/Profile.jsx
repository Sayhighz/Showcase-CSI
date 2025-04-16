import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Tabs, 
  Empty, 
  Spin, 
  Typography, 
  Divider,
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ProjectOutlined, 
  TrophyOutlined, 
  StarOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks';
import { useProject } from '../../hooks';
import UserProfile from '../../components/User/UserProfile';
import UserStats from '../../components/User/UserStats';
import ProjectCard from '../../components/Project/ProjectCard';
import AchievementBadge from '../../components/User/AchievementBadge';
import { USER } from '../../constants/routes';
import ErrorMessage from '../../components/common/ErrorMessage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * Profile page component ใช้สำหรับแสดงโปรไฟล์ของผู้ใช้
 * 
 * @returns {JSX.Element} Profile page component
 */
const Profile = () => {
  const { id } = useParams(); // ดึง ID ของผู้ใช้จาก URL
  const { user: currentUser } = useAuth(); // ดึงข้อมูลผู้ใช้ปัจจุบัน
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');
  
  // เรียกใช้ hook เพื่อดึงข้อมูลโปรเจค
  const { fetchAllProjects, projects, isLoading: projectsLoading } = useProject();

  // ตรวจสอบว่าเป็นโปรไฟล์ของผู้ใช้ปัจจุบันหรือไม่
  const isCurrentUser = currentUser && (id === currentUser.id || id === 'me');

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // ถ้าเป็นโปรไฟล์ของผู้ใช้ปัจจุบัน
        if (id === 'me' && currentUser) {
          setUser(currentUser);
          // ดึงโปรเจคของผู้ใช้ปัจจุบัน
          fetchAllProjects({ userId: currentUser.id });
        } 
        // ถ้าเป็นโปรไฟล์ของผู้ใช้อื่น
        else {
          // ในตัวอย่างนี้ ให้สร้างข้อมูลตัวอย่างสำหรับการแสดงผล
          // ในการใช้งานจริง ควรดึงข้อมูลจาก API
          const mockUser = {
            id: id,
            username: 'user123',
            fullName: 'สมชาย ใจดี',
            avatar: 'https://via.placeholder.com/100',
            email: 'somchai@example.com',
            phone: '081-234-5678',
            bio: 'นักศึกษาสาขาวิทยาการคอมพิวเตอร์ ชั้นปีที่ 3 สนใจด้านการพัฒนาเว็บและแอปพลิเคชันมือถือ',
            role: 'student',
            skills: ['React', 'Node.js', 'JavaScript', 'UI/UX Design', 'Mobile Development'],
            studyYear: '3',
            studentId: '63xxxxxxxx',
            socialLinks: {
              github: 'https://github.com',
              linkedin: 'https://linkedin.com',
              website: 'https://example.com'
            }
          };
          setUser(mockUser);
          // ดึงโปรเจคของผู้ใช้ที่ระบุ
          fetchAllProjects({ userId: id });
        }
      } catch (err) {
        setError(err.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id, currentUser, fetchAllProjects]);

  // สร้างข้อมูลความสำเร็จตัวอย่าง
  const achievements = [
    {
      id: '1',
      title: 'นักพัฒนาหน้าใหม่',
      description: 'สร้างโปรเจคแรกในระบบ',
      icon: 'star',
      level: 'bronze',
      date: '2023-07-15'
    },
    {
      id: '2',
      title: 'ผู้เชี่ยวชาญการแข่งขัน',
      description: 'ส่งโปรเจคเข้าร่วมการแข่งขัน 5 ครั้ง',
      icon: 'trophy',
      level: 'silver',
      date: '2023-09-20'
    },
    {
      id: '3',
      title: 'นักวิจัยดาวรุ่ง',
      description: 'มีบทความวิชาการที่ได้รับความนิยมสูง',
      icon: 'experiment',
      level: 'gold',
      date: '2023-10-05'
    }
  ];

  // แสดง loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดข้อมูล...</Text>
      </div>
    );
  }

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <ErrorMessage
        title="เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้"
        message={error}
      />
    );
  }

  // แสดงข้อความเมื่อไม่พบผู้ใช้
  if (!user) {
    return (
      <Empty 
        description="ไม่พบข้อมูลผู้ใช้" 
        style={{ margin: '40px 0' }}
      />
    );
  }

  return (
    <div>
      {/* ปุ่มย้อนกลับ */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/">
          <Button icon={<ArrowLeftOutlined />}>
            กลับหน้าหลัก
          </Button>
        </Link>
      </div>

      <Row gutter={[24, 24]}>
        {/* คอลัมน์ซ้าย: โปรไฟล์และสถิติ */}
        <Col xs={24} md={8}>
          {/* โปรไฟล์ผู้ใช้ */}
          <UserProfile
            user={user}
            isCurrentUser={isCurrentUser}
            onEditClick={() => window.location.href = USER.EDIT_PROFILE}
            style={{ marginBottom: 24 }}
          />

          {/* สถิติผู้ใช้ */}
          <UserStats
            stats={{
              projects: projects ? projects.length : 0,
              views: projects ? projects.reduce((total, project) => total + (project.views || 0), 0) : 0,
              likes: projects ? projects.reduce((total, project) => total + (project.likes || 0), 0) : 0,
              comments: projects ? projects.reduce((total, project) => total + (project.comments || 0), 0) : 0,
              competitions: projects ? projects.filter(project => project.type === 'competition').length : 0,
              awards: achievements.length
            }}
            style={{ marginBottom: 24 }}
          />

          {/* ความสำเร็จ */}
          <Card title="ความสำเร็จ" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </Card>
        </Col>

        {/* คอลัมน์ขวา: แท็บและเนื้อหา */}
        <Col xs={24} md={16}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {/* แท็บโปรเจค */}
              <TabPane 
                tab={
                  <span>
                    <ProjectOutlined /> โปรเจค
                  </span>
                } 
                key="projects"
              >
                {projectsLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin />
                    <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดโปรเจค...</Text>
                  </div>
                ) : projects && projects.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {projects.map(project => (
                      <Col key={project.id} xs={24} sm={12}>
                        <ProjectCard project={project} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description={`${isCurrentUser ? 'คุณ' : 'ผู้ใช้นี้'}ยังไม่มีโปรเจค`} />
                )}
              </TabPane>

              {/* แท็บการแข่งขัน */}
              <TabPane 
                tab={
                  <span>
                    <TrophyOutlined /> การแข่งขัน
                  </span>
                } 
                key="competitions"
              >
                {projectsLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin />
                    <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดข้อมูล...</Text>
                  </div>
                ) : projects && projects.filter(p => p.type === 'competition').length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {projects
                      .filter(p => p.type === 'competition')
                      .map(project => (
                        <Col key={project.id} xs={24} sm={12}>
                          <ProjectCard project={project} />
                        </Col>
                      ))}
                  </Row>
                ) : (
                  <Empty description={`${isCurrentUser ? 'คุณ' : 'ผู้ใช้นี้'}ยังไม่มีโปรเจคประเภทการแข่งขัน`} />
                )}
              </TabPane>

              {/* แท็บรางวัล */}
              <TabPane 
                tab={
                  <span>
                    <StarOutlined /> รางวัล
                  </span>
                } 
                key="awards"
              >
                <Empty description="ไม่มีข้อมูลรางวัล" />
              </TabPane>

              {/* แท็บกิจกรรม */}
              <TabPane 
                tab={
                  <span>
                    <MessageOutlined /> กิจกรรม
                  </span>
                } 
                key="activities"
              >
                <Empty description="ไม่มีข้อมูลกิจกรรม" />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;