import { render, screen } from '@testing-library/react';
import VideoGrid from '../VideoGrid';
import { Video } from '../../App';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock VideoThumbnailHybrid
jest.mock('../VideoThumbnailHybrid', () => {
  return function DummyThumbnail() {
    return <div data-testid="video-thumbnail">Thumbnail</div>;
  };
});

const mockVideos: Video[] = [
  {
    id: 1,
    title: 'Video 1',
    filename: '1.mp4',
    user: { username: 'User1' },
    duration: 100,
    width: 1920,
    height: 1080,
    description: 'Desc 1',
    views: 1000,
    likes: 10,
    tags: [],
    categories: [],
    comments: [],
  },
  {
    id: 2,
    title: 'Video 2',
    filename: '2.mp4',
    user: { username: 'User2' },
    duration: 200,
    width: 1920,
    height: 1080,
    description: 'Desc 2',
    views: 2000,
    likes: 20,
    tags: [],
    categories: [],
    comments: [],
  },
];

describe('VideoGrid Component', () => {
  test('renders list of videos', () => {
    render(
      <BrowserRouter>
        <VideoGrid videos={mockVideos} onVideoSelect={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('Video 1')).toBeInTheDocument();
    expect(screen.getByText('Video 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('video-thumbnail')).toHaveLength(2);
  });

  test('renders empty state message when no videos', () => {
    render(
      <BrowserRouter>
        <VideoGrid videos={[]} onVideoSelect={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('No se encontraron videos')).toBeInTheDocument();
  });
});
