import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Button, 
  Divider, 
  List, 
  Avatar, 
  Tabs,
  Space,
  Empty,
  Spin,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  EyeOutlined, 
  LikeOutlined,
  PlusOutlined,
  EditOutlined,
  FileOutlined,
  BellOutlined,
  ClockCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth, useProject } from '../../hooks';
import UserStats from '../../components/User/UserStats';
import UserProfile from '../../components/User/UserProfile';
import ProjectCard from '../../components/Project/ProjectCard';
import AchievementBadge from '../../components/User/AchievementBadge';
import { PROJECT } from '../../constants/routes';
import { formatDate, getTimeAgo } from '../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Dashboard component ใช้สำหรับหน้าแดชบอร์ดของผู้ใช้
 * 
 * @param {Object} props - Props ของ component
 * @param {boolean} props.showProfile - แสดงโปรไฟล์ของผู้ใช้หรือไม่
 * @param {boolean} props.showStats - แสดงสถิติของผู้ใช้หรือไม่
 * @param {boolean} props.showAchievements - แสดงความสำเร็จของผู้ใช้หรือไม่
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = ({
  showProfile = true,
  showStats = true,
  showAchievements = true,
  style
}) => {
  const { user, isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('my-projects');
  const [recentProjects, setRecentProjects] = useState([]);
  const [popularProjects, setPopularProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // เรียกใช้ hook เพื่อดึงข้อมูลโปรเจค
  const { fetchMyProjects, projects, isLoading: projectsLoading } = useProject();

  // ดึงข้อมูลโปรเจคของผู้ใช้
  useEffect(() => {
    if (user && user.id) {
      fetchMyProjects(user.id);
      setIsLoading(false);
    }
  }, [user, fetchMyProjects]);

  // สร้างข้อมูลตัวอย่างสำหรับการแสดงผล (ในกรณีที่ API ยังไม่พร้อม)
  useEffect(() => {
    // ข้อมูลโปรเจคล่าสุด
    setRecentProjects([
      {
        id: '1',
        title: 'ระบบจัดการโปรเจค',
        type: 'coursework',
        createdAt: new Date('2023-10-15'),
        views: 120,
        likes: 25,
        comments: 8,
        coverImage: 'https://via.placeholder.com/300',
        description: 'ระบบจัดการโปรเจคสำหรับนักศึกษาในรายวิชา Web Programming'
      },
      {
        id: '2',
        title: 'การพัฒนาแอปพลิเคชันมือถือเพื่อการเรียนรู้',
        type: 'academic',
        createdAt: new Date('2023-09-20'),
        views: 85,
        likes: 16,
        comments: 4,
        coverImage: 'https://via.placeholder.com/300',
        description: 'งานวิจัยเกี่ยวกับการพัฒนาแอปพลิเคชันมือถือเพื่อการเรียนรู้'
      }
    ]);

    // ข้อมูลโปรเจคยอดนิยม
    setPopularProjects([
      {
        id: '3',
        title: 'ระบบวิเคราะห์ข้อมูลการเรียนออนไลน์',
        type: 'competition',
        createdAt: new Date('2023-08-05'),
        views: 250,
        likes: 48,
        comments: 15,
        coverImage: 'https://via.placeholder.com/300',
        description: 'ระบบวิเคราะห์พฤติกรรมการเรียนออนไลน์ของนักศึกษา'
      },
      {
        id: '4',
        title: 'เว็บไซต์แนะนำสถานที่ท่องเที่ยว',
        type: 'coursework',
        createdAt: new Date('2023-07-12'),
        views: 180,
        likes: 32,
        comments: 9,
        coverImage: 'https://via.placeholder.com/300',
        description: 'เว็บไซต์แนะนำสถานที่ท่องเที่ยวในจังหวัดเชียงใหม่'
      }
    ]);

    // ข้อมูลการแจ้งเตือน
    setNotifications([
      {
        id: '1',
        title: 'โปรเจคของคุณได้รับการอนุมัติแล้ว',
        message: 'โปรเจค "ระบบจัดการโปรเจค" ได้รับการอนุมัติแล้ว',
        createdAt: new Date('2023-10-16'),
        read: false,
        type: 'success'
      },
      {
        id: '2',
        title: 'มีผู้ชมโปรเจคของคุณเพิ่มขึ้น',
        message: 'โปรเจค "ระบบวิเคราะห์ข้อมูลการเรียนออนไลน์" มีผู้ชมเพิ่มขึ้น 50 คน',
        createdAt: new Date('2023-10-14'),
        read: true,
        type: 'info'
      },
      {
        id: '3',
        title: 'มีความคิดเห็นใหม่ในโปรเจคของคุณ',
        message: 'อ.สมชาย ได้แสดงความคิดเห็นในโปรเจค "เว็บไซต์แนะนำสถานที่ท่องเที่ยว"',
        createdAt: new Date('2023-10-12'),
        read: true,
        type: 'comment'
      }
    ]);

    // ข้อมูลความสำเร็จ
    setAchievements([
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
    ]);
  }, []);

  // แสดง loading state
  if (isAuthLoading || isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', ...style }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดข้อมูล...</Text>
      </div>
    );
  }

  // ถ้าไม่มีข้อมูลผู้ใช้
  if (!user) {
    return (
      <Empty
        description="กรุณาเข้าสู่ระบบเพื่อดูข้อมูลแดชบอร์ด"
        style={{ margin: '40px 0', ...style }}
      />
    );
  }

  return (
    <div style={{ ...style }}>
      <Row gutter={[24, 24]}>
        {/* คอลัมน์ซ้าย: โปรไฟล์และสถิติ */}
        <Col xs={24} md={8}>
          {/* โปรไฟล์ผู้ใช้ */}
          {showProfile && (
            <UserProfile
              user={user}
              isCurrentUser={true}
              onEditClick={() => window.location.href = '/user/edit'}
              style={{ marginBottom: 24 }}
            />
          )}

          {/* สถิติผู้ใช้ */}
          {showStats && (
            <UserStats
              stats={{
                projects: projects ? projects.length : 0,
                views: projects ? projects.reduce((total, project) => total + (project.views || 0), 0) : 0,
                likes: projects ? projects.reduce((total, project) => total + (project.likes || 0), 0) : 0,
                comments: projects ? projects.reduce((total, project) => total + (project.comments || 0), 0) : 0,
                competitions: projects ? projects.filter(project => project.type === 'competition').length : 0,
                awards: 3 // ข้อมูลตัวอย่าง
              }}
              style={{ marginBottom: 24 }}
            />
          )}

          {/* ความสำเร็จ */}
          {showAchievements && achievements.length > 0 && (
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
          )}

          {/* การแจ้งเตือนล่าสุด */}
          <Card title="การแจ้งเตือนล่าสุด" style={{ marginBottom: 24 }}>
            {notifications.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<BellOutlined />} 
                          style={{ backgroundColor: item.read ? '#d9d9d9' : '#1890ff' }}
                        />
                      }
                      title={
                        <div>
                          {!item.read && (
                            <Tag color="blue" style={{ marginRight: 8 }}>ใหม่</Tag>
                          )}
                          {item.title}
                        </div>
                      }
                      description={
                        <>
                          <Paragraph ellipsis={{ rows: 2 }}>{item.message}</Paragraph>
                          <Text type="secondary">
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {getTimeAgo(item.createdAt)}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="ไม่มีการแจ้งเตือน" />
            )}
            {notifications.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link">ดูทั้งหมด</Button>
              </div>
            )}
          </Card>
        </Col>

        {/* คอลัมน์ขวา: แท็บและเนื้อหา */}
        <Col xs={24} md={16}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarExtraContent={
                <Link to={PROJECT.UPLOAD.MAIN}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    สร้างโปรเจคใหม่
                  </Button>
                </Link>
              }
            >
              {/* แท็บโปรเจคของฉัน */}
              <TabPane 
                tab={
                  <span>
                    <ProjectOutlined /> โปรเจคของฉัน
                  </span>
                } 
                key="my-projects"
              >
                {projectsLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin />
                    <Text style={{ display: 'block', marginTop: 16 }}>กำลังโหลดโปรเจค...</Text>
                  </div>
                ) : projects && projects.length > 0 ? (
                  <>
                    <Row gutter={[16, 16]}>
                      {projects.map(project => (
                        <Col key={project.id} xs={24} sm={12}>
                          <ProjectCard project={project} />
                        </Col>
                      ))}
                    </Row>
                    
                    {projects.length > 4 && (
                      <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Link to={PROJECT.MY_PROJECTS}>
                          <Button type="default">
                            ดูโปรเจคทั้งหมด ({projects.length})
                          </Button>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <Empty description="คุณยังไม่มีโปรเจค">
                    <Link to={PROJECT.UPLOAD.MAIN}>
                      <Button type="primary" icon={<PlusOutlined />}>
                        สร้างโปรเจคใหม่
                      </Button>
                    </Link>
                  </Empty>
                )}
              </TabPane>

              {/* แท็บโปรเจคล่าสุด */}
              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined /> โปรเจคล่าสุด
                  </span>
                } 
                key="recent-projects"
              >
                {recentProjects.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {recentProjects.map(project => (
                      <Col key={project.id} xs={24} sm={12}>
                        <ProjectCard project={project} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="ไม่มีโปรเจคล่าสุด" />
                )}
              </TabPane>

              {/* แท็บโปรเจคยอดนิยม */}
              <TabPane 
                tab={
                  <span>
                    <StarOutlined /> โปรเจคยอดนิยม
                  </span>
                } 
                key="popular-projects"
              >
                {popularProjects.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {popularProjects.map(project => (
                      <Col key={project.id} xs={24} sm={12}>
                        <ProjectCard project={project} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="ไม่มีโปรเจคยอดนิยม" />
                )}
              </TabPane>
            </Tabs>
          </Card>

          {/* กิจกรรมล่าสุด */}
          <Card title="กิจกรรมล่าสุด" style={{ marginTop: 24 }}>
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  id: '1',
                  title: 'คุณได้อัปโหลดโปรเจคใหม่',
                  project: 'ระบบจัดการโปรเจค',
                  date: new Date('2023-10-15')
                },
                {
                  id: '2',
                  title: 'คุณได้แก้ไขโปรเจค',
                  project: 'ระบบวิเคราะห์ข้อมูลการเรียนออนไลน์',
                  date: new Date('2023-10-14')
                },
                {
                  id: '3',
                  title: 'โปรเจคของคุณได้รับการอนุมัติ',
                  project: 'เว็บไซต์แนะนำสถานที่ท่องเที่ยว',
                  date: new Date('2023-10-12')
                }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<FileOutlined />} style={{ backgroundColor: '#52c41a' }} />
                    }
                    title={item.title}
                    description={
                      <>
                        <Link to={`/projects/${item.id}`}>{item.project}</Link>
                        <div>
                          <Text type="secondary">
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {formatDate(item.date)}
                          </Text>
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;