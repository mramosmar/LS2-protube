import React, { useState } from 'react';
import { authService } from '../../services/authService';
import './RegisterStep2.css';

interface RegisterStep2Props {
  username: string;
  email: string;
  onBack: () => void;
  onComplete: () => void;
}

const RegisterStep2: React.FC<RegisterStep2Props> = ({ username, email, onBack, onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pass: string): string[] => {
    const errors: string[] = [];
    if (pass.length < 8) {
      errors.push('Mínim 8 caràcters');
    }
    if (!/[A-Z]/.test(pass)) {
      errors.push('Almenys una majúscula');
    }
    if (!/[a-z]/.test(pass)) {
      errors.push('Almenys una minúscula');
    }
    if (!/[0-9]/.test(pass)) {
      errors.push('Almenys un número');
    }
    return errors;
  };

  const getPasswordStrength = (pass: string): { strength: string; color: string; width: string } => {
    const errors = validatePassword(pass);
    if (!pass) return { strength: '', color: '', width: '0%' };
    if (errors.length === 0) return { strength: 'Forta', color: '#10b981', width: '100%' };
    if (errors.length <= 2) return { strength: 'Mitjana', color: '#f59e0b', width: '66%' };
    return { strength: 'Feble', color: '#ef4444', width: '33%' };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordErrors = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('La contrasenya és obligatòria');
      return;
    }

    const validationErrors = validatePassword(password);
    if (validationErrors.length > 0) {
      setError('La contrasenya no compleix els requisits');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les contrasenyes no coincideixen');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        username,
        email,
        password
      });

      onComplete();
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el registre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2>Crea la teva contrasenya</h2>
      <p className="step-indicator">Pas 2 de 2</p>
      <p className="user-info">
        <strong>{username}</strong> • {email}
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Contrasenya</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contrasenya segura"
              autoFocus
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contrasenya' : 'Mostrar contrasenya'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                />
              </div>
              <span style={{ color: passwordStrength.color, fontSize: '0.85rem' }}>
                {passwordStrength.strength}
              </span>
            </div>
          )}

          <ul className="password-requirements">
            <li className={password.length >= 8 ? 'valid' : ''}>
              {password.length >= 8 ? '✓' : '○'} Mínim 8 caràcters
            </li>
            <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
              {/[A-Z]/.test(password) ? '✓' : '○'} Una majúscula
            </li>
            <li className={/[a-z]/.test(password) ? 'valid' : ''}>
              {/[a-z]/.test(password) ? '✓' : '○'} Una minúscula
            </li>
            <li className={/[0-9]/.test(password) ? 'valid' : ''}>
              {/[0-9]/.test(password) ? '✓' : '○'} Un número
            </li>
          </ul>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirma la contrasenya</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Torna a escriure la contrasenya"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar contrasenya' : 'Mostrar contrasenya'}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <small className="error-hint">Les contrasenyes no coincideixen</small>
          )}
          {confirmPassword && password === confirmPassword && (
            <small className="success-hint">✓ Les contrasenyes coincideixen</small>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="secondary-button">
            Enrere
          </button>
          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Registrant...' : 'Crear compte'}
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterStep2;
