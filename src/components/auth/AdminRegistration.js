import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Auth.css';

const AdminRegistration = ({ onVerification, onClose ,onModeChange }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
    companyName: ''
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Password validation
    if(!validatePassword(formData.password)) {
        setError('Password must be at least 8 characters long and contain at least one letter and one number');
        setLoading(false);
        return;
    } 

    if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
    }

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // 確保包含認證信息
            body: JSON.stringify({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                adminCode: formData.adminCode,
                companyName: formData.companyName
            }),
        });

        const data = await response.json();
        console.log('Admin registration response:', data); // 調試用

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // 如果回傳了token，保存它
        if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('Admin token saved');
        }

        if (data.success) {
            if (onModeChange) {
                onModeChange('login');
            }
        } else if (data.requireVerification) {
            onVerification(data.email);
        }
    } catch (err) {
        setError(err.message || 'Failed to register. Please try again.');
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

  const handleBackToLogin = (e) => {
    e.preventDefault();
    onModeChange('register');  
  };

  return (
    <div className="auth-form admin-registration-form">
      <h2>Admin Registration</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            placeholder="Enter username"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter email"
            required
          />
        </div>

        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-input">
            <input
              type={showPassword.password ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('password')}
            >
              <FontAwesomeIcon icon={showPassword.password ? faEye : faEyeSlash} />
            </button>
          </div>
          <small className="hint-text">Password must be at least 8 characters and contain both letters and numbers</small>
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="password-input">
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Confirm password"
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

        <div className="form-group">
          <label>Admin Registration Code</label>
          <input
            type="text"
            value={formData.adminCode}
            onChange={(e) => setFormData({...formData, adminCode: e.target.value})}
            placeholder="Enter admin code"
            required
          />
        </div>

        <button 
          type="submit" 
          className={`submit-button ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register as Admin'}
        </button>

        <div className="auth-switch">
          <button 
            type="button" 
            className="back-button"
            onClick={handleBackToLogin}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminRegistration;