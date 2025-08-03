// utils/dateHelper.js

/**
 * จัดรูปแบบวันที่เป็น ISO String (YYYY-MM-DD)
 * @param {Date|string|number} date - วันที่ที่ต้องการจัดรูปแบบ
 * @returns {string} - วันที่ในรูปแบบ ISO String
 */
const formatToISODate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
* จัดรูปแบบวันที่และเวลาเป็น ISO String (YYYY-MM-DD HH:MM:SS)
* @param {Date|string|number} date - วันที่ที่ต้องการจัดรูปแบบ
* @returns {string} - วันที่และเวลาในรูปแบบ ISO String
*/
const formatToISODateTime = (date) => {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').split('.')[0];
};

/**
* จัดรูปแบบวันที่เป็นข้อความภาษาไทย (วันที่ เดือน พ.ศ.)
* @param {Date|string|number} date - วันที่ที่ต้องการจัดรูปแบบ
* @returns {string} - วันที่ในรูปแบบข้อความภาษาไทย
*/
const formatToThaiDate = (date) => {
  const d = new Date(date);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
};

/**
* คำนวณความแตกต่างระหว่างวันที่ในหน่วยที่กำหนด
* @param {Date|string|number} date1 - วันที่แรก
* @param {Date|string|number} date2 - วันที่สอง
* @param {string} unit - หน่วยที่ต้องการคำนวณ (days, hours, minutes, seconds)
* @returns {number} - ความแตกต่างในหน่วยที่กำหนด
*/
const dateDiff = (date1, date2, unit = 'days') => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffInMs = Math.abs(d2 - d1);
  
  switch (unit.toLowerCase()) {
    case 'seconds':
      return Math.floor(diffInMs / 1000);
    case 'minutes':
      return Math.floor(diffInMs / (1000 * 60));
    case 'hours':
      return Math.floor(diffInMs / (1000 * 60 * 60));
    case 'days':
    default:
      return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }
};

/**
* เพิ่มระยะเวลาให้กับวันที่
* @param {Date|string|number} date - วันที่ที่ต้องการเพิ่มระยะเวลา
* @param {number} amount - จำนวนที่ต้องการเพิ่ม
* @param {string} unit - หน่วยที่ต้องการเพิ่ม (days, hours, minutes, seconds)
* @returns {Date} - วันที่ใหม่หลังจากเพิ่มระยะเวลา
*/
const addTime = (date, amount, unit = 'days') => {
  const d = new Date(date);
  
  switch (unit.toLowerCase()) {
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'months':
      d.setMonth(d.getMonth() + amount);
      break;
    case 'years':
      d.setFullYear(d.getFullYear() + amount);
      break;
  }
  
  return d;
};

/**
* ตรวจสอบว่าวันที่ที่กำหนดเกินวันปัจจุบันหรือไม่
* @param {Date|string|number} date - วันที่ที่ต้องการตรวจสอบ
* @returns {boolean} - true หากวันที่เกินวันปัจจุบัน, false หากไม่เกิน
*/
const isDatePassed = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

/**
* แปลงจำนวนวินาทีเป็นรูปแบบเวลา (HH:MM:SS)
* @param {number} seconds - จำนวนวินาที
* @returns {string} - เวลาในรูปแบบ HH:MM:SS
*/
const secondsToTimeFormat = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

module.exports = {
  formatToISODate,
  formatToISODateTime,
  formatToThaiDate,
  dateDiff,
  addTime,
  isDatePassed,
  secondsToTimeFormat
};