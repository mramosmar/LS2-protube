import '@testing-library/jest-dom';
import { commentService } from '../commentService';

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

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    test('throws error when user is not authenticated', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await expect(commentService.addComment(1, 'Test comment')).rejects.toThrow(
        'User must be authenticated to comment'
      );
    });

    test('successfully adds comment when authenticated', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');
      const mockResponse = { id: 1, content: 'Test comment' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await commentService.addComment(1, 'Test comment');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/videos/1/comments',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token',
          },
          body: JSON.stringify({ content: 'Test comment' }),
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('throws error when API returns error response', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Comment too long' }),
      });

      await expect(commentService.addComment(1, 'Test comment')).rejects.toThrow('Comment too long');
    });

    test('throws default error message when API returns error without message', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(commentService.addComment(1, 'Test comment')).rejects.toThrow('Failed to add comment');
    });
  });
});
