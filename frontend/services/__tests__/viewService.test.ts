import '@testing-library/jest-dom';
import { viewService } from '../viewService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('viewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('incrementView', () => {
    test('successfully increments view count', async () => {
      const mockResponse = { views: 100 };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await viewService.incrementView(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/videos/1/view',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('throws error when increment view fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(viewService.incrementView(1)).rejects.toThrow('Failed to increment view count');
    });

    test('throws error and logs when network error occurs', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(viewService.incrementView(1)).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error incrementing view:', networkError);
    });
  });

  describe('getReaction', () => {
    test('successfully gets reaction without auth token', async () => {
      const mockResponse = { likes: 10, dislikes: 2, userReaction: 'none' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await viewService.getReaction(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/videos/1/reaction',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('successfully gets reaction with auth token', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');
      const mockResponse = { likes: 10, dislikes: 2, userReaction: 'like' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await viewService.getReaction(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/videos/1/reaction',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('throws error when get reaction fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(viewService.getReaction(1)).rejects.toThrow('Failed to get reaction');
    });
  });

  describe('likeVideo', () => {
    test('successfully likes video', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');
      const mockResponse = { likes: 11, dislikes: 2, userReaction: 'like' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await viewService.likeVideo(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/videos/1/like',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('throws authentication error when not authenticated', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(viewService.likeVideo(1)).rejects.toThrow('Authentication required');
    });

    test('throws error when like fails with other status', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(viewService.likeVideo(1)).rejects.toThrow('Failed to like video');
    });
  });

  describe('dislikeVideo', () => {
    test('successfully dislikes video', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');
      const mockResponse = { likes: 10, dislikes: 3, userReaction: 'dislike' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await viewService.dislikeVideo(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/videos/1/dislike',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('throws authentication error when not authenticated', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(viewService.dislikeVideo(1)).rejects.toThrow('Authentication required');
    });

    test('throws error when dislike fails with other status', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(viewService.dislikeVideo(1)).rejects.toThrow('Failed to dislike video');
    });
  });
});
