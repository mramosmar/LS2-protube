import { calculateSimilarity, getRelatedVideos } from '../videoRecommendations';
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
  });

  describe('getRelatedVideos', () => {
    it('should sort related videos by score', () => {
      const allVideos = [mockVideo1, mockVideo2, mockVideo3];
      const related = getRelatedVideos(mockVideo1, allVideos);

      expect(related.length).toBe(2); // Should exclude self
      expect(related[0].id).toBe(mockVideo2.id); // Highest score first
      expect(related[1].id).toBe(mockVideo3.id); // Lowest score last
    });
  });
});
