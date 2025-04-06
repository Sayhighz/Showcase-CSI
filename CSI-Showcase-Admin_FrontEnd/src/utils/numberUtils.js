// src/utils/numberUtils.js

/**
 * จัดรูปแบบตัวเลขให้มีเครื่องหมายคั่นหลักพัน
 * @param {number} number - ตัวเลขที่ต้องการจัดรูปแบบ
 * @param {number} decimals - จำนวนตำแหน่งทศนิยม (default: 0)
 * @param {string} thousandSeparator - เครื่องหมายคั่นหลักพัน (default: ',')
 * @param {string} decimalSeparator - เครื่องหมายคั่นทศนิยม (default: '.')
 * @returns {string} - ตัวเลขที่จัดรูปแบบแล้ว
 */
export const formatNumber = (number, decimals = 0, thousandSeparator = ',', decimalSeparator = '.') => {
    if (number === null || number === undefined || isNaN(number)) {
      return '';
    }
    
    const num = parseFloat(number);
    const fixedNum = num.toFixed(decimals);
    const [integerPart, decimalPart] = fixedNum.split('.');
    
    // จัดรูปแบบส่วนจำนวนเต็ม
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    
    // รวมส่วนจำนวนเต็มและทศนิยม
    return decimalPart ? `${formattedInteger}${decimalSeparator}${decimalPart}` : formattedInteger;
  };
  
  /**
   * จัดรูปแบบตัวเลขให้อยู่ในรูปแบบเงินบาท
   * @param {number} amount - จำนวนเงินที่ต้องการจัดรูปแบบ
   * @param {number} decimals - จำนวนตำแหน่งทศนิยม (default: 2)
   * @param {boolean} showSymbol - แสดงสัญลักษณ์เงินบาทหรือไม่ (default: true)
   * @returns {string} - จำนวนเงินที่จัดรูปแบบแล้ว
   */
  export const formatCurrency = (amount, decimals = 2, showSymbol = true) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '';
    }
    
    // จัดรูปแบบจำนวนเงิน
    const formattedAmount = formatNumber(amount, decimals);
    
    // เพิ่มสัญลักษณ์เงินบาท
    return showSymbol ? `${formattedAmount} บาท` : formattedAmount;
  };
  
  /**
   * แปลงค่าเป็นเปอร์เซ็นต์
   * @param {number} value - ค่าที่ต้องการแปลง (0-1)
   * @param {number} decimals - จำนวนตำแหน่งทศนิยม (default: 2)
   * @param {boolean} showSymbol - แสดงสัญลักษณ์เปอร์เซ็นต์หรือไม่ (default: true)
   * @returns {string} - ค่าเปอร์เซ็นต์ที่จัดรูปแบบแล้ว
   */
  export const formatPercentage = (value, decimals = 2, showSymbol = true) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    
    // แปลงเป็นเปอร์เซ็นต์
    const percentage = value * 100;
    
    // จัดรูปแบบเปอร์เซ็นต์
    const formattedPercentage = formatNumber(percentage, decimals);
    
    // เพิ่มสัญลักษณ์เปอร์เซ็นต์
    return showSymbol ? `${formattedPercentage}%` : formattedPercentage;
  };
  
  /**
   * ปัดเศษตัวเลขขึ้น
   * @param {number} number - ตัวเลขที่ต้องการปัดเศษ
   * @param {number} precision - จำนวนตำแหน่งทศนิยม (default: 0)
   * @returns {number} - ตัวเลขที่ปัดเศษแล้ว
   */
  export const roundUp = (number, precision = 0) => {
    if (number === null || number === undefined || isNaN(number)) {
      return 0;
    }
    
    const factor = Math.pow(10, precision);
    return Math.ceil(number * factor) / factor;
  };
  
  /**
   * ปัดเศษตัวเลขลง
   * @param {number} number - ตัวเลขที่ต้องการปัดเศษ
   * @param {number} precision - จำนวนตำแหน่งทศนิยม (default: 0)
   * @returns {number} - ตัวเลขที่ปัดเศษแล้ว
   */
  export const roundDown = (number, precision = 0) => {
    if (number === null || number === undefined || isNaN(number)) {
      return 0;
    }
    
    const factor = Math.pow(10, precision);
    return Math.floor(number * factor) / factor;
  };
  
  /**
   * แปลงตัวเลขเป็นคำอ่านภาษาไทย
   * @param {number} number - ตัวเลขที่ต้องการแปลง
   * @returns {string} - คำอ่านภาษาไทย
   */
  export const numberToThaiText = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
      return '';
    }
    
    // ถ้าจำนวนเป็น 0
    if (number === 0) {
      return 'ศูนย์';
    }
    
    // ป้องกันการแปลงจำนวนลบ
    const isNegative = number < 0;
    number = Math.abs(number);
    
    // แยกส่วนจำนวนเต็มและทศนิยม
    const [integerPart, decimalPart] = number.toString().split('.');
    
    // คำอ่านตัวเลขภาษาไทย
    const thaiDigits = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const thaiPositions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    
    // ฟังก์ชันแปลงจำนวนเต็มเป็นคำอ่านภาษาไทย
    const integerToThaiText = (integer) => {
      if (integer === '0') {
        return 'ศูนย์';
      }
      
      let text = '';
      let millionCount = 0;
      
      // แปลงตัวเลขเป็นคำอ่านทีละหลัก
      for (let i = 0; i < integer.length; i++) {
        const digit = parseInt(integer[integer.length - 1 - i]);
        const position = i % 6;
        
        if (digit !== 0) {
          // กรณีพิเศษสำหรับเลข 1 ในตำแหน่งหลักสิบ
          if (digit === 1 && position === 1) {
            text = 'สิบ' + text;
          }
          // กรณีพิเศษสำหรับเลข 2 ในตำแหน่งหลักสิบ
          else if (digit === 2 && position === 1) {
            text = 'ยี่สิบ' + text;
          }
          // กรณีทั่วไป
          else {
            text = thaiDigits[digit] + thaiPositions[position] + text;
          }
        }
        
        // เพิ่มคำว่า "ล้าน" ทุก 6 หลัก
        if (position === 5 && i > 0) {
          millionCount++;
          text = 'ล้าน' + text;
        }
      }
      
      return text;
    };
    
    // แปลงส่วนจำนวนเต็ม
    let result = integerToThaiText(integerPart);
    
    // เพิ่มคำว่า "ลบ" สำหรับจำนวนลบ
    if (isNegative) {
      result = 'ลบ' + result;
    }
    
    // เพิ่มส่วนทศนิยม (ถ้ามี)
    if (decimalPart) {
      result += 'จุด';
      for (let i = 0; i < decimalPart.length; i++) {
        const digit = parseInt(decimalPart[i]);
        result += thaiDigits[digit];
      }
    }
    
    return result;
  };
  
  /**
   * คำนวณค่าเฉลี่ย
   * @param {Array} values - อาร์เรย์ของค่าที่ต้องการคำนวณค่าเฉลี่ย
   * @returns {number} - ค่าเฉลี่ย
   */
  export const calculateAverage = (values) => {
    if (!values || !Array.isArray(values) || values.length === 0) {
      return 0;
    }
    
    // กรองค่าที่เป็นตัวเลขเท่านั้น
    const numericValues = values.filter(value => 
      value !== null && value !== undefined && !isNaN(value)
    );
    
    if (numericValues.length === 0) {
      return 0;
    }
    
    // คำนวณผลรวม
    const sum = numericValues.reduce((total, value) => total + parseFloat(value), 0);
    
    // คำนวณค่าเฉลี่ย
    return sum / numericValues.length;
  };
  
  /**
   * จัดรูปแบบตัวเลขเป็นเลขไทย
   * @param {number|string} number - ตัวเลขที่ต้องการแปลง
   * @returns {string} - ตัวเลขในรูปแบบเลขไทย
   */
  export const convertToThaiDigits = (number) => {
    if (number === null || number === undefined) {
      return '';
    }
    
    const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    
    return number.toString().replace(/\d/g, (digit) => thaiDigits[digit]);
  };
  
  /**
   * จัดรูปแบบตัวเลขเป็นเลขอารบิก
   * @param {string} thaiNumber - ตัวเลขไทยที่ต้องการแปลง
   * @returns {string} - ตัวเลขในรูปแบบเลขอารบิก
   */
  export const convertToArabicDigits = (thaiNumber) => {
    if (!thaiNumber) {
      return '';
    }
    
    const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    
    let result = thaiNumber.toString();
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(thaiDigits[i], 'g'), i);
    }
    
    return result;
  };