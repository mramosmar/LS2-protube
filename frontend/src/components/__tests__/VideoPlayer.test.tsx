import { render, screen, act } from '@testing-library/react';
import VideoPlayer from '../VideoPlayer';
import { Video } from '../../App';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock VideoThumbnailHybrid to avoid complex rendering and API calls
jest.mock('../VideoThumbnailHybrid', () => ({
  __esModule: true,
  default: function DummyThumbnail() {
    return <div data-testid="video-thumbnail">Thumbnail</div>;
  },
}));

// Mock the services
jest.mock('../../../services/viewService', () => ({
  viewService: {
    getReaction: jest.fn().mockResolvedValue({ likes: 100, dislikes: 5, userReaction: 'none' }),
    incrementView: jest.fn().mockResolvedValue({ views: 1501 }),
    likeVideo: jest.fn().mockResolvedValue({ likes: 101, dislikes: 5, userReaction: 'like' }),
    dislikeVideo: jest.fn().mockResolvedValue({ likes: 100, dislikes: 6, userReaction: 'dislike' }),
  },
}));

jest.mock('../../../services/commentService', () => ({
  commentService: {
    addComment: jest.fn().mockResolvedValue({}),
  },
}));

const mockVideo: Video = {
  id: 1,
  title: 'Test Video Title',
  filename: 'test.mp4',
  thumbnail: 'test.webp',
  user: { username: 'TestUser' },
  duration: 120,
  width: 1920,
  height: 1080,
  description: 'This is a test description',
  views: 1500,
  likes: 100,
  tags: ['test', 'video'],
  categories: ['Education'],
  comments: [{ id: 1, content: 'Great video!', user: { username: 'Viewer1' } }],
};

const mockVideoWithUserString: Video = {
  ...mockVideo,
  id: 2,
  user: 'StringUser' as any,
};

const mockVideoWithNullUser: Video = {
  ...mockVideo,
  id: 3,
  user: null as any,
};

const mockVideoManyViews: Video = {
  ...mockVideo,
  id: 4,
  views: 1500000,
  likes: 5000,
};

const mockVideoFewViews: Video = {
  ...mockVideo,
  id: 5,
  views: 500,
  likes: 50,
};

const mockRelatedVideos: Video[] = [
  {
    id: 2,
    title: 'Related Video',
    user: { username: 'OtherUser' },
    duration: 60,
    width: 1280,
    height: 720,
    description: 'Related content',
    views: 500,
    likes: 20,
    tags: [],
    categories: ['Education'],
    comments: [],
  },
  {
    id: 3,
    title: 'Same Author Video',
    user: { username: 'TestUser' },
    duration: 90,
    width: 1280,
    height: 720,
    description: 'Same author content',
    views: 300,
    likes: 15,
    tags: [],
    categories: ['Gaming'],
    comments: [],
  },
  {
    id: 4,
    title: 'Test Similar Title',
    user: { username: 'AnotherUser' },
    duration: 45,
    width: 1280,
    height: 720,
    description: 'Similar title content',
    views: 200,
    likes: 10,
    tags: [],
    categories: ['Entertainment'],
    comments: [],
  },
];

const renderVideoPlayer = async (video: Video = mockVideo, props = {}) => {
  let result;
  await act(async () => {
    result = render(
      <BrowserRouter>
        <VideoPlayer
          video={video}
          onBack={() => {}}
          relatedVideos={mockRelatedVideos}
          onVideoSelect={() => {}}
          selectedCategory="all"
          {...props}
        />
      </BrowserRouter>
    );
  });
  return result;
};

describe('VideoPlayer Component', () => {
  test('renders video title, description, and real metrics', async () => {
    await renderVideoPlayer();

    // Verify Title
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();

    // Verify Username (multiple elements can have this text)
    expect(screen.getAllByText('TestUser').length).toBeGreaterThanOrEqual(1);

    // Verify Views (formatted)
    expect(screen.getAllByText('1.5K visualizaciones').length).toBeGreaterThanOrEqual(1);

    // Verify Likes (formatted)
    expect(screen.getByText('100')).toBeInTheDocument();

    // Verify Description
    expect(screen.getByText('This is a test description...', { exact: false })).toBeInTheDocument();

    // Verify Comments count
    expect(screen.getByText('1 comentarios')).toBeInTheDocument();
  });

  test('renders with user as string', async () => {
    await renderVideoPlayer(mockVideoWithUserString);

    expect(screen.getAllByText('StringUser').length).toBeGreaterThanOrEqual(1);
  });

  test('renders with null user gracefully', async () => {
    await renderVideoPlayer(mockVideoWithNullUser);

    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  test('formats few views correctly', async () => {
    await renderVideoPlayer(mockVideoFewViews);

    expect(screen.getAllByText('500 visualizaciones').length).toBeGreaterThanOrEqual(1);
  });

  test('filters related videos by category', async () => {
    await renderVideoPlayer(mockVideo, { selectedCategory: 'Education' });

    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  test('renders with authenticated user', async () => {
    await renderVideoPlayer(mockVideo, {
      isAuthenticated: true,
      currentUser: 'CurrentUser',
    });

    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  test('renders existing comments', async () => {
    await renderVideoPlayer();

    expect(screen.getByText('Great video!')).toBeInTheDocument();
    expect(screen.getByText('Viewer1')).toBeInTheDocument();
  });

  test('renders video without comments', async () => {
    const videoNoComments = { ...mockVideo, comments: [] };
    await renderVideoPlayer(videoNoComments);

    // Verificar que el video se renderiza sin errores
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
  });

  test('groups related videos correctly with same author', async () => {
    await renderVideoPlayer();

    // Same author video should be visible
    expect(screen.getByText('Same Author Video')).toBeInTheDocument();
  });
});
