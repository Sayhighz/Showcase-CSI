/**
 * ฟังก์ชันจัดการวันที่สำหรับแอปพลิเคชัน - ปรับปรุงให้ใช้ dayjs
 */
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import buddhistEra from 'dayjs/plugin/buddhistEra';

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(buddhistEra);
dayjs.locale('th');

/**
 * แปลงวันที่เป็นรูปแบบ ISO string เป็น dayjs object
 * @param {string} isoString - วันที่ในรูปแบบ ISO string
 * @returns {dayjs.Dayjs|null} - dayjs object
 */
export const parseISODate = (isoString) => {
  if (!isoString) return null;
  const date = dayjs(isoString);
  return date.isValid() ? date : null;
};

/**
 * แปลงวันที่เป็นรูปแบบ dd/mm/yyyy
 * @param {Date|string|dayjs.Dayjs} date - วันที่ที่ต้องการแปลง
 * @param {string} separator - ตัวคั่นระหว่างวัน เดือน ปี (default: '/')
 * @returns {string} - วันที่ในรูปแบบ dd/mm/yyyy
 */
export const formatDate = (date, separator = '/') => {
  if (!date) return '';
  
  const d = dayjs(date);
  if (!d.isValid()) return '';
  
  return d.format(`DD${separator}MM${separator}YYYY`);
};

/**
 * แปลงวันที่เป็นรูปแบบ dd เดือนเต็ม ปี พ.ศ.
 * @param {Date|string|dayjs.Dayjs} date - วันที่ที่ต้องการแปลง
 * @param {boolean} useThaiYear - ใช้ปี พ.ศ. หรือไม่
 * @returns {string} - วันที่ในรูปแบบ dd เดือนเต็ม ปี
 */
export const formatThaiDate = (date, useThaiYear = true) => {
  if (!date) return '';
  
  const d = dayjs(date);
  if (!d.isValid()) return '';
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const day = d.date();
  const month = thaiMonths[d.month()];
  const year = useThaiYear ? d.year() + 543 : d.year();
  
  return `${day} ${month} ${year}`;
};

/**
 * แปลงวันที่เป็นรูปแบบ yyyy-mm-dd
 * @param {Date|string|dayjs.Dayjs} date - วันที่ที่ต้องการแปลง
 * @returns {string} - วันที่ในรูปแบบ yyyy-mm-dd
 */
export const formatISODate = (date) => {
  if (!date) return '';
  
  const d = dayjs(date);
  if (!d.isValid()) return '';
  
  return d.format('YYYY-MM-DD');
};

/**
 * แปลงวันที่และเวลาเป็นรูปแบบ dd/mm/yyyy hh:mm
 * @param {Date|string|dayjs.Dayjs} date - วันที่ที่ต้องการแปลง
 * @returns {string} - วันที่และเวลาในรูปแบบ dd/mm/yyyy hh:mm
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = dayjs(date);
  if (!d.isValid()) return '';
  
  return d.format('DD/MM/YYYY HH:mm');
};

/**
 * คำนวณระยะเวลาที่ผ่านมาจากวันที่ที่กำหนด
 * @param {Date|string|dayjs.Dayjs} date - วันที่ที่ต้องการคำนวณ
 * @returns {string} - ระยะเวลาที่ผ่านมา
 */
export const getTimeAgo = (date) => {
  if (!date) return '';
  
  const d = dayjs(date);
  if (!d.isValid()) return '';
  
  const now = dayjs();
  const diffInSeconds = now.diff(d, 'second');
  
  if (diffInSeconds < 60) return 'เมื่อสักครู่';
  
  const diffInMinutes = now.diff(d, 'minute');
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
  
  const diffInHours = now.diff(d, 'hour');
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
  
  const diffInDays = now.diff(d, 'day');
  if (diffInDays < 30) return `${diffInDays} วันที่แล้ว`;
  
  const diffInMonths = now.diff(d, 'month');
  if (diffInMonths < 12) return `${diffInMonths} เดือนที่แล้ว`;
  
  const diffInYears = now.diff(d, 'year');
  return `${diffInYears} ปีที่แล้ว`;
};

/**
 * คำนวณอายุจากวันเกิด
 * @param {Date|string|dayjs.Dayjs} birthDate - วันเกิด
 * @returns {number|null} - อายุ
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const d = dayjs(birthDate);
  if (!d.isValid()) return null;
  
  return dayjs().diff(d, 'year');
};

/**
 * ตรวจสอบว่าวันที่อยู่ในช่วงที่กำหนดหรือไม่
 * @param {Date|string|dayjs.Dayjs} date - วันที่ที่ต้องการตรวจสอบ
 * @param {Date|string|dayjs.Dayjs} startDate - วันที่เริ่มต้น
 * @param {Date|string|dayjs.Dayjs} endDate - วันที่สิ้นสุด
 * @returns {boolean} - true ถ้าอยู่ในช่วง, false ถ้าไม่อยู่ในช่วง
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  const d = dayjs(date);
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (!d.isValid() || !start.isValid() || !end.isValid()) return false;
  
  return d.isBetween(start, end, null, '[]'); // [] means inclusive
};

/**
 * รับวันที่ปัจจุบันในรูปแบบ dayjs
 * @returns {dayjs.Dayjs} - วันที่ปัจจุบัน
 */
export const getCurrentDate = () => dayjs();

/**
 * ตรวจสอบว่าเป็นวันเดียวกันหรือไม่
 * @param {Date|string|dayjs.Dayjs} date1 - วันที่แรก
 * @param {Date|string|dayjs.Dayjs} date2 - วันที่สอง
 * @returns {boolean} - true ถ้าเป็นวันเดียวกัน
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = dayjs(date1);
  const d2 = dayjs(date2);
  
  return d1.isValid() && d2.isValid() && d1.isSame(d2, 'day');
};

export default {
  parseISODate,
  formatDate,
  formatThaiDate,
  formatISODate,
  formatDateTime,
  getTimeAgo,
  calculateAge,
  isDateInRange,
  getCurrentDate,
  isSameDay
};