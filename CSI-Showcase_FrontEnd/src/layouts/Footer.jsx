import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GithubOutlined, 
  InstagramOutlined, 
  FacebookOutlined, 
  LinkedinOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import LogoCSI from '../assets/Logo_CSI.png';

const Footer = () => {
  // Footer column animation
  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Animation for social media icons
  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, rotate: 5 }
  };

  return (
    <footer className="bg-gradient-to-b from-[#90278E] to-[#5E1A5C] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Logo and info */}
          <motion.div
            variants={columnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="col-span-1 md:col-span-1"
          >
            <img src={LogoCSI} alt="CSI Logo" className="h-12 mb-4" />
            <p className="text-gray-200 mb-4">แหล่งรวมผลงานและนวัตกรรมจากนักศึกษา CSI ที่พร้อมแบ่งปันความรู้และความคิดสร้างสรรค์</p>
            <div className="flex space-x-4 mt-4">
              <motion.a 
                href="#" 
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20"
              >
                <FacebookOutlined className="text-white text-xl" />
              </motion.a>
              <motion.a 
                href="#" 
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20"
              >
                <InstagramOutlined className="text-white text-xl" />
              </motion.a>
              <motion.a 
                href="#" 
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20"
              >
                <GithubOutlined className="text-white text-xl" />
              </motion.a>
            </div>
          </motion.div>

          {/* Column 2 - Quick Links */}
          <motion.div
            variants={columnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="col-span-1"
          >
            <h3 className="text-xl font-bold mb-4 border-b border-white border-opacity-20 pb-2">เมนูลัด</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-200 hover:text-white hover:underline transition">หน้าแรก</Link></li>
              <li><Link to="/projects/all" className="text-gray-200 hover:text-white hover:underline transition">ผลงานทั้งหมด</Link></li>
              <li><Link to="/projects/my" className="text-gray-200 hover:text-white hover:underline transition">ผลงานของฉัน</Link></li>
              <li><Link to="/settings" className="text-gray-200 hover:text-white hover:underline transition">ตั้งค่าโปรไฟล์</Link></li>
            </ul>
          </motion.div>

          {/* Column 3 - Categories */}
          <motion.div
            variants={columnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="col-span-1"
          >
            <h3 className="text-xl font-bold mb-4 border-b border-white border-opacity-20 pb-2">หมวดหมู่</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-200 hover:text-white hover:underline transition">ผลงานวิชาเรียน</Link></li>
              <li><Link to="#" className="text-gray-200 hover:text-white hover:underline transition">ผลงานแข่งขัน</Link></li>
              <li><Link to="#" className="text-gray-200 hover:text-white hover:underline transition">ผลงานวิชาการ</Link></li>
            </ul>
          </motion.div>

          {/* Column 4 - Contact */}
          <motion.div
            variants={columnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="col-span-1"
          >
            <h3 className="text-xl font-bold mb-4 border-b border-white border-opacity-20 pb-2">ติดต่อเรา</h3>
            <p className="text-gray-200 mb-2">คณะเทคโนโลยีสารสนเทศ สาขาวิทยาการคอมพิวเตอร์และนวัตกรรมพัฒนาซอฟต์แวร์</p>
            <p className="text-gray-200 mb-2">มหาวิทยาลัยศรีปทุม</p>
            <p className="text-gray-200 mb-2">Email: pratan.nil@spumail.net</p>
            <p className="text-gray-200">โทร: 02-123-4567</p>
          </motion.div>
        </div>

        {/* Copyright section - GitHub style */}
        <div className="border-t border-white border-opacity-20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300">© 2025 CSI Showcase. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="#" className="text-sm text-gray-300 hover:text-white hover:underline">นโยบายความเป็นส่วนตัว</Link>
            <Link to="#" className="text-sm text-gray-300 hover:text-white hover:underline">เงื่อนไขการใช้งาน</Link>
            <Link to="#" className="text-sm text-gray-300 hover:text-white hover:underline">คำถามที่พบบ่อย</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;