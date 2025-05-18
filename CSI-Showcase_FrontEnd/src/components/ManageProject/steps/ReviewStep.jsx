// src/components/ManageProject/steps/ReviewStep.jsx
import React from "react";
import { Alert, Avatar, Tag, Typography, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { 
  PROJECT_TYPE_DISPLAY, 
  PROJECT_TYPE 
} from "../../../constants/projectTypes";
import { formatDate } from "../../../utils/dateUtils";

const { Text, Title } = Typography;

/**
 * ReviewStep - ขั้นตอนตรวจสอบข้อมูลก่อนส่งแบบฟอร์ม
 * @param {Object} props - Component properties
 * @param {string} props.projectType - ประเภทของโปรเจค
 * @param {Object} props.validatedValues - ข้อมูลที่ผ่านการตรวจสอบแล้ว
 * @param {Object} props.fileList - รายการไฟล์ที่อัปโหลด
 * @param {Array} props.contributors - รายการผู้ร่วมโปรเจค
 * @param {boolean} props.isMobile - บอกว่าเป็นหน้าจอขนาดเล็กหรือไม่
 * @param {boolean} props.isTablet - บอกว่าเป็นหน้าจอขนาดกลางหรือไม่
 * @returns {JSX.Element} - ReviewStep component
 */
const ReviewStep = ({ projectType, validatedValues, fileList, contributors, isMobile, isTablet }) => {
  // ฟังก์ชันสำหรับแสดงบทบาทของผู้ร่วมโปรเจคในภาษาไทย
  const getContributorRoleDisplay = (role) => {
    const roleMap = {
      contributor: "ผู้ร่วมพัฒนา",
      researcher: "นักวิจัย",
      designer: "นักออกแบบ",
      developer: "นักพัฒนา",
      documenter: "ผู้จัดทำเอกสาร",
      tester: "ผู้ทดสอบ"
    };
    
    return roleMap[role] || role;
  };
  
  // ฟังก์ชันสำหรับแสดงสีของบทบาท
  const getContributorRoleColor = (role) => {
    const colorMap = {
      contributor: "blue",
      researcher: "purple",
      designer: "magenta",
      developer: "geekblue",
      documenter: "cyan",
      tester: "orange"
    };
    
    return colorMap[role] || "default";
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <Alert
        message={<span className={isMobile ? "text-sm" : ""}>ตรวจสอบข้อมูล</span>}
        description={<span className={isMobile ? "text-xs" : "text-sm"}>กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก</span>}
        type="info"
        showIcon
        className="mb-2 sm:mb-4"
      />
      
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
        <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-gray-900 mb-2 sm:mb-3`}>
          ข้อมูลทั่วไป
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          <div>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ชื่อโปรเจค</p>
            <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>{validatedValues.title}</p>
          </div>
          <div>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ประเภท</p>
            <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
              {PROJECT_TYPE_DISPLAY[validatedValues.type]}
            </p>
          </div>
          <div>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ชั้นปี</p>
            <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>ปี {validatedValues.study_year}</p>
          </div>
          <div>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ปีการศึกษา/ภาคเรียน</p>
            <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
              {validatedValues.year} / {validatedValues.semester}
            </p>
          </div>
          <div>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>การแสดงผล</p>
            <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
              {validatedValues.visibility === 1 ? "สาธารณะ" : "ส่วนตัว"}
            </p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>คำอธิบาย</p>
          <p className={`font-medium whitespace-pre-line ${isMobile ? "text-xs sm:text-sm" : ""}`}>
            {validatedValues.description}
          </p>
        </div>
      </div>

      {/* ข้อมูลเฉพาะตามประเภท */}
      {projectType === PROJECT_TYPE.ACADEMIC && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-gray-900 mb-2 sm:mb-3`}>
            ข้อมูลบทความวิชาการ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ปีที่ตีพิมพ์</p>
              <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>{validatedValues.published_year}</p>
            </div>
            <div>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>วันที่ตีพิมพ์</p>
             <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
               {validatedValues.publication_date
                 ? formatDate(validatedValues.publication_date)
                 : ""}
             </p>
           </div>
         </div>
         <div className="mt-2 sm:mt-3">
           <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ไฟล์บทความ</p>
           <ul className="list-disc pl-4 sm:pl-5">
             {fileList.paperFile.map((file, index) => (
               <li key={index} className={isMobile ? "text-xs sm:text-sm" : ""}>{file.name}</li>
             ))}
           </ul>
         </div>
       </div>
     )}

     {projectType === PROJECT_TYPE.COMPETITION && (
       <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
         <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-gray-900 mb-2 sm:mb-3`}>
           ข้อมูลการแข่งขัน
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
           <div>
             <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ชื่อการแข่งขัน</p>
             <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
               {validatedValues.competition_name}
             </p>
           </div>
           <div>
             <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ปีที่แข่งขัน</p>
             <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>
               {validatedValues.competition_year}
             </p>
           </div>
         </div>
         <div className="mt-2 sm:mt-3">
           <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>รูปโปสเตอร์</p>
           <ul className="list-disc pl-4 sm:pl-5">
             {fileList.competitionPoster.map((file, index) => (
               <li key={index} className={isMobile ? "text-xs sm:text-sm" : ""}>{file.name}</li>
             ))}
           </ul>
         </div>
       </div>
     )}

     {projectType === PROJECT_TYPE.COURSEWORK && (
       <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
         <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-gray-900 mb-2 sm:mb-3`}>
           ข้อมูลงานในชั้นเรียน
         </h3>
         <div className="mt-2 sm:mt-3">
           <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>โปสเตอร์</p>
           <ul className="list-disc pl-4 sm:pl-5">
             {fileList.courseworkPoster.map((file, index) => (
               <li key={index} className={isMobile ? "text-xs sm:text-sm" : ""}>{file.name}</li>
             ))}
           </ul>
         </div>
         {fileList.courseworkImage.length > 0 && (
           <div className="mt-2 sm:mt-3">
             <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>รูปภาพเพิ่มเติม</p>
             <ul className="list-disc pl-4 sm:pl-5">
               {fileList.courseworkImage.map((file, index) => (
                 <li key={index} className={isMobile ? "text-xs sm:text-sm" : ""}>{file.name}</li>
               ))}
             </ul>
           </div>
         )}
         {fileList.courseworkVideo.length > 0 && (
           <div className="mt-2 sm:mt-3">
             <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>วิดีโอ</p>
             <ul className="list-disc pl-4 sm:pl-5">
               {fileList.courseworkVideo.map((file, index) => (
                 <li key={index} className={isMobile ? "text-xs sm:text-sm" : ""}>{file.name}</li>
               ))}
             </ul>
           </div>
         )}
         {validatedValues.clip_video && (
           <div className="mt-2 sm:mt-3">
             <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>ลิงก์วิดีโอ</p>
             <p className={`font-medium ${isMobile ? "text-xs sm:text-sm" : ""} break-all`}>{validatedValues.clip_video}</p>
           </div>
         )}
       </div>
     )}
     
     {/* ข้อมูลผู้ร่วมโปรเจค */}
     <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
       <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-gray-900 mb-2 sm:mb-3`}>
         ผู้ร่วมโปรเจค
       </h3>
       
       {(!contributors || contributors.length === 0) ? (
         <p className={`text-gray-500 ${isMobile ? "text-xs sm:text-sm" : ""}`}>ไม่มีผู้ร่วมโปรเจค</p>
       ) : (
         <div className="space-y-2 sm:space-y-3">
           {contributors.map((contributor) => (
             <div 
               key={contributor.user_id} 
               className="flex items-center border-b border-gray-200 pb-2"
             >
               <Avatar 
                 src={contributor.image} 
                 icon={<UserOutlined />} 
                 size={isMobile ? 'small' : 'default'} 
                 className="mr-2" 
               />
               <div className="flex-1">
                 <div className={`font-medium ${isMobile ? "text-xs sm:text-sm" : ""}`}>{contributor.fullName}</div>
                 <div className="text-xs text-gray-500">@{contributor.username}</div>
               </div>
               <Tag color={getContributorRoleColor(contributor.role)} style={{ fontSize: isMobile ? '10px' : '12px' }}>
                 {getContributorRoleDisplay(contributor.role)}
               </Tag>
             </div>
           ))}
         </div>
       )}
     </div>
   </div>
 );
};

export default ReviewStep;