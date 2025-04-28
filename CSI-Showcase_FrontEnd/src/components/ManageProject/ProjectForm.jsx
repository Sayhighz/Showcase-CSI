import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Upload,
  Steps,
  message,
  Card,
  Divider,
  Spin,
} from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  PROJECT_TYPE,
  PROJECT_TYPE_DISPLAY,
  PROJECT_TYPES,
} from "../../constants/projectTypes";
import { formatDate } from "../../utils/dateUtils";
import {
  isFileSizeValid,
  ALLOWED_FILE_TYPES,
  formatFileSize,
} from "../../utils/fileUtils";

const { TextArea } = Input;
const { Step } = Steps;
const { Dragger } = Upload;

const STEPS = {
  PROJECT_INFO: 0,
  SPECIFIC_INFO: 1,
  MEDIA_UPLOAD: 2,
  REVIEW: 3,
};

/**
 * ProjectForm component - แบบฟอร์มสำหรับอัปโหลดและแก้ไขโปรเจค
 * @param {Object} props - Properties passed to the component
 * @param {boolean} props.isEdit - บอกว่ากำลังแก้ไขโปรเจคหรือไม่ (true = กำลังแก้ไข, false = กำลังสร้างใหม่)
 * @param {Object} props.initialValues - ข้อมูลเริ่มต้นสำหรับกรณีแก้ไข
 * @param {Function} props.onSubmit - ฟังก์ชันที่จะถูกเรียกเมื่อกดบันทึก
 * @param {boolean} props.isLoading - loading state
 * @returns {JSX.Element} - ProjectForm component
 */
const ProjectForm = ({
  isEdit = false,
  initialValues = {},
  onSubmit,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [validatedValues, setValidatedValues] = useState(initialValues || {});
  const [currentStep, setCurrentStep] = useState(STEPS.PROJECT_INFO);
  const [projectType, setProjectType] = useState(initialValues.type || null);
  const [fileList, setFileList] = useState({
    coverImage: initialValues.coverImage ? [initialValues.coverImage] : [],
    paperFile: initialValues.paperFile ? [initialValues.paperFile] : [],
    courseworkPoster: initialValues.courseworkPoster
      ? [initialValues.courseworkPoster]
      : [],
    courseworkImage: initialValues.courseworkImage
      ? [initialValues.courseworkImage]
      : [],
    courseworkVideo: initialValues.courseworkVideo
      ? [initialValues.courseworkVideo]
      : [],
    competitionPoster: initialValues.competitionPoster
      ? [initialValues.competitionPoster]
      : [],
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ปรับค่าเริ่มต้น
  useEffect(() => {
    if (isEdit && initialValues) {
      // แปลงรูปแบบข้อมูลให้ตรงกับ form (เช่น รูปแบบวันที่)
      const formattedInitial = {
        ...initialValues,
        publication_date: initialValues.publication_date
          ? dayjs(initialValues.publication_date)
          : null,
      };

      form.setFieldsValue(formattedInitial);
      setProjectType(initialValues.type);

      // เตรียมข้อมูลไฟล์เริ่มต้น
      const initialFileList = {
        coverImage: [],
        paperFile: [],
        courseworkPoster: [],
        courseworkImage: [],
        courseworkVideo: [],
        competitionPoster: [],
      };

      // จัดการไฟล์ตามประเภทโปรเจค
      if (initialValues.files && initialValues.files.length > 0) {
        initialValues.files.forEach((file) => {
          // สร้างออบเจ็กต์ที่ตรงกับ Upload component
          const fileObj = {
            uid: file.id || `-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            status: "done",
            url: file.path,
            size: file.size,
            type: file.type,
            originalFile: file, // เก็บข้อมูลไฟล์ต้นฉบับ
          };

          // จัดไฟล์เข้าหมวดหมู่ตามประเภท
          switch (file.type) {
            case "image":
              if (projectType === PROJECT_TYPE.COURSEWORK) {
                if (initialFileList.courseworkPoster.length === 0) {
                  initialFileList.courseworkPoster.push(fileObj);
                } else {
                  initialFileList.courseworkImage.push(fileObj);
                }
              } else if (projectType === PROJECT_TYPE.COMPETITION) {
                initialFileList.competitionPoster.push(fileObj);
              }
              break;
            case "pdf":
              initialFileList.paperFile.push(fileObj);
              break;
            case "video":
              initialFileList.courseworkVideo.push(fileObj);
              break;
            default:
              break;
          }
        });
      }

      setFileList(initialFileList);
    }
  }, [isEdit, initialValues, form]);

  // ตรวจสอบการเปลี่ยนแปลงประเภทโปรเจค
  const handleProjectTypeChange = (value) => {
    setProjectType(value);
    form.setFieldsValue({ type: value });
  };

  // ขั้นตอนการทำงานของแบบฟอร์ม
  const next = async () => {
    try {
      if (currentStep === STEPS.PROJECT_INFO) {
        // ตรวจสอบข้อมูลทั่วไปของโปรเจค
        const values = await form.validateFields([
          "title",
          "description",
          "type",
          "study_year",
          "year",
          "semester",
        ]);
        setValidatedValues((prev) => ({ ...prev, ...values }));
      } else if (currentStep === STEPS.SPECIFIC_INFO) {
        // ตรวจสอบข้อมูลเฉพาะตามประเภทโปรเจค
        if (projectType === PROJECT_TYPE.ACADEMIC) {
          const values = await form.validateFields([
            "published_year",
            "publication_date",
          ]);
          setValidatedValues((prev) => ({ ...prev, ...values }));
        } else if (projectType === PROJECT_TYPE.COMPETITION) {
          const values = await form.validateFields([
            "competition_name",
            "competition_year",
          ]);
          setValidatedValues((prev) => ({ ...prev, ...values }));
        } else if (projectType === PROJECT_TYPE.COURSEWORK) {
          const values = await form.validateFields(["clip_video"]);
          setValidatedValues((prev) => ({ ...prev, ...values }));
        }
      } else if (currentStep === STEPS.MEDIA_UPLOAD) {
        // ตรวจสอบว่ามีการอัปโหลดไฟล์ที่จำเป็นหรือไม่
        if (
          projectType === PROJECT_TYPE.ACADEMIC &&
          fileList.paperFile.length === 0
        ) {
          message.error("กรุณาอัปโหลดไฟล์บทความวิชาการ (.pdf)");
          return;
        } else if (
          projectType === PROJECT_TYPE.COURSEWORK &&
          fileList.courseworkPoster.length === 0
        ) {
          message.error("กรุณาอัปโหลดรูปโปสเตอร์สำหรับงานในชั้นเรียน");
          return;
        } else if (
          projectType === PROJECT_TYPE.COMPETITION &&
          fileList.competitionPoster.length === 0
        ) {
          message.error("กรุณาอัปโหลดรูปโปสเตอร์สำหรับการแข่งขัน");
          return;
        }
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // จัดการไฟล์อัปโหลด
  const handleFileChange = (info, fileType) => {
    let fileListCopy = [...info.fileList];

    // จำกัดจำนวนไฟล์
    if (
      fileType === "courseworkPoster" ||
      fileType === "competitionPoster" ||
      fileType === "paperFile" ||
      fileType === "courseworkVideo"
    ) {
      fileListCopy = fileListCopy.slice(-1); // เก็บแค่ไฟล์ล่าสุด
    } else if (fileType === "courseworkImage") {
      fileListCopy = fileListCopy.slice(-3); // เก็บแค่ 3 ไฟล์ล่าสุด
    }

    setFileList({
      ...fileList,
      [fileType]: fileListCopy,
    });
  };

  // ตรวจสอบไฟล์ก่อนอัปโหลด
  const beforeUpload = (file, fileType) => {
    // ตรวจสอบประเภทไฟล์
    let isValidType = false;
    let allowedTypes = [];

    if (fileType === "paperFile") {
      allowedTypes = ["application/pdf"];
      isValidType = file.type === "application/pdf";
    } else if (
      fileType === "courseworkPoster" ||
      fileType === "courseworkImage" ||
      fileType === "competitionPoster"
    ) {
      allowedTypes = ALLOWED_FILE_TYPES.image;
      isValidType = allowedTypes.includes(file.type);
    } else if (fileType === "courseworkVideo") {
      allowedTypes = ALLOWED_FILE_TYPES.video;
      isValidType = allowedTypes.includes(file.type);
    }

    if (!isValidType) {
      message.error(
        `ไฟล์ "${
          file.name
        }" ไม่ถูกต้อง. กรุณาอัปโหลดไฟล์ประเภท: ${allowedTypes.join(", ")}`
      );
      return Upload.LIST_IGNORE;
    }

    // ตรวจสอบขนาดไฟล์
    let maxSize = 0;
    if (fileType === "paperFile") {
      maxSize = 10 * 1024 * 1024; // 10MB
    } else if (fileType === "courseworkVideo") {
      maxSize = 50 * 1024 * 1024; // 50MB
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB สำหรับรูปภาพ
    }

    if (!isFileSizeValid(file, maxSize)) {
      message.error(
        `ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป. ขนาดสูงสุดคือ ${formatFileSize(
          maxSize
        )}`
      );
      return Upload.LIST_IGNORE;
    }

    // ป้องกันไม่ให้มีการอัปโหลดไปยังเซิร์ฟเวอร์โดยตรง (จะใช้ FormData ส่งทั้งฟอร์ม)
    return false;
  };

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      
      // ทดสอบการสร้าง FormData อย่างง่าย
      const testFormData = new FormData();
      testFormData.append('test', 'value');
      console.log("Test FormData:", testFormData);
      console.log("Test FormData has entries:", [...testFormData.entries()].length > 0);
      
      // สร้าง FormData จริงสำหรับส่งข้อมูล
      const formData = new FormData();
      
      // ใช้วิธีการแบบ manual แทนการใช้ loop
      const values = form.getFieldsValue(true);
      
      formData.append('title', values.title || '');
      formData.append('description', values.description || '');
      formData.append('type', projectType || '');
      formData.append('study_year', String(values.study_year || ''));
      formData.append('year', String(values.year || ''));
      formData.append('semester', values.semester || '');
      formData.append('visibility', String(values.visibility || 1));
      
      if (projectType === PROJECT_TYPE.ACADEMIC) {
        formData.append('published_year', String(values.published_year || ''));
        if (values.publication_date) {
          const dateStr = dayjs.isDayjs(values.publication_date) ? 
            values.publication_date.format('YYYY-MM-DD') : values.publication_date;
          formData.append('publication_date', dateStr);
        }
        
        if (fileList.paperFile.length > 0) {
          const fileObj = fileList.paperFile[0];
          if (fileObj.originFileObj) {
            console.log("Adding originFileObj:", fileObj.originFileObj);
            formData.append('paperFile', fileObj.originFileObj);
          } else if (fileObj instanceof File || fileObj instanceof Blob) {
            console.log("Adding file directly:", fileObj);
            formData.append('paperFile', fileObj);
          } else if (fileObj.originalFile) {
            console.log("Adding originalFile:", fileObj.originalFile);
            formData.append('paperFile', fileObj.originalFile);
          }
        }
      }
      
      // ตรวจสอบ FormData อีกครั้ง
      console.log("FormData entries count:", [...formData.entries()].length);
      
      if ([...formData.entries()].length === 0) {
        console.error("FormData is still empty after adding fields");
        message.error("ไม่สามารถสร้างข้อมูลสำหรับส่งได้ โปรดลองอีกครั้ง");
        setConfirmLoading(false);
        return;
      }
      
      // ส่งข้อมูลแบบใช้ object ธรรมดาแทน FormData
      const plainDataObject = {
        title: values.title,
        description: values.description,
        type: projectType,
        study_year: values.study_year,
        year: values.year,
        semester: values.semester,
        visibility: values.visibility
      };
      
      if (projectType === PROJECT_TYPE.ACADEMIC) {
        plainDataObject.published_year = values.published_year;
        if (values.publication_date) {
          plainDataObject.publication_date = dayjs.isDayjs(values.publication_date) ? 
            values.publication_date.format('YYYY-MM-DD') : values.publication_date;
        }
        // สำหรับไฟล์จะต้องจัดการในฝั่ง onSubmit โดยเพิ่มเข้า FormData
      }
      
      console.log("Calling onSubmit with plain object:", plainDataObject);
      
      // ส่งทั้ง plain object และ file objects แยกกัน
      const fileObjects = {};
      if (fileList.paperFile.length > 0) {
        fileObjects.paperFile = fileList.paperFile[0];
      }
      
      // ส่งไปที่ onSubmit พร้อมไฟล์แยก
      onSubmit({ data: plainDataObject, files: fileObjects });
      
      setConfirmLoading(false);
    } catch (error) {
      console.error("Form submission error:", error);
      setConfirmLoading(false);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
  };

  // แสดงข้อมูลในขั้นตอนตรวจสอบ
  // แก้ไขฟังก์ชัน renderReviewData ทั้งหมด
  const renderReviewData = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            ข้อมูลทั่วไป
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ชื่อโปรเจค</p>
              <p className="font-medium">{validatedValues.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ประเภท</p>
              <p className="font-medium">
                {PROJECT_TYPE_DISPLAY[validatedValues.type]}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ชั้นปี</p>
              <p className="font-medium">ปี {validatedValues.study_year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ปีการศึกษา/ภาคเรียน</p>
              <p className="font-medium">
                {validatedValues.year} / {validatedValues.semester}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">คำอธิบาย</p>
            <p className="font-medium whitespace-pre-line">
              {validatedValues.description}
            </p>
          </div>
        </div>

        {/* ข้อมูลเฉพาะตามประเภท */}
        {projectType === PROJECT_TYPE.ACADEMIC && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              ข้อมูลบทความวิชาการ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ปีที่ตีพิมพ์</p>
                <p className="font-medium">{validatedValues.published_year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">วันที่ตีพิมพ์</p>
                <p className="font-medium">
                  {validatedValues.publication_date
                    ? formatDate(validatedValues.publication_date)
                    : ""}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">ไฟล์บทความ</p>
              <ul className="list-disc pl-5">
                {fileList.paperFile.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {projectType === PROJECT_TYPE.COMPETITION && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              ข้อมูลการแข่งขัน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ชื่อการแข่งขัน</p>
                <p className="font-medium">
                  {validatedValues.competition_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ปีที่แข่งขัน</p>
                <p className="font-medium">
                  {validatedValues.competition_year}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">รูปโปสเตอร์</p>
              <ul className="list-disc pl-5">
                {fileList.competitionPoster.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {projectType === PROJECT_TYPE.COURSEWORK && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              ข้อมูลงานในชั้นเรียน
            </h3>
            <div className="mt-3">
              <p className="text-sm text-gray-500">โปสเตอร์</p>
              <ul className="list-disc pl-5">
                {fileList.courseworkPoster.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
            {fileList.courseworkImage.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">รูปภาพเพิ่มเติม</p>
                <ul className="list-disc pl-5">
                  {fileList.courseworkImage.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {fileList.courseworkVideo.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">วิดีโอ</p>
                <ul className="list-disc pl-5">
                  {fileList.courseworkVideo.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {validatedValues.clip_video && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">ลิงก์วิดีโอ</p>
                <p className="font-medium">{validatedValues.clip_video}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // แสดงขั้นตอนตามค่า currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.PROJECT_INFO:
        return (
          <div className="space-y-6">
            <Form.Item
              name="title"
              label="ชื่อโปรเจค"
              rules={[
                { required: true, message: "กรุณากรอกชื่อโปรเจค" },
                {
                  min: 5,
                  message: "ชื่อโปรเจคต้องมีความยาวอย่างน้อย 5 ตัวอักษร",
                },
              ]}
            >
              <Input placeholder="ระบุชื่อโปรเจค" maxLength={100} />
            </Form.Item>

            <Form.Item
              name="description"
              label="คำอธิบาย"
              rules={[
                { required: true, message: "กรุณากรอกคำอธิบายโปรเจค" },
                {
                  min: 20,
                  message: "คำอธิบายต้องมีความยาวอย่างน้อย 20 ตัวอักษร",
                },
              ]}
            >
              <TextArea
                placeholder="อธิบายรายละเอียดของโปรเจค"
                autoSize={{ minRows: 4, maxRows: 8 }}
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="ประเภทโปรเจค"
              rules={[{ required: true, message: "กรุณาเลือกประเภทโปรเจค" }]}
            >
              <Select
                placeholder="เลือกประเภทโปรเจค"
                onChange={handleProjectTypeChange}
                options={PROJECT_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="study_year"
                label="ชั้นปี"
                rules={[{ required: true, message: "กรุณาเลือกชั้นปี" }]}
              >
                <Select
                  placeholder="เลือกชั้นปี"
                  options={[
                    { value: 1, label: "ปี 1" },
                    { value: 2, label: "ปี 2" },
                    { value: 3, label: "ปี 3" },
                    { value: 4, label: "ปี 4" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="year"
                label="ปีการศึกษา"
                rules={[{ required: true, message: "กรุณากรอกปีการศึกษา" }]}
              >
                <InputNumber
                  min={2520}
                  max={2600}
                  placeholder="เช่น 2566"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="semester"
              label="ภาคเรียน"
              rules={[{ required: true, message: "กรุณาเลือกภาคเรียน" }]}
            >
              <Select
                placeholder="เลือกภาคเรียน"
                options={[
                  { value: "1", label: "ภาคเรียนที่ 1" },
                  { value: "2", label: "ภาคเรียนที่ 2" },
                  { value: "3", label: "ภาคฤดูร้อน" },
                ]}
              />
            </Form.Item>

            <Form.Item name="visibility" label="การแสดงผล" initialValue={1}>
              <Select
                placeholder="เลือกการแสดงผล"
                options={[
                  { value: 1, label: "สาธารณะ" },
                  { value: 0, label: "ส่วนตัว" },
                ]}
              />
            </Form.Item>
          </div>
        );

      case STEPS.SPECIFIC_INFO:
        return (
          <div className="space-y-6">
            {projectType === PROJECT_TYPE.ACADEMIC && (
              <>
                <Form.Item
                  name="published_year"
                  label="ปีที่ตีพิมพ์"
                  rules={[{ required: true, message: "กรุณากรอกปีที่ตีพิมพ์" }]}
                >
                  <InputNumber
                    min={2520}
                    max={2600}
                    placeholder="เช่น 2566"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="publication_date"
                  label="วันที่ตีพิมพ์"
                  rules={[
                    { required: true, message: "กรุณาเลือกวันที่ตีพิมพ์" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </>
            )}

            {projectType === PROJECT_TYPE.COMPETITION && (
              <>
                <Form.Item
                  name="competition_name"
                  label="ชื่อการแข่งขัน"
                  rules={[
                    { required: true, message: "กรุณากรอกชื่อการแข่งขัน" },
                  ]}
                >
                  <Input placeholder="ระบุชื่อการแข่งขัน" />
                </Form.Item>

                <Form.Item
                  name="competition_year"
                  label="ปีที่แข่งขัน"
                  rules={[{ required: true, message: "กรุณากรอกปีที่แข่งขัน" }]}
                >
                  <InputNumber
                    min={2520}
                    max={2600}
                    placeholder="เช่น 2566"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </>
            )}

            {projectType === PROJECT_TYPE.COURSEWORK && (
              <>
                <Form.Item
                  name="clip_video"
                  label="ลิงก์วิดีโอ (ถ้ามี)"
                  rules={[
                    {
                      pattern:
                        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|facebook\.com|fb\.watch|tiktok\.com)\/.+/,
                      message:
                        "กรุณากรอกลิงก์วิดีโอจาก YouTube, Facebook หรือ TikTok ที่ถูกต้อง",
                      validateTrigger: "onBlur",
                    },
                  ]}
                >
                  <Input placeholder="URL จาก YouTube, Facebook หรือ TikTok" />
                </Form.Item>
              </>
            )}
          </div>
        );

      case STEPS.MEDIA_UPLOAD:
        return (
          <div className="space-y-8">
            {projectType === PROJECT_TYPE.ACADEMIC && (
              <div>
                <h3 className="text-lg font-medium mb-2">
                  อัปโหลดบทความวิชาการ
                </h3>
                <Form.Item label="ไฟล์บทความ (PDF)" required={true}>
                  <Dragger
                    name="paperFile"
                    fileList={fileList.paperFile}
                    onChange={(info) => handleFileChange(info, "paperFile")}
                    beforeUpload={(file) => beforeUpload(file, "paperFile")}
                    accept=".pdf"
                    maxCount={1}
                    multiple={false}
                  >
                    <p className="ant-upload-drag-icon">
                      <FileTextOutlined />
                    </p>
                    <p className="ant-upload-text">
                      คลิกหรือลากไฟล์มาที่นี่เพื่ออัปโหลด
                    </p>
                    <p className="ant-upload-hint">
                      รองรับเฉพาะไฟล์ PDF ขนาดไม่เกิน 10MB
                    </p>
                  </Dragger>
                </Form.Item>
              </div>
            )}

            {projectType === PROJECT_TYPE.COURSEWORK && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    อัปโหลดโปสเตอร์งานในชั้นเรียน
                  </h3>
                  <Form.Item label="รูปโปสเตอร์" required={true}>
                    <Dragger
                      name="courseworkPoster"
                      fileList={fileList.courseworkPoster}
                      onChange={(info) =>
                        handleFileChange(info, "courseworkPoster")
                      }
                      beforeUpload={(file) =>
                        beforeUpload(file, "courseworkPoster")
                      }
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      maxCount={1}
                      multiple={false}
                    >
                      <p className="ant-upload-drag-icon">
                        <PictureOutlined />
                      </p>
                      <p className="ant-upload-text">
                        คลิกหรือลากรูปภาพมาที่นี่เพื่ออัปโหลด
                      </p>
                      <p className="ant-upload-hint">
                        รองรับไฟล์รูปภาพ JPG, PNG, GIF, WebP ขนาดไม่เกิน 5MB
                      </p>
                    </Dragger>
                  </Form.Item>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    อัปโหลดรูปภาพเพิ่มเติม (ถ้ามี)
                  </h3>
                  <Form.Item label="รูปภาพเพิ่มเติม">
                    <Upload
                      name="courseworkImage"
                      listType="picture-card"
                      fileList={fileList.courseworkImage}
                      onChange={(info) =>
                        handleFileChange(info, "courseworkImage")
                      }
                      beforeUpload={(file) =>
                        beforeUpload(file, "courseworkImage")
                      }
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      maxCount={3}
                      multiple={true}
                    >
                      {fileList.courseworkImage.length >= 3 ? null : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>อัปโหลด</div>
                        </div>
                      )}
                    </Upload>
                    <p className="text-xs text-gray-500">
                      อัปโหลดได้สูงสุด 3 รูป
                    </p>
                  </Form.Item>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    อัปโหลดวิดีโอ (ถ้ามี)
                  </h3>
                  <Form.Item label="ไฟล์วิดีโอ">
                    <Dragger
                      name="courseworkVideo"
                      fileList={fileList.courseworkVideo}
                      onChange={(info) =>
                        handleFileChange(info, "courseworkVideo")
                      }
                      beforeUpload={(file) =>
                        beforeUpload(file, "courseworkVideo")
                      }
                      accept=".mp4,.webm,.mov"
                      maxCount={1}
                      multiple={false}
                    >
                      <p className="ant-upload-drag-icon">
                        <VideoCameraOutlined />
                      </p>
                      <p className="ant-upload-text">
                        คลิกหรือลากไฟล์วิดีโอมาที่นี่เพื่ออัปโหลด
                      </p>
                      <p className="ant-upload-hint">
                        รองรับไฟล์วิดีโอ MP4, WebM, QuickTime ขนาดไม่เกิน 50MB
                      </p>
                    </Dragger>
                  </Form.Item>
                </div>
              </div>
            )}
          </div>
        );

      case STEPS.REVIEW:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700">
                กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก
              </p>
            </div>
            {renderReviewData()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Spin spinning={isLoading}>
      <Card className="w-full">
        <Steps
          current={currentStep}
          items={[
            { title: "ข้อมูลทั่วไป", description: "ข้อมูลเบื้องต้นของโปรเจค" },
            { title: "ข้อมูลเฉพาะ", description: "รายละเอียดตามประเภทโปรเจค" },
            { title: "อัปโหลดไฟล์", description: "อัปโหลดไฟล์ที่เกี่ยวข้อง" },
            { title: "ตรวจสอบ", description: "ตรวจสอบข้อมูลก่อนบันทึก" },
          ]}
        />

        <Divider />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            visibility: 1,
            ...(initialValues || {}),
          }}
        >
          <div className="min-h-80 py-4">{renderStepContent()}</div>

          <div className="flex justify-between mt-8">
            {currentStep > 0 && <Button onClick={prev}>ย้อนกลับ</Button>}
            <div className="ml-auto">
              {currentStep < STEPS.REVIEW && (
                <Button type="primary" onClick={next}>
                  ถัดไป
                </Button>
              )}
              {currentStep === STEPS.REVIEW && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={confirmLoading}
                >
                  {isEdit ? "บันทึกการแก้ไข" : "บันทึกโปรเจค"}
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </Spin>
  );
};

export default ProjectForm;
