import {
  calculateSimilarity,
  getRelatedVideos,
  calculateTitleSimilarity,
  groupRelatedVideosByCategory,
} from '../videoRecommendations';
import { Video } from '../../App';

const mockVideo1: Video = {
  id: 1,
  title: 'Java Tutorial for Beginners',
  filename: 'java.mp4',
  user: { username: 'CodeMaster' },
  duration: 100,
  width: 1920,
  height: 1080,
  description: 'Learn Java',
  views: 100,
  likes: 10,
  tags: ['java', 'programming'],
  categories: ['Education'],
  comments: [],
};

const mockVideo2: Video = {
  id: 2,
  title: 'Advanced Java Programming',
  filename: 'java_adv.mp4',
  user: { username: 'CodeMaster' }, // Same author
  duration: 200,
  width: 1920,
  height: 1080,
  description: 'More Java',
  views: 200,
  likes: 20,
  tags: ['java', 'coding'], // Common tag
  categories: ['Education'], // Common category
  comments: [],
};

const mockVideo3: Video = {
  id: 3,
  title: 'Cooking Pasta',
  filename: 'pasta.mp4',
  user: { username: 'ChefLuigi' },
  duration: 300,
  width: 1920,
  height: 1080,
  description: 'Yummy pasta',
  views: 300,
  likes: 30,
  tags: ['food', 'cooking'],
  categories: ['Lifestyle'],
  comments: [],
};

const mockVideo4: Video = {
  id: 4,
  title: 'Python Tutorial',
  filename: 'python.mp4',
  user: { username: 'PythonDev' },
  duration: 150,
  width: 1920,
  height: 1080,
  description: 'Learn Python',
  views: 150,
  likes: 15,
  tags: ['python', 'programming'],
  categories: ['Education'],
  comments: [],
};

const mockVideoWithStringUser: Video = {
  id: 5,
  title: 'Video with string user',
  filename: 'test.mp4',
  user: 'StringUser' as any,
  duration: 100,
  width: 1920,
  height: 1080,
  description: 'Test',
  views: 100,
  likes: 10,
  tags: [],
  categories: [],
  comments: [],
};

const mockVideoWithNullUser: Video = {
  id: 6,
  title: 'Video with null user',
  filename: 'test.mp4',
  user: null as any,
  duration: 100,
  width: 1920,
  height: 1080,
  description: 'Test',
  views: 100,
  likes: 10,
  tags: [],
  categories: [],
  comments: [],
};

describe('videoRecommendations', () => {
  describe('calculateSimilarity', () => {
    it('should give high score for same author, category, and similar title', () => {
      const score = calculateSimilarity(mockVideo1, mockVideo2);
      // Expected score breakdown:
      // Same author: +3
      // Common category (Education): +2
      // Significant words in title (Java): +1 (at least)
      // Common tags (java): +1
      expect(score).toBeGreaterThan(5);
    });

    it('should give low score for unrelated videos', () => {
      const score = calculateSimilarity(mockVideo1, mockVideo3);
      expect(score).toBe(0);
    });

    it('should handle videos with same category but different author', () => {
      const score = calculateSimilarity(mockVideo1, mockVideo4);
      expect(score).toBeGreaterThan(0); // Should have some score due to common category
    });

    it('should handle videos with user as string', () => {
      const score = calculateSimilarity(mockVideoWithStringUser, mockVideo1);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle videos with null user', () => {
      const score = calculateSimilarity(mockVideoWithNullUser, mockVideo1);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateTitleSimilarity', () => {
    it('should give high score for similar titles', () => {
      const score = calculateTitleSimilarity(mockVideo1, mockVideo2);
      expect(score).toBeGreaterThan(0);
    });

    it('should give zero score for unrelated titles', () => {
      const score = calculateTitleSimilarity(mockVideo1, mockVideo3);
      expect(score).toBe(0);
    });
  });

  describe('getRelatedVideos', () => {
    it('should sort related videos by score', () => {
      const allVideos = [mockVideo1, mockVideo2, mockVideo3];
      const related = getRelatedVideos(mockVideo1, allVideos);

      expect(related.length).toBe(2); // Should exclude self
      expect(related[0].id).toBe(mockVideo2.id); // Highest score first
      expect(related[1].id).toBe(mockVideo3.id); // Lowest score last
    });

    it('should respect maxResults parameter', () => {
      const allVideos = [mockVideo1, mockVideo2, mockVideo3, mockVideo4];
      const related = getRelatedVideos(mockVideo1, allVideos, 1);

      expect(related.length).toBe(1);
    });

    it('should return empty array when no related videos', () => {
      const related = getRelatedVideos(mockVideo1, [mockVideo1]);
      expect(related.length).toBe(0);
    });
  });

  describe('groupRelatedVideosByCategory', () => {
    it('should group videos by category', () => {
      const allVideos = [mockVideo1, mockVideo2, mockVideo3, mockVideo4];
      const grouped = groupRelatedVideosByCategory(mockVideo1, allVideos);

      expect(grouped).toBeDefined();
    });

    it('should handle empty videos array', () => {
      const grouped = groupRelatedVideosByCategory(mockVideo1, []);
      expect(grouped).toBeDefined();
    });

    it('should handle videos with undefined categories', () => {
      const videoNoCategories = { ...mockVideo1, categories: undefined as any };
      const grouped = groupRelatedVideosByCategory(videoNoCategories, [mockVideo2]);
      expect(grouped).toBeDefined();
    });
  });
});
