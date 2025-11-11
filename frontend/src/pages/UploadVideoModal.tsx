import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import './UploadVideoModal.css';

interface UploadVideoModalProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ onClose, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
      // Clean up preview URLs
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Solo verificar que sea .mp4
      if (!file.name.toLowerCase().endsWith('.mp4')) {
        setError('Por favor, selecciona un archivo .mp4');
        return;
      }
      setVideoFile(file);
      setError('');
      
      // Create preview
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Solo verificar que sea .png
      if (!file.name.toLowerCase().endsWith('.png')) {
        setError('Por favor, selecciona un archivo .png');
        return;
      }
      setThumbnailFile(file);
      setError('');
      
      // Create preview
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      setError('Por favor, selecciona un video');
      return;
    }
    if (!thumbnailFile) {
      setError('Por favor, selecciona una miniatura');
      return;
    }
    if (!title.trim()) {
      setError('Por favor, ingresa un título');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, ingresa una descripción');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('thumbnail', thumbnailFile);
      formData.append('title', title);
      formData.append('description', description);

      const token = authService.getToken();
      
      // Debug: Log si hay token
      console.log('Token disponible:', token ? 'Sí' : 'No');
      console.log('Usuario autenticado:', authService.isAuthenticated());
      
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        setError('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
        setIsLoading(false);
        return;
      }

      console.log('Enviando petición de upload...');
      const response = await fetch('http://localhost:8080/api/videos/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: headers,
      });

      console.log('Respuesta recibida:', response.status);

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: `Error ${response.status}: ${response.statusText}` }));
        throw new Error(result.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Error al subir video:', err);
      setError(err instanceof Error ? err.message : 'Error al subir el video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}>
      <div className="modal-content upload-modal">
        <button className="close-button" onClick={onClose} aria-label="Cerrar" disabled={isLoading}>
          ×
        </button>
        <h2>Subir Video</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="video">Video (solo .mp4) *</label>
              <input
                type="file"
                id="video"
                accept=".mp4"
                onChange={handleVideoChange}
                required
                disabled={isLoading}
              />
              {videoPreview && (
                <div className="video-preview">
                  <video src={videoPreview} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">Miniatura (solo .png) *</label>
              <input
                type="file"
                id="thumbnail"
                accept=".png"
                onChange={handleThumbnailChange}
                required
                disabled={isLoading}
              />
              {thumbnailPreview && (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título del video"
              required
              maxLength={100}
              disabled={isLoading}
            />
            <span className="char-count">{title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu video"
              required
              maxLength={500}
              rows={4}
              disabled={isLoading}
            />
            <span className="char-count">{description.length}/500</span>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="secondary-button"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? 'Subiendo...' : 'Subir Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideoModal;
