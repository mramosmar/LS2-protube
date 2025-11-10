import React, { useEffect, useState } from 'react';
import RegisterStep1 from '../pages/RegisterStep1';
import RegisterStep2 from '../pages/RegisterStep2';
import './RegisterModal.css';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({ username: '', email: '' });

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleStep1Complete = (username: string, email: string) => {
    setUserData({ username, email });
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleRegistrationComplete = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose} aria-label="Tancar">
          ×
        </button>
        {step === 1 ? (
          <RegisterStep1 onNext={handleStep1Complete} onSwitchToLogin={onSwitchToLogin} />
        ) : (
          <RegisterStep2
            username={userData.username}
            email={userData.email}
            onBack={handleBackToStep1}
            onComplete={handleRegistrationComplete}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterModal;
