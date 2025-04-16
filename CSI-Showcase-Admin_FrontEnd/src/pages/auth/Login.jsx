import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Typography, Spin, Alert, message,
  Divider, Space
} from 'antd';
import { 
  UserOutlined, LockOutlined, LoginOutlined, SafetyOutlined,
  EyeInvisibleOutlined, EyeTwoTone, RocketOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../assets/Logo_CSI.png';

const { Title, Text } = Typography;

// Add space-themed CSS
const spaceStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 4px',
    background: `
      linear-gradient(135deg, #090215 0%, #170b29 25%, #1f0a31 50%, #90278E 100%)
    `,
    backgroundSize: '400% 400%',
    animation: 'spaceGradient 15s ease infinite',
    position: 'relative',
    overflow: 'hidden',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
  },
  cardInner: {
    padding: '30px',
  },
  headerText: {
    color: '#330033',
    textShadow: '0 0 8px rgba(144, 39, 142, 0.2)',
    marginBottom: 0,
    fontWeight: 'bold',
  },
  subheaderText: {
    color: '#666666',
  },
  loginButton: {
    height: '48px',
    borderRadius: '12px',
    background: '#90278E',
    borderColor: '#90278E',
    boxShadow: '0 0 15px rgba(144, 39, 142, 0.6)',
    transition: 'all 0.3s ease',
  },
  loginButtonHover: {
    background: '#7D1A7A',
    borderColor: '#7D1A7A',
    boxShadow: '0 0 20px rgba(144, 39, 142, 0.8)',
  },
  linkText: {
    color: '#BB8FCE',
  },
  safeLoginBox: {
    background: 'rgba(144, 39, 142, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(144, 39, 142, 0.2)',
    padding: '12px',
    marginBottom: '16px',
  },
  footerText: {
    color: '#777777',
  },
  formLabel: {
    color: '#212121',
    fontWeight: 'bold',
  },
  input: {
    background: '#f9f9f9',
    borderColor: 'rgba(144, 39, 142, 0.5)',
    borderRadius: '12px',
    color: '#212121',
  },
  inputHover: {
    borderColor: '#90278E',
    boxShadow: '0 0 0 2px rgba(144, 39, 142, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1)',
  },
  cardGlow: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(144, 39, 142, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
    zIndex: 0,
  },
};

// Stars animation
const StarField = () => {
  const numberOfStars = 150;
  
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < numberOfStars; i++) {
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.8 + 0.2;
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      const animationDuration = `${Math.random() * 3 + 2}s`;
      
      const starStyle = {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: i % 5 === 0 ? '#BB8FCE' : '#fff',
        borderRadius: '50%',
        left,
        top,
        opacity,
        animation: `twinkle ${animationDuration} infinite alternate`,
      };
      
      stars.push(<div key={i} style={starStyle} />);
    }
    return stars;
  };
  
  return <div style={spaceStyles.starsContainer}>{generateStars()}</div>;
};

const SpaceParticles = () => {
  const numberOfParticles = 20;
  
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 60 + 20;
      const opacity = Math.random() * 0.15;
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      
      const particleStyle = {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        background: 'radial-gradient(circle, rgba(144, 39, 142, 0.8) 0%, rgba(144, 39, 142, 0) 70%)',
        borderRadius: '50%',
        left,
        top,
        opacity,
      };
      
      particles.push(<div key={i} style={particleStyle} />);
    }
    return particles;
  };
  
  return <div style={spaceStyles.starsContainer}>{generateParticles()}</div>;
};

const Login = () => {
  const [form] = Form.useForm();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [secureLogin, setSecureLogin] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // CSS to inject for space theme animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spaceGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes twinkle {
        0% { opacity: 0.2; }
        100% { opacity: 1; }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      input::placeholder {
        color: #757575 !important;
        opacity: 1 !important;
      }

      .ant-input::placeholder {
        color:rgb(124, 124, 124) !important;
        opacity: 1 !important;
      }
      
      .ant-input-affix-wrapper {
        background: #f9f9f9 !important;
        border-color: rgba(144, 39, 142, 0.5) !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05) !important;
      }
      
      .ant-input-affix-wrapper:hover {
        border-color: #90278E !important;
      }
      
      .ant-input-affix-wrapper-focused {
        box-shadow: 0 0 0 2px rgba(144, 39, 142, 0.2), 0 3px 8px rgba(0, 0, 0, 0.08) !important;
        border-color: #90278E !important;
      }
      
      .ant-input {
        background: transparent !important;
        color: #212121 !important;
      }
      
      .ant-form-item-label > label {
        color: #212121 !important;
        font-weight: bold !important;
      }

      .ant-form-item-required {
        color: #212121 !important;
      }

      .ant-typography {
        color: #212121 !important;
      }

      .login-label {
        color: #212121 !important;
        font-weight: bold !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // ดึง path ที่ต้องการ redirect หลังจากเข้าสู่ระบบสำเร็จ
  const from = location.state?.from || '/dashboard';

  // ตรวจสอบว่าเข้าสู่ระบบแล้วหรือไม่ ถ้าเข้าสู่ระบบแล้วให้ redirect ไปยังหน้า dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // จัดการ form submit
  const handleSubmit = async (values) => {
    const { username, password } = values;
    setLoginLoading(true);
    setLoginError(null);
    
    try {
      const success = await login(username, password);
      if (success) {
        // นำทางไปยังหน้าที่ต้องการ (เช่น dashboard หรือหน้าที่พยายามเข้าถึงก่อนหน้า)
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        // เข้าสู่ระบบไม่สำเร็จ (ผลการ login เป็น false)
        setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง');
    } finally {
      setLoginLoading(false);
    }
  };

  // แสดง loading state
  if (isLoading) {
    return (
      <div style={spaceStyles.container}>
        <StarField />
        <SpaceParticles />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <Spin size="large" tip="กำลังตรวจสอบการเข้าสู่ระบบ..." />
          <Text style={{ color: 'white', marginTop: '16px', textShadow: '0 0 10px rgba(144, 39, 142, 0.8)' }}>กำลังเชื่อมต่อไปยังระบบ...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={spaceStyles.container}>
      <StarField />
      <SpaceParticles />
      
      <Card style={spaceStyles.card} bodyStyle={spaceStyles.cardInner}>
        <div style={spaceStyles.cardGlow}></div>
        
        {/* Header area */}
        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
          {/* Space rocket icon */}
          <div style={{ marginBottom: '16px', animation: 'float 6s ease-in-out infinite' }}>
            <RocketOutlined style={{ fontSize: '42px', color: '#90278E' }} />
          </div>
          
          <Title level={3} style={{...spaceStyles.headerText, color: '#212121'}}>ระบบผู้ดูแล</Title>
          <Text style={{...spaceStyles.subheaderText, color: '#424242'}}>
            กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ
          </Text>
        </div>
        
        {/* Display login error alert if there is an error */}
        {loginError && (
          <Alert
            message="เข้าสู่ระบบไม่สำเร็จ"
            description={loginError}
            type="error"
            showIcon
            closable
            className="mb-4"
            style={{
              background: 'rgba(255, 59, 48, 0.1)',
              borderColor: 'rgba(255, 59, 48, 0.2)',
              marginBottom: '20px',
            }}
          />
        )}
        
        <Form
          form={form}
          name="login_form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <Form.Item
            name="username"
            label={<span style={{color: '#212121', fontWeight: 'bold'}}>ชื่อผู้ใช้</span>}
            rules={[
              { 
                required: true, 
                message: 'กรุณากรอกชื่อผู้ใช้' 
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#90278E' }} />} 
              size="large" 
              placeholder="กรอกชื่อผู้ใช้"
              style={{ 
                borderRadius: '12px', 
                height: '48px',
                background: '#f9f9f9',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                color: '#212121'
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label={<span style={{color: '#212121', fontWeight: 'bold'}}>รหัสผ่าน</span>}
            rules={[
              { 
                required: true, 
                message: 'กรุณากรอกรหัสผ่าน' 
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#BB8FCE' }} />} 
              size="large" 
              placeholder="กรอกรหัสผ่าน"
              style={{
                borderRadius: '12px',
                height: '48px',
              }}
              iconRender={visible => (
                visible ? <EyeTwoTone twoToneColor={['#BB8FCE', '#90278E']} /> : <EyeInvisibleOutlined style={{ color: '#BB8FCE' }} />
              )}
            />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                type="link"
                onClick={() => message.info({
                  content: 'กรุณาติดต่อผู้ดูแลระบบหลักเพื่อรีเซ็ตรหัสผ่าน',
                  style: {
                    borderRadius: '10px',
                    background: 'rgba(144, 39, 142, 0.1)',
                    border: '1px solid rgba(144, 39, 142, 0.2)',
                  },
                })}
                style={{...spaceStyles.linkText, color: '#90278E'}}
              >
                ลืมรหัสผ่าน?
              </Button>
              
              <span 
                onClick={() => setSecureLogin(!secureLogin)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: '#BB8FCE',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#90278E'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#BB8FCE'}
              >
                <SafetyOutlined style={{ marginRight: '4px' }} /> 
                การเข้าสู่ระบบแบบปลอดภัย
              </span>
            </div>
          </Form.Item>
          
          {secureLogin && (
            <div style={spaceStyles.safeLoginBox}>
              <Text style={{ color: '#424242', fontSize: '12px' }}>
                การเข้าสู่ระบบแบบปลอดภัยจะมีการเข้ารหัสข้อมูลเพิ่มเติมเพื่อปกป้องรหัสผ่านของคุณ
                และป้องกันการโจมตีแบบ man-in-the-middle
              </Text>
            </div>
          )}
          
          <Form.Item style={{ marginTop: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loginLoading}
              style={{ 
                ...spaceStyles.loginButton,
                ...(buttonHover ? spaceStyles.loginButtonHover : {})
              }}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoginOutlined style={{ marginRight: '8px' }} />
                <span>เข้าสู่ระบบผู้ดูแล</span>
              </div>
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <p style={{...spaceStyles.footerText, color: '#424242'}}>© 2025 CSI Showcase Admin. ระบบจัดการผลงานนักศึกษา</p>
          <p style={{...spaceStyles.footerText, color: '#424242'}}>สงวนลิขสิทธิ์โดย คณะเทคโนโลยีสารสนเทศ</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;