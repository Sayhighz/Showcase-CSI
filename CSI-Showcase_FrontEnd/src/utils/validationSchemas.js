/**
 * Schema สำหรับ validation โดยใช้ Yup - แทนที่ validation functions เดิม
 */
import * as yup from 'yup';

// สร้าง custom validation methods
const phoneRegex = /^[0-9()\- ]+$/;
const studentIdRegex = /^\d{8,11}$/;
const nameRegex = /^[a-zA-Zก-๙\s.'-]+$/;

// Email validation schema
export const emailSchema = yup
  .string()
  .email('รูปแบบอีเมลไม่ถูกต้อง')
  .required('กรุณากรอกอีเมล');

// Username validation schema
export const usernameSchema = yup
  .string()
  .min(3, 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร')
  .max(20, 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 20 ตัวอักษร')
  .matches(/^[a-zA-Z0-9_-]+$/, 'ชื่อผู้ใช้สามารถมีเฉพาะตัวอักษร ตัวเลข _ และ - เท่านั้น')
  .required('กรุณากรอกชื่อผู้ใช้');

// Password validation schema
export const passwordSchema = yup
  .string()
  .min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
  .matches(/(?=.*[a-z])/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว')
  .matches(/(?=.*[A-Z])/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว')
  .matches(/(?=.*\d)/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว')
  .required('กรุณากรอกรหัสผ่าน');

// Phone validation schema
export const phoneSchema = yup
  .string()
  .matches(phoneRegex, 'เบอร์โทรศัพท์มีรูปแบบไม่ถูกต้อง')
  .test('phone-length', 'เบอร์โทรศัพท์ต้องมี 9-15 ตัวเลข', function(value) {
    if (!value) return true;
    const cleanPhone = value.replace(/[^0-9]/g, '');
    return cleanPhone.length >= 9 && cleanPhone.length <= 15;
  })
  .required('กรุณากรอกเบอร์โทรศัพท์');

// Student ID validation schema
export const studentIdSchema = yup
  .string()
  .matches(studentIdRegex, 'รหัสนักศึกษาต้องเป็นตัวเลข 8-11 หลัก')
  .required('กรุณากรอกรหัสนักศึกษา');

// Name validation schema
export const nameSchema = yup
  .string()
  .min(2, 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร')
  .matches(nameRegex, 'ชื่อสามารถมีเฉพาะตัวอักษร ช่องว่าง . \' และ - เท่านั้น')
  .required('กรุณากรอกชื่อ');

// URL validation schema
export const urlSchema = yup
  .string()
  .url('รูปแบบ URL ไม่ถูกต้อง')
  .required('กรุณากรอก URL');

// Video URL validation schema
export const videoUrlSchema = yup
  .string()
  .url('รูปแบบ URL ไม่ถูกต้อง')
  .test('video-url', 'URL ต้องเป็นลิงก์วิดีโอจาก YouTube, Facebook หรือ TikTok', function(value) {
    if (!value) return true;
    const supportedDomains = ['youtube.com', 'youtu.be', 'facebook.com', 'fb.watch', 'tiktok.com'];
    try {
      const url = new URL(value);
      return supportedDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  });

// File validation schema
export const createFileSchema = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => yup
  .mixed()
  .required('กรุณาเลือกไฟล์')
  .test('fileType', 'ประเภทไฟล์ไม่ได้รับอนุญาต', function(value) {
    if (!value) return true;
    return allowedTypes.length === 0 || allowedTypes.includes(value.type);
  })
  .test('fileSize', `ขนาดไฟล์ต้องไม่เกิน ${Math.round(maxSize / 1024 / 1024)} MB`, function(value) {
    if (!value) return true;
    return value.size <= maxSize;
  });

// Date range validation schema
export const dateRangeSchema = (startField = 'startDate', endField = 'endDate') => yup.object({
  [startField]: yup.date().required('กรุณาเลือกวันที่เริ่มต้น'),
  [endField]: yup.date()
    .required('กรุณาเลือกวันที่สิ้นสุด')
    .min(yup.ref(startField), 'วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น')
});

// Number range validation schema
export const numberRangeSchema = (min = 0, max = 100) => yup
  .number()
  .min(min, `ค่าต้องไม่น้อยกว่า ${min}`)
  .max(max, `ค่าต้องไม่เกิน ${max}`)
  .required('กรุณากรอกตัวเลข');

// Project validation schemas
export const projectSchema = yup.object({
  title: yup
    .string()
    .min(5, 'ชื่อโปรเจคต้องมีความยาวอย่างน้อย 5 ตัวอักษร')
    .max(200, 'ชื่อโปรเจคต้องมีความยาวไม่เกิน 200 ตัวอักษร')
    .required('กรุณากรอกชื่อโปรเจค'),
  description: yup
    .string()
    .min(50, 'คำอธิบายต้องมีความยาวอย่างน้อย 50 ตัวอักษร')
    .max(2000, 'คำอธิบายต้องมีความยาวไม่เกิน 2000 ตัวอักษร')
    .required('กรุณากรอกคำอธิบายโปรเจค'),
  type: yup
    .string()
    .oneOf(['academic', 'coursework', 'competition'], 'กรุณาเลือกประเภทโปรเจค')
    .required('กรุณาเลือกประเภทโปรเจค'),
  year: yup
    .number()
    .min(2020, 'ปีต้องไม่น้อยกว่า 2020')
    .max(new Date().getFullYear() + 1, 'ปีไม่ถูกต้อง')
    .required('กรุณาเลือกปีการศึกษา'),
  semester: yup
    .string()
    .oneOf(['1', '2', '3'], 'กรุณาเลือกภาคการศึกษา')
    .required('กรุณาเลือกภาคการศึกษา'),
  studyYear: yup
    .number()
    .oneOf([1, 2, 3, 4], 'กรุณาเลือกชั้นปี')
    .required('กรุณาเลือกชั้นปี')
});

// Login validation schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('กรุณากรอกรหัสผ่าน')
});

// Register validation schema
export const registerSchema = yup.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'รหัสผ่านไม่ตรงกัน')
    .required('กรุณายืนยันรหัสผ่าน'),
  firstName: nameSchema,
  lastName: nameSchema,
  studentId: studentIdSchema,
  phone: phoneSchema.optional()
});

export default {
  emailSchema,
  usernameSchema,
  passwordSchema,
  phoneSchema,
  studentIdSchema,
  nameSchema,
  urlSchema,
  videoUrlSchema,
  createFileSchema,
  dateRangeSchema,
  numberRangeSchema,
  projectSchema,
  loginSchema,
  registerSchema
};