import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Auth.css';

const ResetPassword = ({ email, onReset, onBack }) => {
  const [formData, setFormData] = useState({
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 驗證密碼匹配
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // 驗證密碼長度
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    
    try {
      // 修改驗證碼驗證的 API 路徑
      const verifyResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetCode: formData.resetCode
        }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.message || 'Invalid reset code');
      }

      // 修改重置密碼的 API 路徑
      const resetResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetCode: formData.resetCode,
          newPassword: formData.newPassword
        }),
      });

      const resetData = await resetResponse.json();
      
      if (!resetResponse.ok) {
        throw new Error(resetData.message || 'Failed to reset password');
      }

      onReset();
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="auth-form reset-form">
      <h2>Reset Password</h2>
      <p className="reset-text">Please enter the code sent to your email and create a new password.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Reset Code</label>
          <input
            type="text"
            value={formData.resetCode}
            onChange={(e) => setFormData({...formData, resetCode: e.target.value})}
            placeholder="Enter 6-digit code"
            required
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <div className="password-input">
            <input
              type={showPassword.newPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('newPassword')}
            >
              <FontAwesomeIcon icon={showPassword.newPassword ? faEye : faEyeSlash} />
            </button>
          </div>
          <small className="hint-text">Must be at least 8 characters</small>
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="password-input">
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirmPassword')}
            >
              <FontAwesomeIcon icon={showPassword.confirmPassword ? faEye : faEyeSlash} />
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className={`submit-button ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div className="auth-switch">
          <button 
            type="button" 
            className="back-button"
            onClick={onBack}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;