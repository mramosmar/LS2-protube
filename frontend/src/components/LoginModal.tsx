// src/components/LoginModal.tsx
import React, { useEffect, useState } from 'react';
import './LoginModal.css';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
  setShowRegisterModal: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, setShowRegisterModal }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    if (isRegistering) {
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      console.log('Register:', { username, password, email });
    } else {
      onLogin(username, password);
    }
  };

  return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-content">
          <button className="close-button" onClick={onClose} aria-label="Cerrar">×</button>
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
            <div className="separator">o</div>
            <button
                type="button"
                onClick={setShowRegisterModal}
                className="secondary-button"  // Changed from register-link
            >
              Regístrate
            </button>
            <div className="separator">o</div>
            <button
                type="button"
                className="google-login-button"
                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            >
              <i className="google-icon"></i>
              Iniciar sesión con Google
            </button>
          </form>
        </div>
      </div>
  );
};

export default LoginModal;