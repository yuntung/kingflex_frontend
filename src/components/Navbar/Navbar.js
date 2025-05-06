import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUserPlus, faSignOutAlt, faTools } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../auth/AuthContext';
import AuthModal from '../auth/AuthModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState('login');

  // 新增 useEffect 來檢查 user 物件
  useEffect(() => {
    console.log('Current user object:', user);
  }, [user]);

  const handleAuthClick = (mode) => {
    setModalMode(mode);
    setShowAuthModal(true);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleModalClose = () => {
    setShowAuthModal(false);
    setModalMode('login');
  };

  const handleAdminPanelClick = () => {
    console.log('Admin panel clicked, current user:', user);
    if (user && user.role === 'admin') {
      navigate('/admin/products');
    }
  };

  // 檢查 user 是否為有效物件
  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-logo" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
          <img src="/images/logo.svg" alt="Company Logo" />
        </div>
        <div className="navbar-user-section">
          <div className="navbar-user-icons">
            <button className="login-btn" onClick={() => handleAuthClick('login')}>
              <FontAwesomeIcon icon={faSignInAlt} /> Sign In
            </button>
            <button className="signup-btn" onClick={() => handleAuthClick('register')}>
              <FontAwesomeIcon icon={faUserPlus} /> Sign Up
            </button>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal}
          mode={modalMode}
          onClose={handleModalClose}
          onModeChange={setModalMode}
        />
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
        <img src="./images/logo.svg" alt="Company Logo" />
      </div>

      <div className="navbar-user-section">
        <div className="user-info">
          {user.companyName !== null && user.companyName !== undefined && (
            <span className="company-name">
              {user.companyName}
            </span>
          )}
          {user.role === 'admin' && (
            <button 
              className="admin-btn" 
              onClick={handleAdminPanelClick}
            >
              <FontAwesomeIcon icon={faTools} /> Admin Panel
            </button>
          )}
          <button 
            className="logout-btn" 
            onClick={logout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        mode={modalMode}
        onClose={handleModalClose}
        onModeChange={setModalMode}
      />
    </nav>
  );
};

export default Navbar;