import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  // 處理載入狀態
  if (loading) {
    return <div>Loading...</div>;
  }

  // 未登入時導向首頁
  if (!user) {
    console.log('User not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // 檢查管理員權限
  if (adminOnly && user.role !== 'admin') {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // 通過所有檢查，顯示保護的路由內容
  console.log('Access granted', { role: user.role, adminOnly });
  return children;
};

export default PrivateRoute;