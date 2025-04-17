import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Input, 
  Button, 
  Card, 
  Divider, 
  Spin, 
  Empty, 
  Tabs,
  Space,
  Tag,
  Avatar,
  List,
  Badge,
  Tooltip,
  Result
} from 'antd';
import { 
  SearchOutlined, 
  ProjectOutlined, 
  UserOutlined, 
  TagOutlined,
  FilterOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
  RocketOutlined,
  FireOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSearch } from '../../hooks';
import ProjectCard from '../../components/Project/ProjectCard';
import FilterPanel from '../../components/common/FilterPanel';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { SEARCH } from '../../constants/routes';
import { colors, spaceTheme } from '../../config/themeConfig';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

/**
 * SearchResults component ใช้สำหรับแสดงผลการค้นหา
 * 
 * @param {Object} props - Props ของ component
 * @param {string} props.defaultTab - แท็บเริ่มต้น ('projects', 'users', 'tags')
 * @param {boolean} props.showFilter - แสดงตัวกรองหรือไม่
 * @param {Object} props.style - Custom style สำหรับ component
 * @returns {JSX.Element} SearchResults component
 */
const SearchResults = ({
  defaultTab = 'projects',
  showFilter = true,
  style
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // เรียกใช้ hook เพื่อจัดการการค้นหา
  const { 
    searchResults,
    isSearching,
    error,
    keyword,
    suggestions,
    popularTags,
    popularSearches,
    searchHistory,
    pagination,
    advancedFilters,
    searchProjects,
    searchUsers,
    searchByTag,
    advancedSearch,
    changePage,
    handleKeywordChange,
    submitSearch,
    updateAdvancedFilters,
    clearAdvancedFilters,
  } = useSearch();

  // ดึงพารามิเตอร์การค้นหาจาก URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryKeyword = searchParams.get('keyword');
    const queryTab = searchParams.get('tab');
    const queryTag = searchParams.get('tag');
    
    // อัปเดต keyword ถ้ามีใน URL
    if (queryKeyword) {
      handleKeywordChange(queryKeyword);
    }

    // อัปเดตแท็บที่เลือกถ้ามีใน URL
    if (queryTab && ['projects', 'users', 'tags'].includes(queryTab)) {
      setActiveTab(queryTab);
    }

    // ถ้ามี tag ให้ค้นหาตาม tag
    if (queryTag) {
      searchByTag(queryTag);
      setActiveTab('tags');
    } 
    // ถ้ามี keyword ให้ค้นหาตาม keyword
    else if (queryKeyword) {
      if (activeTab === 'projects') {
        searchProjects(queryKeyword);
      } else if (activeTab === 'users') {
        searchUsers(queryKeyword);
      }
    }
  }, [location.search]);

  // ฟังก์ชันสำหรับการเปลี่ยนแท็บ
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    
    // อัปเดต URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tabKey);
    navigate(`${SEARCH.RESULTS}?${searchParams.toString()}`);
    
    // ค้นหาข้อมูลตามแท็บที่เลือก
    if (keyword) {
      if (tabKey === 'projects') {
        searchProjects(keyword);
      } else if (tabKey === 'users') {
        searchUsers(keyword);
      } else if (tabKey === 'tags') {
        // ถ้าเป็นแท็บ tags แต่ไม่ได้มาจากการคลิกที่ tag 
        // ให้ค้นหาโปรเจคที่มี tag ตรงกับ keyword
        searchByTag(keyword);
      }
    }
  };

  // ฟังก์ชันสำหรับการค้นหา
  const handleSearch = (value) => {
    if (!value || value.trim() === '') return;
    
    // อัปเดต URL
    const searchParams = new URLSearchParams();
    searchParams.set('keyword', value);
    searchParams.set('tab', activeTab);
    navigate(`${SEARCH.RESULTS}?${searchParams.toString()}`);
    
    // ค้นหาข้อมูลตามแท็บที่เลือก
    if (activeTab === 'projects') {
      searchProjects(value);
    } else if (activeTab === 'users') {
      searchUsers(value);
    } else if (activeTab === 'tags') {
      searchByTag(value);
    }
  };

  // ฟังก์ชันสำหรับการเปลี่ยนหน้า
  const handlePageChange = (page, size) => {
    changePage(page, size);
    
    // ค้นหาข้อมูลตามแท็บที่เลือกพร้อมกับหน้าที่เปลี่ยน
    if (activeTab === 'projects') {
      searchProjects(keyword, { page, limit: size });
    } else if (activeTab === 'users') {
      searchUsers(keyword, size);
    } else if (activeTab === 'tags') {
      searchByTag(keyword, { page, limit: size });
    }
  };

  // ฟังก์ชันสำหรับการกรองโปรเจค
  const handleFilter = (filters) => {
    updateAdvancedFilters(filters);
    advancedSearch(filters);
  };

  // ฟังก์ชันสำหรับการรีเซ็ตตัวกรอง
  const handleResetFilter = () => {
    clearAdvancedFilters();
    searchProjects(keyword);
  };

  // ฟังก์ชันสำหรับการกดที่แท็ก
  const handleTagClick = (tag) => {
    searchByTag(tag);
    setActiveTab('tags');
    
    // อัปเดต URL
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tag);
    searchParams.set('tab', 'tags');
    navigate(`${SEARCH.RESULTS}?${searchParams.toString()}`);
  };

  // แสดง loading state
  const renderLoading = () => (
    <LoadingSpinner tip="กำลังค้นหา..." />
  );

  // แสดงข้อความเมื่อไม่พบผลลัพธ์
  const renderEmpty = () => (
    <Result
      icon={<SearchOutlined style={{ color: colors.primary }} />}
      title="ไม่พบผลลัพธ์ที่ตรงกับการค้นหา"
      subTitle={keyword ? `ไม่พบข้อมูลที่ตรงกับ "${keyword}" กรุณาลองใช้คำค้นหาอื่น` : 'กรุณาระบุคำค้นหา'}
      extra={
        <Space direction="vertical" align="center">
          <Text>ลองค้นหาด้วยคำอื่น หรือใช้ตัวกรองเพื่อปรับปรุงผลลัพธ์</Text>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => navigate(SEARCH.ADVANCED)}
          >
            ค้นหาขั้นสูง
          </Button>
        </Space>
      }
    />
  );

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  const renderError = () => (
    <ErrorMessage
      title="เกิดข้อผิดพลาดในการค้นหา"
      message={error || 'โปรดลองอีกครั้งในภายหลัง'}
      showBackButton={false}
      showHomeButton={true}
      showReloadButton={true}
      onReloadClick={() => {
        if (activeTab === 'projects') {
          searchProjects(keyword);
        } else if (activeTab === 'users') {
          searchUsers(keyword);
        } else if (activeTab === 'tags') {
          searchByTag(keyword);
        }
      }}
    />
  );

  // แสดงผลลัพธ์การค้นหาโปรเจค
  const renderProjectResults = () => {
    if (isSearching) return renderLoading();
    if (error) return renderError();
    if (!searchResults || searchResults.length === 0) return renderEmpty();

    return (
      <>
        <Row gutter={[24, 24]}>
          {searchResults.map((project, index) => (
            <Col key={project.id} xs={24} sm={12} md={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handlePageChange}
            style={{ marginTop: 40 }}
          />
        )}
      </>
    );
  };

  // แสดงผลลัพธ์การค้นหาผู้ใช้
  const renderUserResults = () => {
    if (isSearching) return renderLoading();
    if (error) return renderError();
    if (!searchResults || searchResults.length === 0) return renderEmpty();

    return (
      <List
        itemLayout="horizontal"
        dataSource={searchResults}
        renderItem={(user, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card 
              hoverable 
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: 16 }}
            >
              <List.Item style={{ padding: 0 }}>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={user.avatar} 
                      size={64}
                      style={{ border: `2px solid ${colors.primary}` }}
                    >
                      {user.fullName ? user.fullName.charAt(0) : user.username ? user.username.charAt(0) : '?'}
                    </Avatar>
                  }
                  title={
                    <Link to={`/user/${user.id}`} style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                      {user.fullName}
                    </Link>
                  }
                  description={
                    <>
                      <Text type="secondary" style={{ display: 'block' }}>@{user.username}</Text>
                      {user.role && (
                        <Tag color="blue" style={{ marginTop: 4, marginBottom: 8 }}>
                          {user.role}
                        </Tag>
                      )}
                      {user.bio && (
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                          {user.bio}
                        </Paragraph>
                      )}
                      {user.projectCount > 0 && (
                        <Text type="secondary">
                          มีโปรเจคทั้งหมด {user.projectCount} โปรเจค
                        </Text>
                      )}
                    </>
                  }
                />
                <Button 
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  shape="circle"
                  onClick={() => navigate(`/user/${user.id}`)}
                />
              </List.Item>
            </Card>
          </motion.div>
        )}
        pagination={{
          onChange: handlePageChange,
          pageSize: pagination.pageSize,
          total: pagination.total,
          current: pagination.current,
        }}
      />
    );
  };

  // แสดงผลลัพธ์การค้นหาแท็ก
  const renderTagResults = () => {
    if (isSearching) return renderLoading();
    if (error) return renderError();
    if (!searchResults || searchResults.length === 0) return renderEmpty();

    // กรณีค้นหาด้วยแท็ก ผลลัพธ์จะเป็นโปรเจค
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <Tag color="blue" style={{ padding: '4px 8px', fontSize: 16 }}>
            <TagOutlined /> #{location.search.includes('tag=') ? new URLSearchParams(location.search).get('tag') : keyword}
          </Tag>
          {searchResults.length > 0 && (
            <Text style={{ marginLeft: 8 }}>
              พบ {searchResults.length} โปรเจค
            </Text>
          )}
        </div>

        <Row gutter={[24, 24]}>
          {searchResults.map((project, index) => (
            <Col key={project.id} xs={24} sm={12} md={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handlePageChange}
            style={{ marginTop: 40 }}
          />
        )}
      </>
    );
  };

  // แสดงแท็กยอดนิยม
  const renderPopularTags = () => {
    if (!popularTags || popularTags.length === 0) return null;

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TagOutlined style={{ color: colors.primary }} /> แท็กยอดนิยม
        </Title>
        <div>
          {popularTags.map((tag, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              style={{ display: 'inline-block' }}
              whileHover={{ scale: 1.05 }}
            >
              <Tag
                color="blue"
                style={{ margin: '4px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name} 
                <Badge 
                  count={tag.count} 
                  style={{ 
                    backgroundColor: colors.secondary,
                    marginLeft: 5,
                    boxShadow: 'none'
                  }} 
                />
              </Tag>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // แสดงการค้นหายอดนิยม
  const renderPopularSearches = () => {
    if (!popularSearches || popularSearches.length === 0) return null;

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ color: '#f5222d' }} /> การค้นหายอดนิยม
        </Title>
        <div>
          {popularSearches.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              style={{ display: 'inline-block' }}
              whileHover={{ scale: 1.05 }}
            >
              <Tag
                style={{ margin: '4px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => {
                  handleKeywordChange(item.keyword);
                  handleSearch(item.keyword);
                }}
              >
                {item.keyword} 
                <Badge 
                  count={item.count} 
                  style={{ 
                    backgroundColor: colors.primary,
                    marginLeft: 5,
                    boxShadow: 'none'
                  }} 
                />
              </Tag>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...style }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          style={{ 
            marginBottom: 24,
            ...spaceTheme.glassCard,
            background: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          <Title level={3} style={{ marginBottom: 16, color: colors.primary }}>
            <SearchOutlined style={{ marginRight: 8 }} />
            ค้นหา
          </Title>

          <Search
            placeholder="ค้นหาโปรเจค, ผู้ใช้, หรือแท็ก"
            allowClear
            enterButton={
              <Button
                type="primary"
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                  borderColor: 'transparent'
                }}
              >
                <SearchOutlined /> ค้นหา
              </Button>
            }
            size="large"
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            onSearch={handleSearch}
            loading={isSearching}
            style={{ marginBottom: 16 }}
          />

          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane 
              tab={
                <span>
                  <ProjectOutlined /> โปรเจค
                </span>
              } 
              key="projects" 
            />
            <TabPane 
              tab={
                <span>
                  <UserOutlined /> ผู้ใช้
                </span>
              } 
              key="users" 
            />
            <TabPane 
              tab={
                <span>
                  <TagOutlined /> แท็ก
                </span>
              } 
              key="tags" 
            />
          </Tabs>
        </Card>
      </motion.div>

      {/* ส่วนแสดงผลการค้นหาและตัวกรอง */}
      <Row gutter={24}>
        {/* ตัวกรอง (แสดงเฉพาะในแท็บโปรเจค) */}
        {showFilter && activeTab === 'projects' && (
          <Col xs={24} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                style={{ 
                  marginBottom: 24,
                  ...spaceTheme.glassCard,
                  background: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <Title level={5} style={{ margin: 0, color: colors.primary }}>
                    <FilterOutlined style={{ marginRight: 8 }} /> 
                    ตัวกรอง
                  </Title>
                  <Button 
                    type={showFilterPanel ? 'primary' : 'default'} 
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    size="small"
                    style={showFilterPanel ? {
                      background: colors.primary,
                      borderColor: colors.primary
                    } : {}}
                  >
                    {showFilterPanel ? 'ซ่อน' : 'แสดง'}
                  </Button>
                </div>

                {showFilterPanel && (
                  <FilterPanel
                    activeFilters={advancedFilters}
                    onClearFilters={handleResetFilter}
                    onRemoveFilter={(key) => {
                      const newFilters = { ...advancedFilters };
                      delete newFilters[key];
                      handleFilter(newFilters);
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>ประเภทโปรเจค</Text>
                        <Select 
                          placeholder="เลือกประเภทโปรเจค" 
                          style={{ width: '100%', marginTop: 8 }} 
                          allowClear
                          onChange={(value) => handleFilter({ ...advancedFilters, type: value })}
                          value={advancedFilters.type}
                          options={PROJECT_TYPES.map(type => ({
                            value: type.value,
                            label: `${type.emoji} ${type.label}`
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Text strong>ปีของโปรเจค</Text>
                        <Select 
                          placeholder="เลือกปีของโปรเจค" 
                          style={{ width: '100%', marginTop: 8 }} 
                          allowClear
                          onChange={(value) => handleFilter({ ...advancedFilters, year: value })}
                          value={advancedFilters.year}
                        />
                      </div>
                      
                      <div>
                        <Text strong>ชั้นปีของผู้สร้าง</Text>
                        <Select 
                          placeholder="เลือกชั้นปีของผู้สร้าง" 
                          style={{ width: '100%', marginTop: 8 }} 
                          allowClear
                          onChange={(value) => handleFilter({ ...advancedFilters, studyYear: value })}
                          value={advancedFilters.studyYear}
                        />
                      </div>
                      
                      <div>
                        <Text strong>แท็ก</Text>
                        <Select
                          mode="tags"
                          placeholder="เลือกหรือเพิ่มแท็ก"
                          style={{ width: '100%', marginTop: 8 }}
                          onChange={(value) => handleFilter({ ...advancedFilters, tags: value })}
                          value={advancedFilters.tags}
                          tokenSeparators={[',']}
                        />
                      </div>
                      
                      <div style={{ marginTop: 16 }}>
                        <Button 
                          icon={<ReloadOutlined />} 
                          onClick={handleResetFilter}
                          block
                        >
                          รีเซ็ตตัวกรอง
                        </Button>
                      </div>
                    </Space>
                  </FilterPanel>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* แท็กยอดนิยม */}
              <Card 
                style={{ 
                  marginBottom: 24,
                  ...spaceTheme.glassCard,
                  background: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {renderPopularTags()}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {/* การค้นหายอดนิยม */}
              <Card 
                style={{ 
                  marginBottom: 24,
                  ...spaceTheme.glassCard,
                  background: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {renderPopularSearches()}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              style={{ marginTop: 24 }}
            >
              <Button 
                type="primary" 
                icon={<FilterOutlined />} 
                block
                size="large"
                onClick={() => navigate(SEARCH.ADVANCED)}
                style={{ 
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                  borderColor: 'transparent'
                }}
              >
                ค้นหาขั้นสูง
              </Button>
            </motion.div>
          </Col>
        )}

        {/* ผลลัพธ์การค้นหา */}
        <Col xs={24} md={showFilter && activeTab === 'projects' ? 18 : 24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              style={{ 
                ...spaceTheme.glassCard,
                background: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
                ผลการค้นหา {keyword ? `สำหรับ "${keyword}"` : ''}
                {!isSearching && pagination.total > 0 && (
                  <Text type="secondary" style={{ fontSize: '1rem', marginLeft: 8 }}>
                    ({pagination.total} รายการ)
                  </Text>
                )}
              </Title>

              <Divider style={{ margin: '12px 0 24px 0', borderColor: `${colors.primary}20` }} />

              {/* แสดงผลลัพธ์ตามแท็บที่เลือก */}
              {activeTab === 'projects' && renderProjectResults()}
              {activeTab === 'users' && renderUserResults()}
              {activeTab === 'tags' && renderTagResults()}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default SearchResults;