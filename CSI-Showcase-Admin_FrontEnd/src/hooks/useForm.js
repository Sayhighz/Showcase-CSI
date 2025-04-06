// src/hooks/useForm.js
import { useState, useCallback, useEffect } from 'react';
import { isEmpty } from '../utils/validationUtils';

/**
 * Custom hook สำหรับจัดการฟอร์ม
 * @param {Object} initialValues - ค่าเริ่มต้นของฟิลด์
 * @param {Function} onSubmit - ฟังก์ชันที่จะเรียกเมื่อฟอร์มถูก submit
 * @param {Function} validate - ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูล
 * @returns {Object} - สถานะและฟังก์ชันสำหรับจัดการฟอร์ม
 */
const useForm = (initialValues = {}, onSubmit = () => {}, validate = null) => {
  // สถานะของฟอร์ม
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  /**
   * ตรวจสอบความถูกต้องของข้อมูลฟอร์ม
   * @param {Object} formValues - ค่าของฟิลด์ที่ต้องการตรวจสอบ
   * @returns {Object} - ข้อผิดพลาดของแต่ละฟิลด์
   */
  const validateForm = useCallback((formValues) => {
    if (!validate) {
      return {};
    }
    
    return validate(formValues);
  }, [validate]);
  
  /**
   * อัปเดตสถานะความถูกต้องของฟอร์ม
   */
  const updateFormValidity = useCallback(() => {
    const formErrors = validateForm(values);
    const hasErrors = Object.keys(formErrors).length > 0;
    
    setIsValid(!hasErrors);
    
    return hasErrors;
  }, [values, validateForm]);
  
  // ตรวจสอบความถูกต้องเมื่อค่าของฟอร์มเปลี่ยนแปลง
  useEffect(() => {
    updateFormValidity();
  }, [values, updateFormValidity]);
  
  /**
   * จัดการการเปลี่ยนแปลงค่าของฟิลด์
   * @param {Event|string} eventOrField - event หรือชื่อฟิลด์
   * @param {any} value - ค่าใหม่ (ถ้าระบุชื่อฟิลด์)
   */
  const handleChange = useCallback((eventOrField, value) => {
    if (typeof eventOrField === 'string') {
      // กรณีส่งชื่อฟิลด์และค่ามาโดยตรง
      setValues(prev => ({
        ...prev,
        [eventOrField]: value
      }));
      
      // บันทึกว่าฟิลด์นี้ถูกแตะแล้ว
      setTouched(prev => ({
        ...prev,
        [eventOrField]: true
      }));
    } else if (eventOrField && eventOrField.target) {
      // กรณีส่ง event มา
      const { name, type, value: targetValue, checked } = eventOrField.target;
      
      // ดึงค่าตามประเภทของ input
      const newValue = type === 'checkbox' ? checked : targetValue;
      
      setValues(prev => ({
        ...prev,
        [name]: newValue
      }));
      
      // บันทึกว่าฟิลด์นี้ถูกแตะแล้ว
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
  }, []);
  
  /**
   * จัดการกับ event เมื่อฟิลด์สูญเสียการโฟกัส
   * @param {Event} e - event
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // บันทึกว่าฟิลด์นี้ถูกแตะแล้ว
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // ตรวจสอบค่าเฉพาะฟิลด์นี้
    if (validate) {
      const formErrors = validateForm(values);
      setErrors(prev => ({
        ...prev,
        [name]: formErrors[name] || ''
      }));
    }
  }, [values, validateForm, validate]);
  
  /**
   * จัดการเมื่อมีการ submit ฟอร์ม
   * @param {Event} e - event
   */
  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // ตรวจสอบทุกฟิลด์
    const formErrors = validateForm(values);
    setErrors(formErrors);
    
    // บันทึกว่าทุกฟิลด์ถูกแตะแล้ว
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // ตรวจสอบว่ามีข้อผิดพลาดหรือไม่
    const hasErrors = Object.keys(formErrors).length > 0;
    setIsValid(!hasErrors);
    
    // ถ้าไม่มีข้อผิดพลาด ให้เรียกฟังก์ชัน onSubmit
    if (!hasErrors) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateForm, onSubmit]);
  
  /**
   * รีเซ็ตฟอร์มกลับไปเป็นค่าเริ่มต้น
   * @param {Object} newInitialValues - ค่าเริ่มต้นใหม่ (ถ้าไม่ระบุจะใช้ค่าเดิม)
   */
  const resetForm = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  /**
   * กำหนดค่าของฟอร์มทั้งหมด
   * @param {Object} newValues - ค่าใหม่ทั้งหมด
   */
  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);
  
  /**
   * แสดงข้อผิดพลาดของฟิลด์
   * @param {string} field - ชื่อฟิลด์
   * @returns {string} - ข้อความข้อผิดพลาด
   */
  const getFieldError = useCallback((field) => {
    // แสดงข้อผิดพลาดเฉพาะเมื่อฟิลด์ถูกแตะแล้ว
    return touched[field] ? errors[field] : '';
  }, [errors, touched]);
  
  /**
   * ตรวจสอบว่าฟิลด์มีข้อผิดพลาดหรือไม่
   * @param {string} field - ชื่อฟิลด์
   * @returns {boolean} - true ถ้ามีข้อผิดพลาด, false ถ้าไม่มี
   */
  const hasFieldError = useCallback((field) => {
    return touched[field] && !isEmpty(errors[field]);
  }, [errors, touched]);
  
  return {
    // สถานะของฟอร์ม
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    
    // ฟังก์ชันสำหรับการจัดการฟอร์ม
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
    
    // ฟังก์ชันช่วยเหลือ
    getFieldError,
    hasFieldError
  };
};

export default useForm;