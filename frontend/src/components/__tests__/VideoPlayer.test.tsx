import { render, screen } from '@testing-library/react';
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
];

describe('VideoPlayer Component', () => {
  test('renders video title, description, and real metrics', () => {
    render(
      <BrowserRouter>
        <VideoPlayer
          video={mockVideo}
          onBack={() => {}}
          relatedVideos={mockRelatedVideos}
          onVideoSelect={() => {}}
          selectedCategory="all"
        />
      </BrowserRouter>
    );

    // Verify Title
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();

    // Verify Username
    expect(screen.getByText('TestUser')).toBeInTheDocument();

    // Verify Views (formatted)
    // 1500 should be formatted as "1.5K visualizaciones" based on formatViews logic
    // The text appears in multiple places (stats section and description), so we use getAllByText
    expect(screen.getAllByText('1.5K visualizaciones').length).toBeGreaterThanOrEqual(1);

    // Verify Likes (formatted)
    // 100 likes should be displayed as "100"
    expect(screen.getByText('100')).toBeInTheDocument();

    // Verify Description (initially truncated or full depending on length, but short enough here)
    expect(screen.getByText('This is a test description...', { exact: false })).toBeInTheDocument();

    // Verify Comments count
    expect(screen.getByText('1 comentarios')).toBeInTheDocument();
  });
});
