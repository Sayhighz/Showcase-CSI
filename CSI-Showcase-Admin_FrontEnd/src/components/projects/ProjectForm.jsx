// ProjectForm.jsx (ไฟล์หลัก)
import React, { useState, useEffect } from "react";
import {
  Form,
  Steps,
  Divider,
  Card,
  Button,
  Spin,
  message
} from "antd";
import BasicInfoStep from "./steps/BasicInfoStep";
import SpecificInfoStep from "./steps/SpecificInfoStep";
import MediaUploadStep from "./steps/MediaUploadStep";
import ContributorsStep from "./steps/ContributorsStep";
import ReviewStep from "./steps/ReviewStep";

const { Step } = Steps;

// ขั้นตอนต่างๆ ของฟอร์ม
const STEPS = {
  PROJECT_INFO: 0,
  SPECIFIC_INFO: 1,
  CONTRIBUTORS: 2,
  MEDIA_UPLOAD: 3,
  REVIEW: 4,
};

// Project types
const PROJECT_TYPE = {
  COURSEWORK: 'coursework',
  ACADEMIC: 'academic',
  COMPETITION: 'competition'
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
  const [contributors, setContributors] = useState(initialValues.contributors || []);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ปรับค่าเริ่มต้น
  useEffect(() => {
    if (isEdit && initialValues) {
      form.setFieldsValue(initialValues);
      setProjectType(initialValues.type);
      
      // ถ้ามีข้อมูล contributors
      if (initialValues.contributors && Array.isArray(initialValues.contributors)) {
        setContributors(initialValues.contributors);
      }
    }
  }, [isEdit, initialValues, form]);

  // ตรวจสอบการเปลี่ยนแปลงประเภทโปรเจค
  const handleProjectTypeChange = (value) => {
    setProjectType(value);
    form.setFieldsValue({ type: value });
  };

  // จัดการรายชื่อผู้ร่วมโปรเจค
  const handleContributorsChange = (newContributors) => {
    setContributors(newContributors);
  };

  // การเปลี่ยนแปลงข้อมูลไฟล์อัปโหลด
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

  // ขั้นตอนถัดไป
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
          "visibility"
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
      } else if (currentStep === STEPS.CONTRIBUTORS) {
        // ตรวจสอบและบันทึกข้อมูลผู้ร่วมโครงการ
        setValidatedValues((prev) => ({ ...prev, contributors }));
      } else if (currentStep === STEPS.MEDIA_UPLOAD) {
        // ตรวจสอบว่ามีการอัปโหลดไฟล์ที่จำเป็นหรือไม่
        if (
          projectType === PROJECT_TYPE.ACADEMIC &&
          fileList.paperFile.length === 0 &&
          !isEdit
        ) {
          message.error("กรุณาอัปโหลดไฟล์บทความวิชาการ (.pdf)");
          return;
        } else if (
          projectType === PROJECT_TYPE.COURSEWORK &&
          fileList.courseworkPoster.length === 0 &&
          !isEdit
        ) {
          message.error("กรุณาอัปโหลดรูปโปสเตอร์สำหรับงานในชั้นเรียน");
          return;
        } else if (
          projectType === PROJECT_TYPE.COMPETITION &&
          fileList.competitionPoster.length === 0 &&
          !isEdit
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

  // ขั้นตอนก่อนหน้า
  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      
      // เตรียมข้อมูลสำหรับส่งไปยัง API
      const values = form.getFieldsValue(true);
      
      // แปลง contributors เป็น JSON string ตามที่ API ต้องการ
      const contributorsJson = JSON.stringify(
        contributors.map(c => ({ 
          user_id: c.user_id, 
          role: c.role 
        }))
      );
      
      // สร้าง object สำหรับข้อมูลโปรเจค
      const projectData = {
        title: values.title,
        description: values.description,
        type: projectType,
        study_year: values.study_year,
        year: values.year,
        semester: values.semester,
        visibility: values.visibility || 1,
        contributors: contributorsJson,
      };
      
      // เพิ่มข้อมูลเฉพาะตามประเภทโปรเจค
      if (projectType === PROJECT_TYPE.ACADEMIC) {
        projectData.published_year = values.published_year;
        if (values.publication_date) {
          projectData.publication_date = values.publication_date.format ? 
            values.publication_date.format('YYYY-MM-DD') : values.publication_date;
        }
      } else if (projectType === PROJECT_TYPE.COMPETITION) {
        projectData.competition_name = values.competition_name;
        projectData.competition_year = values.competition_year;
      } else if (projectType === PROJECT_TYPE.COURSEWORK) {
        projectData.clip_video = values.clip_video;
      }
      
      // รวบรวมไฟล์ที่จะส่งไป
      const filesData = {};
      
      // จัดการไฟล์ตามประเภทโปรเจค
      if (projectType === PROJECT_TYPE.ACADEMIC && fileList.paperFile.length > 0) {
        const paperFile = fileList.paperFile[0];
        if (paperFile.originFileObj) {
          filesData.paperFile = paperFile.originFileObj;
        } else if (paperFile instanceof File) {
          filesData.paperFile = paperFile;
        }
      } else if (projectType === PROJECT_TYPE.COMPETITION && fileList.competitionPoster.length > 0) {
        const posterFile = fileList.competitionPoster[0];
        if (posterFile.originFileObj) {
          filesData.competitionPoster = posterFile.originFileObj;
        } else if (posterFile instanceof File) {
          filesData.competitionPoster = posterFile;
        }
      } else if (projectType === PROJECT_TYPE.COURSEWORK) {
        if (fileList.courseworkPoster.length > 0) {
          const posterFile = fileList.courseworkPoster[0];
          if (posterFile.originFileObj) {
            filesData.courseworkPoster = posterFile.originFileObj;
          } else if (posterFile instanceof File) {
            filesData.courseworkPoster = posterFile;
          }
        }
        
        if (fileList.courseworkImage.length > 0) {
          const imageFile = fileList.courseworkImage[0];
          if (imageFile.originFileObj) {
            filesData.courseworkImage = imageFile.originFileObj;
          } else if (imageFile instanceof File) {
            filesData.courseworkImage = imageFile;
          }
        }
        
        if (fileList.courseworkVideo.length > 0) {
          const videoFile = fileList.courseworkVideo[0];
          if (videoFile.originFileObj) {
            filesData.courseworkVideo = videoFile.originFileObj;
          } else if (videoFile instanceof File) {
            filesData.courseworkVideo = videoFile;
          }
        }
      }
      
      console.log("Data to submit:", { data: projectData, files: filesData });
      
      // ส่งข้อมูลไปยัง API
      await onSubmit({ data: projectData, files: filesData });
      
      setConfirmLoading(false);
    } catch (error) {
      console.error("Form submission error:", error);
      setConfirmLoading(false);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
  };

  // แสดงขั้นตอนตามค่า currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.PROJECT_INFO:
        return (
          <BasicInfoStep 
            form={form} 
            onProjectTypeChange={handleProjectTypeChange} 
          />
        );

      case STEPS.SPECIFIC_INFO:
        return (
          <SpecificInfoStep 
            form={form} 
            projectType={projectType} 
          />
        );
        
      case STEPS.CONTRIBUTORS:
        return (
          <ContributorsStep 
            contributors={contributors} 
            onChange={handleContributorsChange} 
          />
        );

      case STEPS.MEDIA_UPLOAD:
        return (
          <MediaUploadStep 
            projectType={projectType} 
            fileList={fileList} 
            onFileChange={handleFileChange} 
          />
        );

      case STEPS.REVIEW:
        return (
          <ReviewStep 
            projectType={projectType} 
            validatedValues={validatedValues} 
            fileList={fileList} 
            contributors={contributors}
          />
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
          className="mb-6"
          items={[
            { 
              title: "ข้อมูลทั่วไป", 
              description: "ข้อมูลเบื้องต้นของโปรเจค" 
            },
            { 
              title: "ข้อมูลเฉพาะ", 
              description: "รายละเอียดตามประเภทโปรเจค" 
            },
            { 
              title: "ผู้ร่วมโปรเจค", 
              description: "เพิ่มผู้ร่วมสร้างโปรเจค" 
            },
            { 
              title: "อัปโหลดไฟล์", 
              description: "อัปโหลดไฟล์ที่เกี่ยวข้อง" 
            },
            { 
              title: "ตรวจสอบ", 
              description: "ตรวจสอบข้อมูลก่อนบันทึก" 
            },
          ]}
        />

        <Divider className="my-4" />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            visibility: 1,
            ...(initialValues || {}),
          }}
          className="w-full"
        >
          <div className="min-h-80 py-4">{renderStepContent()}</div>

          <div className="flex justify-between mt-8 gap-2">
            {currentStep > 0 && (
              <Button onClick={prev}>
                ย้อนกลับ
              </Button>
            )}
            <div className={`${currentStep > 0 ? 'ml-auto' : 'w-full flex justify-end'}`}>
              {currentStep < STEPS.REVIEW && (
                <Button 
                  type="primary" 
                  onClick={next}
                >
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