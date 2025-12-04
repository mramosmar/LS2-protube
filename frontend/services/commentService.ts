const API_URL = 'http://localhost:8080/api';

export const commentService = {
  async addComment(videoId: number, content: string): Promise<void> {
    const token = localStorage.getItem('protube_token');

    if (!token) {
      throw new Error('User must be authenticated to comment');
    }

    const response = await fetch(`${API_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add comment');
    }

    return response.json();
  },
};
