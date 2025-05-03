import React from 'react';
import { BarChartOutlined } from '@ant-design/icons';
import PageTitle from '../../components/common/PageTitle';
import UserStats from '../../components/users/UserStats';
import useUser from '../../hooks/useUser';

const UserStatsPage = () => {
  const {
    stats,
    loading,
    error,
    refreshUserStats
  } = useUser('all', 'stats');

  return (
    <div>
      <PageTitle
        title="สถิติผู้ใช้"
        subtitle="ภาพรวมสถิติผู้ใช้ในระบบทั้งหมด"
        icon={<BarChartOutlined />}
      />
      
      <UserStats
        stats={stats}
        loading={loading}
        error={error}
        onRefresh={refreshUserStats}
      />
    </div>
  );
};

export default UserStatsPage;