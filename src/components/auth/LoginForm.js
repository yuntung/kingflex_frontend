import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Auth.css';

export const LoginForm = ({ onClose, onForgotPassword, onVerification }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // 重要: 需要包含認證信息
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            // 如果用戶未驗證，轉到驗證頁面
            if (data.requireVerification) {
                onVerification(data.email);
                return;
            }
            throw new Error(data.message);
        }

        // 檢查並顯示data內容，調試用
        console.log('Login response data:', data);
        
        // 確保從響應中獲取token（如果有）
        if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('Token已保存');
        }

        login(data.user);
        onClose();
    } catch (err) {
        setError(err.message || 'Login failed. Please try again.');
    } finally {
        setIsLoading(false);
    }
};

  const handleSwitchToRegister = () => {
    onClose('register'); // 修改這裡，傳入 'register' 參數
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@gmail.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter Your Password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
          </div>
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember Me</span>
          </label>
          <button 
            type="button" 
            className="forgot-password-link"
            onClick={onForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        <button 
          type="submit" 
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="auth-switch">
          Don't have an account? 
          <button 
            type="button" 
            onClick={handleSwitchToRegister}
            className="switch-button"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;