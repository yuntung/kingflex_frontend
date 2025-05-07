import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 新增: 保存登入狀態到 localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  // 修改: 移除 current-user 檢查，改用 localStorage
  const login = (userData) => {
    console.log('Login called with:', userData);
    if (userData && userData.id) {
        const formattedUser = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            companyName: userData.companyName || '',
            role: userData.role || 'user'
        };
        setUser(formattedUser);
        // 保存到 localStorage
        localStorage.setItem('user', JSON.stringify(formattedUser));
        
        // 增加日誌，檢查用戶角色
        console.log('User role set to:', formattedUser.role);
    }
};

  const logout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      console.log('Logout response:', response.status);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除 localStorage
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};