import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import VerifyAccount from './VerifyAccount';
import AdminRegistration from './AdminRegistration';
import { useAuth } from '../auth/AuthContext';  
import './Auth.css';

const AuthModal = ({ isOpen, mode: initialMode, onClose, onModeChange }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const resetState = () => {
    setEmail('');
    setMode(initialMode);
  };

  const handleClose = (newMode) => {
    if (newMode) {
      handleModeChange(newMode);
    } else {
      onClose();
      resetState();
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleVerification = (userEmail) => {
    if (!userEmail) {
      console.error('No email provided for verification');
      return;
    }
    setEmail(userEmail);
    handleModeChange('verify');
  };

  const handleForgotPassword = () => {
    handleModeChange('forgot');
  };

  const handleCodeSent = (userEmail) => {
    setEmail(userEmail);
    handleModeChange('reset');
  };

  const handleBackToLogin = () => {
    handleModeChange('login');
  };

  const handleRegistrationSuccess = (userData) => {
    if (userData) {
      login(userData);
    }
    handleClose();
  };

  const renderContent = () => {
    const commonProps = {
      onClose: handleClose,
      onModeChange: handleModeChange,
    };
    switch (mode) {
      case 'login':
        return (
          <LoginForm 
            {...commonProps}
            onForgotPassword={handleForgotPassword}
            onVerification={handleVerification}
          />
        );
      case 'register':
        return (
          <RegisterForm 
            {...commonProps}
            onVerification={handleVerification}
          />
        );
      case 'admin-register':
        return (
          <AdminRegistration 
            {...commonProps}
            onVerification={handleVerification}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      case 'verify':
        return (
          <VerifyAccount 
            email={email} 
            onVerified={handleRegistrationSuccess}
            onBack={handleBackToLogin}
            onModeChange={handleModeChange}
          />
        );
      case 'forgot':
        return (
          <ForgotPassword 
            onCodeSent={handleCodeSent}
            onBack={handleBackToLogin}
            onModeChange={handleModeChange}
          />
        );
      case 'reset':
        return (
          <ResetPassword 
            email={email} 
            onReset={handleClose}
            onBack={handleBackToLogin}
            onModeChange={handleModeChange}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={() => handleClose()}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AuthModal;