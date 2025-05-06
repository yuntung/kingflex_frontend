import React, { useState, useEffect } from 'react';
import './Auth.css';

const VerifyAccount = ({ email, onVerified, onClose }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/api/auth/verify-email/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                verificationCode
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        if (data.user) {
            onVerified(data.user);
        }
    } catch (err) {
        setError(err.message || 'Verification failed. Please try again.');
    }
};

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // 格式化時間顯示
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-form verify-form">
      <h2>Verify Account</h2>
      <p className="verify-text">Code has been sent to {email}</p>
      <p className="verify-subtext">Enter the code to verify your account.</p>
      
      <form onSubmit={handleVerify}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="6 Digit Code"
            maxLength="6"
            className="verification-input"
          />
        </div>

        <div className="resend-section">
          <span>Didn't Receive Code? </span>
          <button 
            type="button" 
            onClick={handleResendCode}
            disabled={timer > 0 || isResending}
            className="resend-button"
          >
            Resend Code
          </button>
          {timer > 0 && <div className="resend-timer">Resend code in {formatTime(timer)}</div>}
        </div>

        <button type="submit" className="verify-button">
          Verify Account
        </button>
      </form>
    </div>
  );
};

export default VerifyAccount;