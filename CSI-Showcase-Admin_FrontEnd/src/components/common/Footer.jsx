import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text, Link: AntLink } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter style={{ textAlign: 'center', background: '#FFFFFF', padding: '16px' }}>
      <div className="flex flex-col md:flex-row justify-between items-center">
        <Text className="mb-2 md:mb-0">
          © {currentYear} ภาควิชาวิทยาการคอมพิวเตอร์. สงวนลิขสิทธิ์.
        </Text>
        <div>
          <AntLink href="/about" target="_blank" className="mx-2" style={{ color: '#90278E' }}>
            เกี่ยวกับเรา
          </AntLink>
          <AntLink href="/privacy" target="_blank" className="mx-2" style={{ color: '#90278E' }}>
            นโยบายความเป็นส่วนตัว
          </AntLink>
          <AntLink href="/contact" target="_blank" className="mx-2" style={{ color: '#90278E' }}>
            ติดต่อเรา
          </AntLink>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;