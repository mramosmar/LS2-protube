// src/services/videoService.ts
import axiosInstance from '../api/axiosConfig';

export const fetchVideos = async () => {
    try {
        const response = await axiosInstance.get('/videos');
        return response.data;
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw new Error('No se puede conectar al servidor');
    }
};