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
  List
} from 'antd';
import { 
  SearchOutlined, 
  ProjectOutlined, 
  UserOutlined, 
  TagOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import { useSearch } from '../../hooks';
import ProjectCard from '../../components/Project/ProjectCard';
import FilterPanel from '../../components/common/FilterPanel';
import Pagination from '../../components/common/Pagination';
import { SEARCH } from '../../constants/routes';

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

  // แสดง loading state
  const renderLoading = () => (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Spin size="large" />
      <Text style={{ display: 'block', marginTop: 16 }}>กำลังค้นหา...</Text>
    </div>
  );

  // แสดงข้อความเมื่อไม่พบผลลัพธ์
  const renderEmpty = () => (
    <Empty 
      description="ไม่พบผลลัพธ์ที่ตรงกับการค้นหา" 
      style={{ margin: '40px 0' }}
    />
  );

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  const renderError = () => (
    <Empty 
      description={`เกิดข้อผิดพลาดในการค้นหา: ${error || 'โปรดลองอีกครั้ง'}`} 
      style={{ margin: '40px 0' }}
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
          {searchResults.map((project) => (
            <Col key={project.id} xs={24} sm={12} md={8}>
              <ProjectCard project={project} />
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
        renderItem={user => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  src={user.avatar} 
                  size="large"
                >
                  {user.fullName ? user.fullName.charAt(0) : user.username ? user.username.charAt(0) : '?'}
                </Avatar>
              }
              title={
                <Link to={`/user/${user.id}`}>
                  {user.fullName}
                </Link>
              }
              description={
                <>
                  <Text type="secondary">@{user.username}</Text>
                  {user.bio && <Paragraph ellipsis={{ rows: 2 }}>{user.bio}</Paragraph>}
                </>
              }
            />
          </List.Item>
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
        <Row gutter={[24, 24]}>
          {searchResults.map((project) => (
            <Col key={project.id} xs={24} sm={12} md={8}>
              <ProjectCard project={project} />
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
        <Title level={5}>แท็กยอดนิยม</Title>
        <div>
          {popularTags.map((tag, index) => (
            <Tag
              key={index}
              color="blue"
              style={{ margin: '4px' }}
              onClick={() => {
                searchByTag(tag.name);
                setActiveTab('tags');
                // อัปเดต URL
                const searchParams = new URLSearchParams();
                searchParams.set('tag', tag.name);
                navigate(`${SEARCH.RESULTS}?${searchParams.toString()}`);
              }}
            >
              {tag.name} ({tag.count})
            </Tag>
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
        <Title level={5}>การค้นหายอดนิยม</Title>
        <div>
          {popularSearches.map((item, index) => (
            <Tag
              key={index}
              style={{ margin: '4px', cursor: 'pointer' }}
              onClick={() => {
                handleKeywordChange(item.keyword);
                handleSearch(item.keyword);
              }}
            >
              {item.keyword} ({item.count})
            </Tag>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...style }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          <SearchOutlined style={{ marginRight: 8 }} />
          ค้นหา
        </Title>

        <Search
          placeholder="ค้นหาโปรเจค, ผู้ใช้, หรือแท็ก"
          allowClear
          enterButton="ค้นหา"
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

      {/* ส่วนแสดงผลการค้นหาและตัวกรอง */}
      <Row gutter={24}>
        {/* ตัวกรอง (แสดงเฉพาะในแท็บโปรเจค) */}
        {showFilter && activeTab === 'projects' && (
          <Col xs={24} md={6}>
            <div style={{ marginBottom: 24 }}>
              <Card>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <Title level={5} style={{ margin: 0 }}>ตัวกรอง</Title>
                  <Button 
                    type={showFilterPanel ? 'primary' : 'default'} 
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    size="small"
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
                    {/* รายละเอียดตัวกรองจะถูกเพิ่มเติมที่นี่ */}
                  </FilterPanel>
                )}
              </Card>
            </div>

            {/* แท็กยอดนิยม */}
            {renderPopularTags()}

            {/* การค้นหายอดนิยม */}
            {renderPopularSearches()}
          </Col>
        )}

        {/* ผลลัพธ์การค้นหา */}
        <Col xs={24} md={showFilter && activeTab === 'projects' ? 18 : 24}>
          <Card>
            <Title level={4} style={{ marginBottom: 16 }}>
              ผลการค้นหา {keyword ? `สำหรับ "${keyword}"` : ''}
              {!isSearching && pagination.total > 0 && (
                <Text type="secondary" style={{ fontSize: '1rem', marginLeft: 8 }}>
                  ({pagination.total} รายการ)
                </Text>
              )}
            </Title>

            <Divider style={{ margin: '12px 0 24px 0' }} />

            {/* แสดงผลลัพธ์ตามแท็บที่เลือก */}
            {activeTab === 'projects' && renderProjectResults()}
            {activeTab === 'users' && renderUserResults()}
            {activeTab === 'tags' && renderTagResults()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SearchResults;