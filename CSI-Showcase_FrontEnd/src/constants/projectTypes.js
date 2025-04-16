/**
 * คงค่าประเภทของโปรเจคที่รองรับในระบบ
 * 
 * ไฟล์นี้รวบรวมประเภทของโปรเจคทั้งหมดที่รองรับ
 * พร้อมคำอธิบายและไอคอนที่เกี่ยวข้อง
 */

// ค่าคงที่สำหรับประเภทโปรเจค
export const PROJECT_TYPE = {
    ACADEMIC: 'academic',
    COURSEWORK: 'coursework',
    COMPETITION: 'competition',
  };
  
  // ค่าคงที่สำหรับชื่อที่แสดงผลของประเภทโปรเจค
  export const PROJECT_TYPE_DISPLAY = {
    [PROJECT_TYPE.ACADEMIC]: 'บทความวิชาการ',
    [PROJECT_TYPE.COURSEWORK]: 'งานในชั้นเรียน',
    [PROJECT_TYPE.COMPETITION]: 'การแข่งขัน',
  };
  
  // ค่าคงที่สำหรับไอคอนของประเภทโปรเจค
  export const PROJECT_TYPE_ICON = {
    [PROJECT_TYPE.ACADEMIC]: 'BookOutlined',
    [PROJECT_TYPE.COURSEWORK]: 'TeamOutlined',
    [PROJECT_TYPE.COMPETITION]: 'TrophyOutlined',
  };
  
  // ค่าคงที่สำหรับสีของประเภทโปรเจค
  export const PROJECT_TYPE_COLOR = {
    [PROJECT_TYPE.ACADEMIC]: 'blue',
    [PROJECT_TYPE.COURSEWORK]: 'green',
    [PROJECT_TYPE.COMPETITION]: 'gold',
  };
  
  // ค่าคงที่สำหรับคำอธิบายของประเภทโปรเจค
  export const PROJECT_TYPE_DESCRIPTION = {
    [PROJECT_TYPE.ACADEMIC]: 'บทความ งานวิจัย หรือเอกสารทางวิชาการ',
    [PROJECT_TYPE.COURSEWORK]: 'ผลงานที่ทำในรายวิชาต่างๆ',
    [PROJECT_TYPE.COMPETITION]: 'ผลงานที่ส่งเข้าประกวดหรือแข่งขัน',
  };
  
  // ประเภทโปรเจคทั้งหมดในรูปแบบอาร์เรย์ที่พร้อมใช้งาน
  export const PROJECT_TYPES = [
    {
      value: PROJECT_TYPE.ACADEMIC,
      label: PROJECT_TYPE_DISPLAY[PROJECT_TYPE.ACADEMIC],
      icon: PROJECT_TYPE_ICON[PROJECT_TYPE.ACADEMIC],
      color: PROJECT_TYPE_COLOR[PROJECT_TYPE.ACADEMIC],
      description: PROJECT_TYPE_DESCRIPTION[PROJECT_TYPE.ACADEMIC],
      emoji: '📚',
    },
    {
      value: PROJECT_TYPE.COURSEWORK,
      label: PROJECT_TYPE_DISPLAY[PROJECT_TYPE.COURSEWORK],
      icon: PROJECT_TYPE_ICON[PROJECT_TYPE.COURSEWORK],
      color: PROJECT_TYPE_COLOR[PROJECT_TYPE.COURSEWORK],
      description: PROJECT_TYPE_DESCRIPTION[PROJECT_TYPE.COURSEWORK],
      emoji: '🎓',
    },
    {
      value: PROJECT_TYPE.COMPETITION,
      label: PROJECT_TYPE_DISPLAY[PROJECT_TYPE.COMPETITION],
      icon: PROJECT_TYPE_ICON[PROJECT_TYPE.COMPETITION],
      color: PROJECT_TYPE_COLOR[PROJECT_TYPE.COMPETITION],
      description: PROJECT_TYPE_DESCRIPTION[PROJECT_TYPE.COMPETITION],
      emoji: '🏆',
    },
  ];
  
  // ฟังก์ชันสำหรับแปลงค่าประเภทโปรเจคเป็นชื่อที่แสดงผล
  export const getProjectTypeDisplay = (type) => {
    return PROJECT_TYPE_DISPLAY[type] || type;
  };
  
  // ฟังก์ชันสำหรับตรวจสอบว่าประเภทโปรเจคถูกต้องหรือไม่
  export const isValidProjectType = (type) => {
    return Object.values(PROJECT_TYPE).includes(type);
  };
  
  // ฟังก์ชันสำหรับดึงข้อมูลของประเภทโปรเจค
  export const getProjectTypeInfo = (type) => {
    return PROJECT_TYPES.find(item => item.value === type) || null;
  };
  
  // Export ทั้งหมดในออบเจกต์เดียว
  export default {
    PROJECT_TYPE,
    PROJECT_TYPE_DISPLAY,
    PROJECT_TYPE_ICON,
    PROJECT_TYPE_COLOR,
    PROJECT_TYPE_DESCRIPTION,
    PROJECT_TYPES,
    getProjectTypeDisplay,
    isValidProjectType,
    getProjectTypeInfo,
  };