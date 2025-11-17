// frontend/services/authService.ts

interface UserLoginDTO {
  email: string;
  password: string;
}

interface UserRegistrationDTO {
  username: string;
  email: string;
  password: string;
}

interface UserDTO {
  id: string;
  username: string;
  email: string;
  token?: string;
  // add other user properties as needed
}

const API_URL = 'http://localhost:8080/api'; // adjust to match your backend URL
const USER_STORAGE_KEY = 'protube_user';
const TOKEN_STORAGE_KEY = 'protube_token';

export const authService = {
  async login(data: UserLoginDTO): Promise<UserDTO> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }

    // Save user data and token to localStorage
    if (result.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result));
    return result;
  },

  async register(data: UserRegistrationDTO): Promise<UserDTO> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    // Save user data and token to localStorage
    if (result.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result));
    return result;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove user data and token from localStorage
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  getCurrentUser(): UserDTO | null {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};
