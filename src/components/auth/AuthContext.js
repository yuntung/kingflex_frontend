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
        
        // 新增: 從響應中提取token並保存
        if (userData.token) {
            localStorage.setItem('token', userData.token);
            console.log('Token已保存到localStorage');
        } else {
            console.warn('警告: 登入響應中沒有token');
        }
        
        setUser(formattedUser);
        // 保存到 localStorage
        localStorage.setItem('user', JSON.stringify(formattedUser));
        console.log('用戶角色設置為:', formattedUser.role);
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
      // 清除 localStorage 中的所有認證相關項目
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // 新增: 確保清除token
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