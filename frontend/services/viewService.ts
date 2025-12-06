const API_URL = 'http://localhost:8080/api';

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('protube_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface ReactionResponse {
  likes: number;
  dislikes: number;
  userReaction: string;
}

export const viewService = {
  async incrementView(videoId: number): Promise<{ views: number }> {
    try {
      const response = await fetch(`${API_URL}/videos/${videoId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to increment view count');
      }

      return response.json();
    } catch (error) {
      console.error('Error incrementing view:', error);
      throw error;
    }
  },

  async getReaction(videoId: number): Promise<ReactionResponse> {
    const response = await fetch(`${API_URL}/videos/${videoId}/reaction`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get reaction');
    }

    return response.json();
  },

  async likeVideo(videoId: number): Promise<ReactionResponse> {
    const response = await fetch(`${API_URL}/videos/${videoId}/like`, {
      method: 'POST',
      headers: getAuthHeader(),
    });

    if (response.status === 401) {
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      throw new Error('Failed to like video');
    }

    return response.json();
  },

  async dislikeVideo(videoId: number): Promise<ReactionResponse> {
    const response = await fetch(`${API_URL}/videos/${videoId}/dislike`, {
      method: 'POST',
      headers: getAuthHeader(),
    });

    if (response.status === 401) {
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      throw new Error('Failed to dislike video');
    }

    return response.json();
  },
};
