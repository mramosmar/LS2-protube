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
  // add other user properties as needed
}

const API_URL = 'http://localhost:8080/api'; // adjust to match your backend URL

export const authService = {
    async login(data: UserLoginDTO): Promise<UserDTO> {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Login failed');
        }
        return result;
    },

    async register(data: UserRegistrationDTO): Promise<UserDTO> {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Registration failed');
        }
        return result;
    }
};