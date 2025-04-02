import React from 'react';
import { Modal, Button, Tag, Typography, Spin, Tabs, Descriptions, Image } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  getCategoryName, 
  formatThaiDate 
} from '../../utils/projectUtils';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProjectDetailsModal = ({ 
  detailModalVisible, 
  setDetailModalVisible, 
  selectedProject, 
  handleShowApproveModal, 
  handleShowRejectModal 
}) => {
  const navigate = useNavigate();

  return (
    <Modal
      title={
        <div className="flex items-center">
          <FileTextOutlined className="mr-2 text-[#90278E]" />
          <span>รายละเอียดโปรเจค</span>
        </div>
      }
      open={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setDetailModalVisible(false)}>
          ปิด
        </Button>,
        <Button
          key="view"
          type="default"
          onClick={() => {
            setDetailModalVisible(false);
            navigate(`/projects/${selectedProject?.project_id}`);
          }}
        >
          ดูรายละเอียดเพิ่มเติม
        </Button>,
        <Button
          key="approve"
          type="primary"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            setDetailModalVisible(false);
            handleShowApproveModal(selectedProject);
          }}
        >
          อนุมัติ
        </Button>,
        <Button
          key="reject"
          type="primary"
          danger
          onClick={() => {
            setDetailModalVisible(false);
            handleShowRejectModal(selectedProject);
          }}
        >
          ปฏิเสธ
        </Button>
      ]}
      width={700}
    >
      {selectedProject ? (
        <div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="ข้อมูลทั่วไป" key="1">
              <Descriptions bordered column={{ xs: 1, sm: 2 }} className="mb-4">
                <Descriptions.Item label="ชื่อโปรเจค">{selectedProject.title}</Descriptions.Item>
                <Descriptions.Item label="ประเภท">{getCategoryName(selectedProject.type)}</Descriptions.Item>
                <Descriptions.Item label="ชั้นปี">ปี {selectedProject.study_year}</Descriptions.Item>
                <Descriptions.Item label="ปีการศึกษา">{selectedProject.year}</Descriptions.Item>
                <Descriptions.Item label="ภาคการศึกษา">{selectedProject.semester}</Descriptions.Item>
                <Descriptions.Item label="เจ้าของ">{selectedProject.full_name || selectedProject.username || 'ไม่ระบุ'}</Descriptions.Item>
                <Descriptions.Item label="วันที่สร้าง" span={2}>
                  {formatThaiDate(selectedProject.created_at)}
                </Descriptions.Item>
              </Descriptions>

              <div className="mb-4">
                <Text strong>รายละเอียด:</Text>
                <Paragraph className="mt-2 bg-gray-50 p-4 rounded-md whitespace-pre-line">
                  {selectedProject.description || 'ไม่มีรายละเอียด'}
                </Paragraph>
              </div>

              {selectedProject.tags && (
                <div className="mb-4">
                  <Text strong>แท็ก:</Text>
                  <div className="mt-2">
                    {selectedProject.tags.split(',').map((tag, index) => (
                      <Tag key={index} color="purple" className="mr-1 mb-1">
                        {tag.trim()}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </TabPane>

            {selectedProject.cover_image && (
              <TabPane tab="รูปภาพ" key="2">
                <div className="flex justify-center">
                  <Image 
                    src={selectedProject.cover_image} 
                    alt={selectedProject.title} 
                    style={{ maxHeight: '400px' }}
                    fallback="https://via.placeholder.com/400x300?text=ไม่สามารถโหลดภาพได้"
                  />
                </div>
              </TabPane>
            )}
          </Tabs>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8">
          <Spin size="large" />
        </div>
      )}
    </Modal>
  );
};

export default ProjectDetailsModal;