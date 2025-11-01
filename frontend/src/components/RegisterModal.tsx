import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import './RegisterModal.css';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const validateForm = (username: string, email: string, password: string) => {
    if (!username.trim()) {
      throw new Error('El nombre de usuario es obligatorio');
    }
    if (!email.trim()) {
      throw new Error('El email es obligatorio');
    }
    if (!password) {
      throw new Error('La contraseña es obligatoria');
    }
    if (username.trim().length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const username = (form.elements.namedItem('username') as HTMLInputElement).value;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;

      // Validate form before sending to backend
      validateForm(username, email, password);

      await authService.register({
        username: username.trim(),
        email: email.trim(),
        password
      });
      onSwitchToLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose} aria-label="Cerrar">×</button>
        <h2>Registro</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario *</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              minLength={3}
              placeholder="Nombre de usuario"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              placeholder="Contraseña"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
          <div className="separator">o</div>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="secondary-button"
          >
            Ya tengo cuenta
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

export default RegisterModal;