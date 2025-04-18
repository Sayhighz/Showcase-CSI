import React from "react";
import {
  Typography,
  Descriptions,
  Tag,
  Divider,
  List,
  Image,
  Card,
  Space,
  Alert,
} from "antd";
import {
  FilePdfOutlined,
  VideoCameraOutlined,
  FileImageOutlined ,
  BookOutlined, // เพิ่มเข้ามา
  TeamOutlined, // เพิ่มเข้ามา
  TrophyOutlined,
} from "@ant-design/icons";
import {
  PROJECT_TYPE,
  PROJECT_TYPE_DISPLAY,
  PROJECT_TYPE_ICON,
  PROJECT_TYPE_COLOR,
} from "../../constants/projectTypes";

const { Title, Text, Paragraph } = Typography;

/**
 * Component for previewing project information before submission
 *
 * @param {Object} props - Component props
 * @param {string} props.projectType - Selected project type
 * @param {Object} props.basicInfo - Basic information object
 * @param {Object} props.additionalInfo - Additional information object
 * @param {Object} props.files - Files object
 * @returns {React.ReactElement} - Preview component
 */
const PreviewStep = ({ projectType, basicInfo, additionalInfo, files }) => {
  // Generate file URLs for preview
  const getFileURL = (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  // Create tag components from tags string
  const renderTags = (tagsString) => {
    if (!tagsString) return null;

    const tagArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    return (
      <Space size={[0, 8]} wrap>
        {tagArray.map((tag, index) => (
          <Tag key={index} color="blue">
            {tag}
          </Tag>
        ))}
      </Space>
    );
  };

  const renderProjectTypeInfo = () => (
    <Card className="mb-6 shadow-sm">
      <div className="flex items-center mb-4">
        {React.createElement(eval(PROJECT_TYPE_ICON[projectType]), {
          style: {
            fontSize: "24px",
            color: PROJECT_TYPE_COLOR[projectType],
            marginRight: "8px",
          },
        })}
        <Title level={4} className="m-0">
          {PROJECT_TYPE_DISPLAY[projectType]}
        </Title>
      </div>
      <Paragraph className="text-gray-600">{basicInfo.title}</Paragraph>
    </Card>
  );

  const renderBasicInfo = () => (
    <Card className="mb-6 shadow-sm" title="ข้อมูลพื้นฐาน">
      <Descriptions column={{ xs: 1, sm: 2 }} bordered>
        <Descriptions.Item label="ชื่อโครงงาน" span={2}>
          {basicInfo.title || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="รายละเอียด" span={2}>
          {basicInfo.description || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="ชั้นปีที่ทำโครงงาน">
          ปี {basicInfo.study_year || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="ปีการศึกษา">
          {basicInfo.year || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="ภาคการศึกษา">
          {basicInfo.semester || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="การมองเห็น">
          {basicInfo.visibility === 1 ? (
            <Tag color="green">เผยแพร่</Tag>
          ) : (
            <Tag color="orange">ส่วนตัว</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="แท็ก" span={2}>
          {renderTags(basicInfo.tags) || "-"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderAdditionalInfo = () => {
    if (projectType === PROJECT_TYPE.COURSEWORK) {
      return (
        <Card className="mb-6 shadow-sm" title="ข้อมูลรายวิชา">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="รหัสวิชา">
              {additionalInfo.course_code || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="ชื่อวิชา">
              {additionalInfo.course_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="อาจารย์ผู้สอน" span={2}>
              {additionalInfo.instructor || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    } else if (projectType === PROJECT_TYPE.ACADEMIC) {
      return (
        <Card className="mb-6 shadow-sm" title="ข้อมูลบทความวิชาการ">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="บทคัดย่อ" span={2}>
              {additionalInfo.abstract || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="วันที่ตีพิมพ์">
              {additionalInfo.publication_date || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="ปีที่ตีพิมพ์">
              {additionalInfo.published_year || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="ผู้เขียน" span={2}>
              {additionalInfo.authors || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="สถานที่ตีพิมพ์" span={2}>
              {additionalInfo.publication_venue || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    } else if (projectType === PROJECT_TYPE.COMPETITION) {
      return (
        <Card className="mb-6 shadow-sm" title="ข้อมูลการแข่งขัน">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="ชื่อการแข่งขัน">
              {additionalInfo.competition_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="ปีที่แข่งขัน">
              {additionalInfo.competition_year || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="ระดับการแข่งขัน">
              {additionalInfo.competition_level === "university" &&
                "มหาวิทยาลัย"}
              {additionalInfo.competition_level === "national" && "ระดับประเทศ"}
              {additionalInfo.competition_level === "international" &&
                "นานาชาติ"}
              {!additionalInfo.competition_level && "-"}
            </Descriptions.Item>
            <Descriptions.Item label="ผลงานที่ได้รับ">
              {additionalInfo.achievement || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="สมาชิกในทีม" span={2}>
              {additionalInfo.team_members || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    return null;
  };

  const renderFiles = () => {
    const fileItems = [];

    // Cover image
    if (files.coverImage) {
      fileItems.push({
        title: "รูปภาพหน้าปก",
        type: "image",
        file: files.coverImage,
        icon: <FileImageOutlined style={{ color: "#1890ff" }} />,
      });
    }

    // Project type specific files
    if (projectType === PROJECT_TYPE.COURSEWORK) {
      if (files.courseworkPoster) {
        fileItems.push({
          title: "โปสเตอร์โครงงาน",
          type: "image",
          file: files.courseworkPoster,
          icon: <FileImageOutlined style={{ color: "#52c41a" }} />,
        });
      }

      if (files.courseworkVideo) {
        fileItems.push({
          title: "วิดีโอนำเสนอผลงาน",
          type: "video",
          file: files.courseworkVideo,
          icon: <VideoCameraOutlined style={{ color: "#fa8c16" }} />,
        });
      }
    } else if (projectType === PROJECT_TYPE.ACADEMIC) {
      if (files.paperFile) {
        fileItems.push({
          title: "ไฟล์บทความ (PDF)",
          type: "pdf",
          file: files.paperFile,
          icon: <FilePdfOutlined style={{ color: "#f5222d" }} />,
        });
      }
    } else if (projectType === PROJECT_TYPE.COMPETITION) {
      if (files.competitionPoster) {
        fileItems.push({
          title: "โปสเตอร์การแข่งขัน",
          type: "image",
          file: files.competitionPoster,
          icon: <FileImageOutlined style={{ color: "#faad14" }} />,
        });
      }

      if (files.competitionVideo) {
        fileItems.push({
          title: "วิดีโอการแข่งขัน",
          type: "video",
          file: files.competitionVideo,
          icon: <VideoCameraOutlined style={{ color: "#fa8c16" }} />,
        });
      }
    }

    // แสดงข้อความเมื่อไม่มีไฟล์
    if (fileItems.length === 0) {
      return (
        <Card className="mb-6 shadow-sm" title="ไฟล์โครงงาน">
          <Alert
            message="ไม่พบไฟล์"
            description="คุณยังไม่ได้อัปโหลดไฟล์ใดๆ"
            type="info"
            showIcon
          />
        </Card>
      );
    }

    // แสดงรายการไฟล์
    return (
      <Card className="mb-6 shadow-sm" title="ไฟล์โครงงาน">
        <List
          itemLayout="horizontal"
          dataSource={fileItems}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={`${item.file.name} (${(
                  item.file.size /
                  1024 /
                  1024
                ).toFixed(2)} MB)`}
              />
              <div className="file-preview">
                {item.type === "image" && (
                  <Image
                    src={getFileURL(item.file)}
                    alt={item.title}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    fallback="data:image/png;base64,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"
                  />
                )}
                {item.type === "video" && (
                  <div className="video-info">
                    <Text>
                      ไฟล์วิดีโอขนาด {(item.file.size / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </Text>
                  </div>
                )}
                {item.type === "pdf" && (
                  <div className="pdf-info">
                    <Text>
                      ไฟล์ PDF ขนาด {(item.file.size / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </Text>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  return (
    <div className="preview-step">
      <div className="mb-6">
        <Title level={3}>ตรวจสอบข้อมูลก่อนส่ง</Title>
        <Paragraph className="text-gray-600">
          กรุณาตรวจสอบข้อมูลของโครงงานให้ถูกต้องก่อนอัปโหลด
        </Paragraph>
        <Alert
          message="รอการอนุมัติ"
          description="หลังจากอัปโหลดเรียบร้อยแล้ว โครงงานของคุณจะถูกส่งไปให้ผู้ดูแลระบบตรวจสอบและอนุมัติก่อนจึงจะแสดงบนเว็บไซต์"
          type="info"
          showIcon
          className="mb-4"
        />
      </div>

      <Divider />

      {renderProjectTypeInfo()}
      {renderBasicInfo()}
      {renderAdditionalInfo()}
      {renderFiles()}
    </div>
  );
};

export default PreviewStep;
