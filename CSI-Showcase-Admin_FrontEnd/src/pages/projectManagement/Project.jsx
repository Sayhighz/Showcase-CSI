import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Select,
  Input,
  Modal,
  Form,
  Space,
  Card,
  Typography,
  Tag,
  Tooltip,
  Badge,
  Spin,
  Drawer,
  message,
  Tabs,
  Divider,
  Avatar,
  Row,
  Col,
  Popconfirm,
  Result,
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  FileImageOutlined,
  LinkOutlined,
  ProjectOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAdminState } from "../../context/AdminStateContext";
import useDebounce from "../../hooks/useDebounce";
import {
  getAllProjects,
  getPendingProjects,
  getProjectDetail,
  reviewProject,
  deleteProject,
} from "../../services/projectService";
import useAuth from "../../hooks/useAuth";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Project = () => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { admin } = useAuth();
  const {
    filters,
    updateFilters,
    resetFilters,
    setPendingProjectsCount,
    refreshData,
    lastRefreshed,
  } = useAdminState();

  // Local state
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [form] = Form.useForm();

  // Search params
  const [searchText, setSearchText] = useState(filters.projects.search || "");
  const debouncedSearchText = useDebounce(searchText, 500);

  // Fetch projects on component mount and when lastRefreshed changes
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const allProjects = await getAllProjects();
        const pendingProjects = await getPendingProjects();

        // Combine and deduplicate projects
        const combinedProjects = [...allProjects];
        pendingProjects.forEach((pendingProject) => {
          if (
            !combinedProjects.some(
              (p) => p.projectId === pendingProject.projectId
            )
          ) {
            combinedProjects.push(pendingProject);
          }
        });

        setProjects(combinedProjects);

        // Update pending projects count in global state
        setPendingProjectsCount(pendingProjects.length);

        // Check if there's a project ID in the query params
        const projectId = queryParams.get("id");
        if (projectId) {
          const projectToShow = combinedProjects.find(
            (p) => p.projectId === projectId
          );
          if (projectToShow) {
            setSelectedProject(projectToShow);
            loadProjectDetails(projectId);
            setDetailVisible(true);
          }
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        message.error("ไม่สามารถโหลดข้อมูลโปรเจคได้");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [lastRefreshed, setPendingProjectsCount]);

  // Apply filters when projects or filter values change
  useEffect(() => {
    let result = [...projects];

    // Filter by tab (status)
    if (currentTab === "pending") {
      result = result.filter((project) => project.status === "pending");
    } else if (currentTab === "approved") {
      result = result.filter((project) => project.status === "approved");
    } else if (currentTab === "rejected") {
      result = result.filter((project) => project.status === "rejected");
    }

    // Apply text search
    if (debouncedSearchText) {
      const lowerSearchText = debouncedSearchText.toLowerCase();
      result = result.filter(
        (project) =>
          project.title?.toLowerCase().includes(lowerSearchText) ||
          project.description?.toLowerCase().includes(lowerSearchText) ||
          (project.author?.fullName &&
            project.author.fullName.toLowerCase().includes(lowerSearchText))
      );
    }

    // Apply type filter
    if (filters.projects.type) {
      result = result.filter(
        (project) => project.category === filters.projects.type
      );
    }

    // Apply year filter
    if (filters.projects.year) {
      result = result.filter(
        (project) => project.year === filters.projects.year
      );
    }

    // Apply study year filter
    if (filters.projects.studyYear) {
      result = result.filter(
        (project) => project.level === filters.projects.studyYear
      );
    }

    setFilteredProjects(result);
  }, [projects, filters.projects, debouncedSearchText, currentTab]);

  // Update search state in global filters
  useEffect(() => {
    updateFilters("projects", { search: debouncedSearchText });
  }, [debouncedSearchText, updateFilters]);

  // Load project details
  const loadProjectDetails = async (projectId) => {
    setDetailLoading(true);
    try {
      const data = await getProjectDetail(projectId);
      setSelectedProject((prevState) => ({ ...prevState, ...data }));
    } catch (error) {
      console.error("Failed to load project details:", error);
      message.error("ไม่สามารถโหลดรายละเอียดโปรเจคได้");
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle project approval
  const handleApprove = async (projectId) => {
    setActionLoading(true);
    try {
      await reviewProject(projectId, "approved");
      message.success("อนุมัติโปรเจคสำเร็จ");
      refreshData(); // Trigger data refresh
      closeDetailDrawer();
    } catch (error) {
      console.error("Approval failed:", error);
      message.error("ไม่สามารถอนุมัติโปรเจคได้");
    } finally {
      setActionLoading(false);
    }
  };

  // Open reject modal
  const showRejectModal = (project) => {
    setSelectedProject(project);
    form.resetFields();
    setRejectReason("");
    setRejectModalVisible(true);
  };

  // Handle project rejection
  const handleReject = async () => {
    try {
      await form.validateFields();
      setActionLoading(true);

      try {
        await reviewProject(
          selectedProject.projectId,
          "rejected",
          rejectReason
        );
        message.success("ปฏิเสธโปรเจคสำเร็จ");
        setRejectModalVisible(false);
        refreshData(); // Trigger data refresh
        closeDetailDrawer();
      } catch (error) {
        console.error("Rejection failed:", error);
        message.error("ไม่สามารถปฏิเสธโปรเจคได้");
      } finally {
        setActionLoading(false);
      }
    } catch (error) {
      // Form validation error
      console.error("Validation failed:", error);
    }
  };

  // Show delete confirmation
  const showDeleteConfirm = (project) => {
    setSelectedProject(project);
    setDeleteModalVisible(true);
  };

  // Handle project deletion
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteProject(selectedProject.projectId);
      message.success("ลบโปรเจคสำเร็จ");
      refreshData(); // Trigger data refresh
      setDeleteModalVisible(false);
      closeDetailDrawer();
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("ไม่สามารถลบโปรเจคได้");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle batch operations
  const handleBatchOperation = async (operation) => {
    if (selectedRows.length === 0) {
      message.warning("กรุณาเลือกโปรเจคที่ต้องการดำเนินการ");
      return;
    }

    setActionLoading(true);

    try {
      if (operation === "approve") {
        for (const projectId of selectedRows) {
          await reviewProject(projectId, "approved");
        }
        message.success(`อนุมัติโปรเจค ${selectedRows.length} รายการสำเร็จ`);
      } else if (operation === "reject") {
        // ในกรณีปฏิเสธแบบ batch ควรมีการเพิ่มเหตุผลที่ใช้ร่วมกัน
        Modal.confirm({
          title: `ปฏิเสธโปรเจค ${selectedRows.length} รายการ`,
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              <p>คุณต้องการปฏิเสธโปรเจคที่เลือกทั้งหมดใช่หรือไม่?</p>
              <Form layout="vertical">
                <Form.Item
                  label="เหตุผลในการปฏิเสธ"
                  name="batchRejectReason"
                  rules={[
                    { required: true, message: "กรุณาระบุเหตุผลในการปฏิเสธ" },
                  ]}
                >
                  <TextArea rows={4} />
                </Form.Item>
              </Form>
            </div>
          ),
          okText: "ปฏิเสธ",
          cancelText: "ยกเลิก",
          okButtonProps: { danger: true },
          onOk: async (close) => {
            const formInstance = Form.useForm()[0];
            try {
              const values = await formInstance.validateFields();
              for (const projectId of selectedRows) {
                await reviewProject(
                  projectId,
                  "rejected",
                  values.batchRejectReason
                );
              }
              message.success(
                `ปฏิเสธโปรเจค ${selectedRows.length} รายการสำเร็จ`
              );
              close();
              refreshData();
              setSelectedRows([]);
            } catch (validationError) {
              return false; // ป้องกันการปิด modal ถ้า validation ไม่ผ่าน
            }
          },
        });
        return;
      }

      refreshData(); // Trigger data refresh
      setSelectedRows([]);
    } catch (error) {
      console.error(`Batch ${operation} failed:`, error);
      message.error(`การดำเนินการแบบกลุ่มไม่สำเร็จ`);
    } finally {
      setActionLoading(false);
    }
  };

  // Show project details drawer
  const showProjectDetail = (project) => {
    setSelectedProject(project);
    loadProjectDetails(project.projectId);
    setDetailVisible(true);

    // Update URL with project ID without navigating
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("id", project.projectId);
    window.history.pushState({}, "", newUrl);
  };

  // Close project details drawer
  const closeDetailDrawer = () => {
    setDetailVisible(false);

    // Remove project ID from URL without navigating
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete("id");
    window.history.pushState({}, "", newUrl);
  };

  // Reset all filters
  const handleResetFilters = () => {
    resetFilters("projects");
    setSearchText("");
    setCurrentTab("all");
  };

  // Get tag color based on project type
  const getCategoryColor = (category) => {
    switch (category) {
      case "academic":
        return "blue";
      case "coursework":
        return "green";
      case "competition":
        return "gold";
      default:
        return "default";
    }
  };

  // Get category display name
  const getCategoryName = (category) => {
    switch (category) {
      case "academic":
        return "บทความวิชาการ";
      case "coursework":
        return "ผลงานการเรียน";
      case "competition":
        return "การแข่งขัน";
      default:
        return category;
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "academic":
        return <BookOutlined />;
      case "coursework":
        return <TeamOutlined />;
      case "competition":
        return <TrophyOutlined />;
      default:
        return <ProjectOutlined />;
    }
  };

  // Get status display name
  const getStatusName = (status) => {
    switch (status) {
      case "approved":
        return "อนุมัติแล้ว";
      case "pending":
        return "รอตรวจสอบ";
      case "rejected":
        return "ถูกปฏิเสธ";
      default:
        return status;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  // Formatted date helper
  const formatDate = (dateString) => {
    if (!dateString) return "ไม่ระบุ";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Formatted time helper
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Table columns
  const columns = [
    {
      title: "ลำดับ",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "ชื่อโปรเจค",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="font-medium">
            <a onClick={() => showProjectDetail(record)}>{text}</a>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            โดย: {record.author?.fullName || "ไม่ระบุ"}
          </div>
        </div>
      ),
    },
    {
      title: "ประเภท",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => (
        <Tag
          color={getCategoryColor(category)}
          icon={getCategoryIcon(category)}
        >
          {getCategoryName(category)}
        </Tag>
      ),
      filters: [
        { text: "บทความวิชาการ", value: "academic" },
        { text: "ผลงานการเรียน", value: "coursework" },
        { text: "การแข่งขัน", value: "competition" },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "ระดับ/ปี",
      key: "levelYear",
      width: 130,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary" className="text-xs">
            ระดับ: {record.level || "ไม่ระบุ"}
          </Text>
          <Text type="secondary" className="text-xs">
            ปี: {record.year || "ไม่ระบุ"}
          </Text>
        </Space>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusName(status)}</Tag>
      ),
      filters: [
        { text: "รอตรวจสอบ", value: "pending" },
        { text: "อนุมัติแล้ว", value: "approved" },
        { text: "ถูกปฏิเสธ", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (
        <Space direction="vertical" size={0}>
          <div>{formatDate(date)}</div>
          <div className="text-xs text-gray-500">{formatTime(date)}</div>
        </Space>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "ดำเนินการ",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <Button
              icon={<EyeOutlined />}
              onClick={() => showProjectDetail(record)}
              size="small"
            />
          </Tooltip>

          {record.status === "pending" && (
            <>
              <Tooltip title="อนุมัติ">
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record.projectId)}
                  type="primary"
                  size="small"
                  className="bg-green-600 hover:bg-green-700"
                  loading={actionLoading}
                />
              </Tooltip>

              <Tooltip title="ปฏิเสธ">
                <Button
                  icon={<CloseCircleOutlined />}
                  onClick={() => showRejectModal(record)}
                  type="primary"
                  danger
                  size="small"
                  loading={actionLoading}
                />
              </Tooltip>
            </>
          )}

          <Tooltip title="ลบ">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
              danger
              size="small"
              ghost
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Row selection config
  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys) => {
      setSelectedRows(selectedRowKeys);
    },
    selections: [
      {
        key: "pending",
        text: "เลือกโปรเจคที่รออนุมัติ",
        onSelect: () => {
          const pendingProjects = projects
            .filter((project) => project.status === "pending")
            .map((project) => project.projectId);
          setSelectedRows(pendingProjects);
        },
      },
    ],
  };

  return (
    <div className="p-4">
      <Card
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-purple-600" />
            <span>จัดการผลงาน</span>
          </div>
        }
        className="shadow-sm mb-6"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={loading}
            >
              รีเฟรช
            </Button>
            <Link to="/projects/review">
              <Button
                type="primary"
                className="bg-purple-600 hover:bg-purple-700"
                icon={<CheckCircleOutlined />}
              >
                ตรวจสอบผลงาน
              </Button>
            </Link>
          </Space>
        }
      >
        <Tabs activeKey={currentTab} onChange={setCurrentTab} className="mb-4">
          <TabPane tab={<span>ทั้งหมด</span>} key="all" />
          <TabPane
            tab={
              <Badge
                count={projects.filter((p) => p.status === "pending").length}
                offset={[5, 0]}
              >
                <span>รอตรวจสอบ</span>
              </Badge>
            }
            key="pending"
          />
          <TabPane tab={<span>อนุมัติแล้ว</span>} key="approved" />
          <TabPane tab={<span>ถูกปฏิเสธ</span>} key="rejected" />
        </Tabs>

        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            placeholder="ค้นหาโปรเจค"
            prefix={<SearchOutlined />}
            className="w-64"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          <Select
            placeholder="ประเภทโปรเจค"
            className="w-40"
            value={filters.projects.type}
            onChange={(value) => updateFilters("projects", { type: value })}
            allowClear
          >
            <Option value="academic">บทความวิชาการ</Option>
            <Option value="coursework">ผลงานการเรียน</Option>
            <Option value="competition">การแข่งขัน</Option>
          </Select>

          <Select
            placeholder="ปีการศึกษา"
            className="w-32"
            value={filters.projects.year}
            onChange={(value) => updateFilters("projects", { year: value })}
            allowClear
          >
            <Option value="2568">2568</Option>
            <Option value="2567">2567</Option>
            <Option value="2566">2566</Option>
            <Option value="2565">2565</Option>
          </Select>

          <Select
            placeholder="ชั้นปี"
            className="w-28"
            value={filters.projects.studyYear}
            onChange={(value) =>
              updateFilters("projects", { studyYear: value })
            }
            allowClear
          >
            <Option value="ปี 1">ปี 1</Option>
            <Option value="ปี 2">ปี 2</Option>
            <Option value="ปี 3">ปี 3</Option>
            <Option value="ปี 4">ปี 4</Option>
          </Select>

          <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
            ล้างตัวกรอง
          </Button>

          <div className="flex-grow"></div>

          {selectedRows.length > 0 && (
            <Space>
              <Text>{selectedRows.length} รายการที่เลือก</Text>
              <Button
                type="primary"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleBatchOperation("approve")}
                disabled={
                  !selectedRows.some(
                    (id) =>
                      projects.find((p) => p.projectId === id)?.status ===
                      "pending"
                  )
                }
              >
                อนุมัติที่เลือก
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => handleBatchOperation("reject")}
                disabled={
                  !selectedRows.some(
                    (id) =>
                      projects.find((p) => p.projectId === id)?.status ===
                      "pending"
                  )
                }
              >
                ปฏิเสธที่เลือก
              </Button>
            </Space>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="projectId"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
          locale={{
            emptyText: (
              <Result
                status="info"
                title="ไม่พบข้อมูล"
                subTitle="ไม่พบโปรเจคที่ตรงกับเงื่อนไขการค้นหา"
              />
            ),
          }}
        />
      </Card>

      {/* Project Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-purple-600" />
            <span>รายละเอียดโปรเจค</span>
          </div>
        }
        width={720}
        open={detailVisible}
        onClose={closeDetailDrawer}
        footer={
          <div className="flex justify-end">
            <Space>
              <Button onClick={closeDetailDrawer}>ปิด</Button>
              {selectedProject?.status === "pending" && (
                <>
                  <Button
                    type="primary"
                    className="bg-green-600 hover:bg-green-700"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApprove(selectedProject.projectId)}
                    loading={actionLoading}
                  >
                    อนุมัติ
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => showRejectModal(selectedProject)}
                    loading={actionLoading}
                  >
                    ปฏิเสธ
                  </Button>
                </>
              )}
              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณต้องการลบโปรเจคนี้ใช่หรือไม่?"
                onConfirm={() => handleDelete()}
                okText="ใช่"
                cancelText="ไม่"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  ลบ
                </Button>
              </Popconfirm>
            </Space>
          </div>
        }
      >
        {detailLoading ? (
          <div className="flex justify-center items-center h-96">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
            />
          </div>
        ) : selectedProject ? (
          <div>
            <div className="mb-6">
              <Badge.Ribbon
                text={getStatusName(selectedProject.status)}
                color={getStatusColor(selectedProject.status)}
              >
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Title level={4}>{selectedProject.title}</Title>
                  <Space className="mb-2">
                    <Tag
                      color={getCategoryColor(selectedProject.category)}
                      icon={getCategoryIcon(selectedProject.category)}
                    >
                      {getCategoryName(selectedProject.category)}
                    </Tag>
                    <Tag color="default">
                      {selectedProject.level || "ไม่ระบุระดับ"}
                    </Tag>
                    <Tag color="default">
                      ปีการศึกษา {selectedProject.year || "ไม่ระบุ"}
                    </Tag>
                  </Space>
                  <div className="text-sm text-gray-500">
                    สร้างเมื่อ {formatDate(selectedProject.createdAt)}{" "}
                    {formatTime(selectedProject.createdAt)}
                  </div>
                </div>
              </Badge.Ribbon>
            </div>

            <Tabs>
              <TabPane tab="ข้อมูลทั่วไป" key="1">
                <div className="mb-4">
                  <Text strong>คำอธิบาย</Text>
                  <Paragraph className="mt-1 p-4 bg-gray-50 rounded-md">
                    {selectedProject.description || "ไม่มีคำอธิบาย"}
                  </Paragraph>
                </div>

                {selectedProject.tags && (
                  <div className="mb-4">
                    <Text strong>แท็ก</Text>
                    <div className="mt-1">
                      {selectedProject.tags.split(",").map((tag, index) => (
                        <Tag key={index} color="purple" className="mb-1">
                          {tag.trim()}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.authors &&
                  selectedProject.authors.length > 0 && (
                    <div className="mb-4">
                      <Text strong>ผู้จัดทำ</Text>
                      <div className="mt-2">
                        <Row gutter={[16, 16]}>
                          {selectedProject.authors.map((author, index) => (
                            <Col key={index} span={8}>
                              <Card size="small" className="text-center">
                                <Avatar
                                  size={64}
                                  src={author.image}
                                  icon={<UserOutlined />}
                                  className="mb-2"
                                />
                                <div className="font-medium">
                                  {author.fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {author.userId || author.email}
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  )}
              </TabPane>

              <TabPane tab="ไฟล์และรูปภาพ" key="2">
                {selectedProject.files && selectedProject.files.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <Text strong>รูปภาพ</Text>
                      <div className="mt-2">
                        <Row gutter={[16, 16]}>
                          {selectedProject.files
                            .filter((file) => file.fileType === "image")
                            .map((file, index) => (
                              <Col key={index} xs={24} sm={12} md={8}>
                                <Card
                                  hoverable
                                  cover={
                                    <div className="h-40 overflow-hidden">
                                      <img
                                        alt={file.fileName}
                                        src={file.filePath}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  }
                                  actions={[
                                    <Tooltip title="ดูรูปภาพ">
                                      <a
                                        href={file.filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <EyeOutlined key="view" />
                                      </a>
                                    </Tooltip>,
                                    <Tooltip title="ดาวน์โหลด">
                                      <a href={file.filePath} download>
                                        <FileImageOutlined key="download" />
                                      </a>
                                    </Tooltip>,
                                  ]}
                                >
                                  <Card.Meta
                                    title={file.fileName}
                                    description={`อัปโหลดเมื่อ ${formatDate(
                                      file.uploadDate
                                    )}`}
                                  />
                                </Card>
                              </Col>
                            ))}
                        </Row>
                      </div>
                    </div>

                    <Divider />

                    <div className="mb-4">
                      <Text strong>เอกสาร PDF</Text>
                      <div className="mt-2">
                        {selectedProject.files
                          .filter((file) => file.fileType === "pdf")
                          .map((file, index) => (
                            <Card size="small" key={index} className="mb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileTextOutlined className="text-red-500 text-xl mr-2" />
                                  <div>
                                    <div>{file.fileName}</div>
                                    <div className="text-xs text-gray-500">
                                      อัปโหลดเมื่อ {formatDate(file.uploadDate)}
                                    </div>
                                  </div>
                                </div>
                                <Space>
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    href={file.filePath}
                                    target="_blank"
                                  >
                                    ดู
                                  </Button>
                                  <Button
                                    type="link"
                                    icon={<FileTextOutlined />}
                                    href={file.filePath}
                                    download
                                  >
                                    ดาวน์โหลด
                                  </Button>
                                </Space>
                              </div>
                            </Card>
                          ))}

                        {selectedProject.files.filter(
                          (file) => file.fileType === "pdf"
                        ).length === 0 && (
                          <Empty description="ไม่มีเอกสาร PDF" />
                        )}
                      </div>
                    </div>

                    <Divider />

                    <div className="mb-4">
                      <Text strong>วิดีโอ</Text>
                      <div className="mt-2">
                        {selectedProject.files
                          .filter((file) => file.fileType === "video")
                          .map((file, index) => (
                            <Card size="small" key={index} className="mb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <VideoCameraOutlined className="text-blue-500 text-xl mr-2" />
                                  <div>
                                    <div>{file.fileName}</div>
                                    <div className="text-xs text-gray-500">
                                      อัปโหลดเมื่อ {formatDate(file.uploadDate)}
                                    </div>
                                  </div>
                                </div>
                                <Space>
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    href={file.filePath}
                                    target="_blank"
                                  >
                                    ดู
                                  </Button>
                                  <Button
                                    type="link"
                                    icon={<FileTextOutlined />}
                                    href={file.filePath}
                                    download
                                  >
                                    ดาวน์โหลด
                                  </Button>
                                </Space>
                              </div>
                            </Card>
                          ))}

                        {selectedProject.videoLink && (
                          <Card size="small" className="mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <LinkOutlined className="text-blue-500 text-xl mr-2" />
                                <div>
                                  <div>วิดีโอจากลิงก์ภายนอก</div>
                                  <div className="text-xs text-gray-500">
                                    {selectedProject.videoLink}
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="link"
                                icon={<EyeOutlined />}
                                href={selectedProject.videoLink}
                                target="_blank"
                              >
                                ดู
                              </Button>
                            </div>
                          </Card>
                        )}

                        {selectedProject.files.filter(
                          (file) => file.fileType === "video"
                        ).length === 0 &&
                          !selectedProject.videoLink && (
                            <Empty description="ไม่มีวิดีโอ" />
                          )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Empty description="ไม่มีไฟล์แนบ" />
                )}
              </TabPane>

              {selectedProject.category === "academic" &&
                selectedProject.academicPaper && (
                  <TabPane tab="ข้อมูลบทความวิชาการ" key="3">
                    <Card className="mb-4">
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <div className="mb-4">
                            <Text strong>ปีที่ตีพิมพ์</Text>
                            <div>
                              {selectedProject.academicPaper.published_year ||
                                "ไม่ระบุ"}
                            </div>
                          </div>

                          <div className="mb-4">
                            <Text strong>วันที่ตีพิมพ์</Text>
                            <div>
                              {selectedProject.academicPaper.publication_date
                                ? formatDate(
                                    selectedProject.academicPaper
                                      .publication_date
                                  )
                                : "ไม่ระบุ"}
                            </div>
                          </div>
                        </Col>

                        <Col span={12}>
                          <div className="mb-4">
                            <Text strong>สถานที่ตีพิมพ์</Text>
                            <div>
                              {selectedProject.academicPaper
                                .publication_venue || "ไม่ระบุ"}
                            </div>
                          </div>

                          <div className="mb-4">
                            <Text strong>ผู้เขียน</Text>
                            <div>
                              {selectedProject.academicPaper.authors ||
                                "ไม่ระบุ"}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <div>
                        <Text strong>บทคัดย่อ</Text>
                        <Paragraph className="mt-1 p-4 bg-gray-50 rounded-md">
                          {selectedProject.academicPaper.abstract ||
                            "ไม่มีบทคัดย่อ"}
                        </Paragraph>
                      </div>
                    </Card>
                  </TabPane>
                )}

              {selectedProject.category === "competition" &&
                selectedProject.competition && (
                  <TabPane tab="ข้อมูลการแข่งขัน" key="3">
                    <Card className="mb-4">
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <div className="mb-4">
                            <Text strong>ชื่อการแข่งขัน</Text>
                            <div>
                              {selectedProject.competition.competition_name ||
                                "ไม่ระบุ"}
                            </div>
                          </div>

                          <div className="mb-4">
                            <Text strong>ปีที่แข่งขัน</Text>
                            <div>
                              {selectedProject.competition.competition_year ||
                                "ไม่ระบุ"}
                            </div>
                          </div>
                        </Col>

                        <Col span={12}>
                          <div className="mb-4">
                            <Text strong>ระดับการแข่งขัน</Text>
                            <div>
                              {selectedProject.competition.competition_level
                                ? (() => {
                                    switch (
                                      selectedProject.competition
                                        .competition_level
                                    ) {
                                      case "department":
                                        return "ระดับภาควิชา";
                                      case "faculty":
                                        return "ระดับคณะ";
                                      case "university":
                                        return "ระดับมหาวิทยาลัย";
                                      case "national":
                                        return "ระดับประเทศ";
                                      case "international":
                                        return "ระดับนานาชาติ";
                                      default:
                                        return selectedProject.competition
                                          .competition_level;
                                    }
                                  })()
                                : "ไม่ระบุ"}
                            </div>
                          </div>

                          <div className="mb-4">
                            <Text strong>ผลงานที่ได้รับ</Text>
                            <div>
                              {selectedProject.competition.achievement ||
                                "ไม่ระบุ"}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <div>
                        <Text strong>รายชื่อสมาชิกในทีม</Text>
                        <Paragraph className="mt-1 p-4 bg-gray-50 rounded-md">
                          {selectedProject.competition.team_members ||
                            "ไม่ระบุ"}
                        </Paragraph>
                      </div>
                    </Card>
                  </TabPane>
                )}

              {selectedProject.category === "coursework" &&
                selectedProject.coursework && (
                  <TabPane tab="ข้อมูลงานเรียน" key="3">
                    <Card className="mb-4">
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <div className="mb-4">
                            <Text strong>รหัสวิชา</Text>
                            <div>
                              {selectedProject.coursework.course_code ||
                                "ไม่ระบุ"}
                            </div>
                          </div>
                        </Col>

                        <Col span={12}>
                          <div className="mb-4">
                            <Text strong>ชื่อวิชา</Text>
                            <div>
                              {selectedProject.coursework.course_name ||
                                "ไม่ระบุ"}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <div>
                        <Text strong>อาจารย์ผู้สอน</Text>
                        <div>
                          {selectedProject.coursework.instructor || "ไม่ระบุ"}
                        </div>
                      </div>
                    </Card>
                  </TabPane>
                )}

              <TabPane tab="ประวัติการตรวจสอบ" key="4">
                {selectedProject.reviews &&
                selectedProject.reviews.length > 0 ? (
                  <div className="mb-4">
                    <Timeline mode="left">
                      {selectedProject.reviews.map((review, index) => (
                        <Timeline.Item
                          key={index}
                          color={
                            review.status === "approved"
                              ? "green"
                              : review.status === "rejected"
                              ? "red"
                              : "blue"
                          }
                          label={
                            formatDate(review.reviewed_at) +
                            " " +
                            formatTime(review.reviewed_at)
                          }
                        >
                          <Card size="small" className="mb-2">
                            <div>
                              <div className="flex items-center mb-2">
                                <Tag
                                  color={getStatusColor(review.status)}
                                  icon={
                                    review.status === "approved" ? (
                                      <CheckCircleOutlined />
                                    ) : review.status === "rejected" ? (
                                      <CloseCircleOutlined />
                                    ) : null
                                  }
                                >
                                  {getStatusName(review.status)}
                                </Tag>
                                <div className="ml-2">
                                  โดย:{" "}
                                  {review.admin?.username ||
                                    review.admin_id ||
                                    "ไม่ระบุ"}
                                </div>
                              </div>

                              {review.review_comment && (
                                <div className="p-2 bg-gray-50 rounded-md">
                                  {review.review_comment}
                                </div>
                              )}
                            </div>
                          </Card>
                        </Timeline.Item>
                      ))}

                      <Timeline.Item
                        color="blue"
                        label={
                          formatDate(selectedProject.createdAt) +
                          " " +
                          formatTime(selectedProject.createdAt)
                        }
                      >
                        <Card size="small">
                          <div className="flex items-center">
                            <Tag color="blue">สร้างโปรเจค</Tag>
                            <div className="ml-2">
                              โดย:{" "}
                              {selectedProject.author?.fullName ||
                                selectedProject.user_id ||
                                "ไม่ระบุ"}
                            </div>
                          </div>
                        </Card>
                      </Timeline.Item>
                    </Timeline>
                  </div>
                ) : (
                  <Empty description="ไม่มีประวัติการตรวจสอบ" />
                )}
              </TabPane>
            </Tabs>
          </div>
        ) : (
          <Empty description="ไม่พบข้อมูลโปรเจค" />
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center text-red-500">
            <CloseCircleOutlined className="mr-2" />
            <span>ปฏิเสธโปรเจค</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRejectModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={actionLoading}
            onClick={handleReject}
          >
            ปฏิเสธโปรเจค
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rejectReason"
            label="เหตุผลในการปฏิเสธโปรเจค"
            rules={[{ required: true, message: "กรุณาระบุเหตุผลในการปฏิเสธ" }]}
          >
            <TextArea
              rows={4}
              placeholder="ระบุเหตุผลในการปฏิเสธโปรเจค"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Item>
          <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-100">
            <Text type="warning" className="flex items-start">
              <ExclamationCircleOutlined className="mr-2 mt-1" />
              <span>
                หมายเหตุ:
                เหตุผลในการปฏิเสธจะถูกส่งไปให้นักศึกษาที่เป็นเจ้าของโปรเจค
              </span>
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title={
          <div className="flex items-center text-red-500">
            <DeleteOutlined className="mr-2" />
            <span>ยืนยันการลบโปรเจค</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDeleteModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={actionLoading}
            onClick={handleDelete}
          >
            ยืนยันการลบ
          </Button>,
        ]}
      >
        <div className="bg-red-50 p-4 rounded-md mb-4 border border-red-100">
          <div className="flex items-start">
            <ExclamationCircleOutlined className="text-red-500 mt-1 mr-2" />
            <div>
              <Text strong className="text-red-500">
                คำเตือน!
              </Text>
              <div className="text-gray-800">
                การลบโปรเจคจะเป็นการลบข้อมูลทั้งหมดของโปรเจคนี้ออกจากระบบ
                รวมถึงไฟล์ทั้งหมดที่เกี่ยวข้อง
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </div>
            </div>
          </div>
        </div>

        {selectedProject && (
          <div className="mb-4">
            <div className="font-medium mb-2">คุณกำลังจะลบโปรเจคต่อไปนี้:</div>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="font-bold">{selectedProject.title}</div>
              <div className="text-sm">
                ประเภท: {getCategoryName(selectedProject.category)}
              </div>
              <div className="text-sm">
                สร้างโดย: {selectedProject.author?.fullName || "ไม่ระบุ"}
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Text type="danger">โปรดยืนยันว่าคุณต้องการลบโปรเจคนี้</Text>
        </div>
      </Modal>
    </div>
  );
};

export default Project;
