import { authService } from './authService';

const API_URL = 'http://localhost:8080/api';

export interface CommentDTO {
  content: string;
  videoId: number;
}

export interface Comment {
  id: number;
  content: string;
  user: string | { username: string };
}

export const commentService = {
  async addComment(videoId: number, content: string): Promise<Comment> {
    const token = authService.getToken();

    if (!token) {
      throw new Error('No estás autenticado. Por favor, inicia sesión.');
    }

    const response = await fetch(`${API_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Error al añadir comentario');
    }

    return response.json();
  },
};
