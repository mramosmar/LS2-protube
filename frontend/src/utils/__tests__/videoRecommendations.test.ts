import { calculateSimilarity, getRelatedVideos } from '../videoRecommendations';
import { Video } from '../../App';

describe('videoRecommendations', () => {
    const createVideo = (overrides: Partial<Video>): Video => ({
        id: 1,
        title: 'Test Video',
        user: 'Test User',
        duration: 100,
        width: 1920,
        height: 1080,
        meta: {
            description: 'Test description',
            categories: [],
            tags: []
        },
        ...overrides
    });

    describe('calculateSimilarity', () => {
        it('should give high score for same author', () => {
            const video1 = createVideo({ id: 1, user: 'Bruno Mars' });
            const video2 = createVideo({ id: 2, user: 'Bruno Mars' });

            const score = calculateSimilarity(video1, video2);
            expect(score).toBeGreaterThanOrEqual(3);
        });

        it('should give points for common categories', () => {
            const video1 = createVideo({
                id: 1,
                meta: { description: '', categories: ['Music', 'Pop'], tags: [] }
            });
            const video2 = createVideo({
                id: 2,
                meta: { description: '', categories: ['Music', 'Rock'], tags: [] }
            });

            const score = calculateSimilarity(video1, video2);
            expect(score).toBeGreaterThanOrEqual(2); // 1 common category
        });

        it('should give points for common significant words in title', () => {
            const video1 = createVideo({ id: 1, title: 'Receta de Pasta Carbonara' });
            const video2 = createVideo({ id: 2, title: 'Mejor Receta de Pasta Italiana' });

            const score = calculateSimilarity(video1, video2);
            expect(score).toBeGreaterThan(0); // Has common words "receta" and "pasta"
        });

        it('should ignore stop words', () => {
            const video1 = createVideo({ id: 1, title: 'El mejor video de cocina' });
            const video2 = createVideo({ id: 2, title: 'Los mejores videos de deportes' });

            const score = calculateSimilarity(video1, video2);
            expect(score).toBeLessThan(2); // Should not count stop words like "el", "de", etc.
        });

        it('should give points for common tags', () => {
            const video1 = createVideo({
                id: 1,
                meta: { description: '', categories: [], tags: ['cooking', 'italian', 'pasta'] }
            });
            const video2 = createVideo({
                id: 2,
                meta: { description: '', categories: [], tags: ['cooking', 'pasta', 'recipe'] }
            });

            const score = calculateSimilarity(video1, video2);
            expect(score).toBeGreaterThanOrEqual(2); // 2 common tags
        });

        it('should return 0 for completely unrelated videos', () => {
            const video1 = createVideo({
                id: 1,
                title: 'ABC',
                user: 'User A',
                meta: { description: '', categories: ['Cat1'], tags: ['tag1'] }
            });
            const video2 = createVideo({
                id: 2,
                title: 'XYZ',
                user: 'User B',
                meta: { description: '', categories: ['Cat2'], tags: ['tag2'] }
            });

            const score = calculateSimilarity(video1, video2);
            expect(score).toBe(0);
        });
    });

    describe('getRelatedVideos', () => {
        const allVideos: Video[] = [
            createVideo({
                id: 1,
                title: 'Bruno Mars - 24K Magic',
                user: 'Bruno Mars',
                meta: { description: '', categories: ['Music'], tags: ['pop', 'funk'] }
            }),
            createVideo({
                id: 2,
                title: 'Bruno Mars - Uptown Funk',
                user: 'Mark Ronson',
                meta: { description: '', categories: ['Music'], tags: ['pop', 'funk', 'bruno mars'] }
            }),
            createVideo({
                id: 3,
                title: 'Receta de Pasta',
                user: 'Chef Maria',
                meta: { description: '', categories: ['Cooking'], tags: ['recipe', 'pasta'] }
            }),
            createVideo({
                id: 4,
                title: 'Bruno Mars - Just The Way You Are',
                user: 'Bruno Mars',
                meta: { description: '', categories: ['Music'], tags: ['pop', 'ballad'] }
            }),
            createVideo({
                id: 5,
                title: 'Pizza Casera',
                user: 'Chef Maria',
                meta: { description: '', categories: ['Cooking'], tags: ['recipe', 'italian'] }
            })
        ];

        it('should return related videos sorted by similarity', () => {
            const currentVideo = allVideos[0]; // Bruno Mars - 24K Magic
            const related = getRelatedVideos(currentVideo, allVideos, 10);

            expect(related.length).toBeGreaterThan(0);
            expect(related[0].id).not.toBe(currentVideo.id);

            // Videos by same author or same category should appear first
            const firstRelated = related[0];
            const isSameAuthor = firstRelated.user === currentVideo.user;
            const hasSameCategory = firstRelated.meta?.categories?.some(cat =>
                currentVideo.meta?.categories?.includes(cat)
            );

            expect(isSameAuthor || hasSameCategory).toBe(true);
        });

        it('should exclude the current video', () => {
            const currentVideo = allVideos[0];
            const related = getRelatedVideos(currentVideo, allVideos, 10);

            expect(related.find(v => v.id === currentVideo.id)).toBeUndefined();
        });

        it('should limit results to maxResults', () => {
            const currentVideo = allVideos[0];
            const maxResults = 2;
            const related = getRelatedVideos(currentVideo, allVideos, maxResults);

            expect(related.length).toBeLessThanOrEqual(maxResults);
        });

        it('should prioritize same author videos', () => {
            const currentVideo = allVideos[0]; // Bruno Mars - 24K Magic
            const related = getRelatedVideos(currentVideo, allVideos, 10);

            // Find video by same author
            const sameAuthorVideo = related.find(v => v.user === currentVideo.user);
            expect(sameAuthorVideo).toBeDefined();

            // It should be in top positions
            const sameAuthorIndex = related.findIndex(v => v.user === currentVideo.user);
            expect(sameAuthorIndex).toBeLessThan(3);
        });
    });
});
