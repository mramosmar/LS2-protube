import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FallbackThumbnail from '../FallbackThumbnail';

describe('FallbackThumbnail Component', () => {
  const mockVideo = {
    id: 1,
    title: 'Test Video',
    user: 'TestUser',
    duration: 125,
    categories: ['Gaming', 'Tutorial'],
  };

  test('renders fallback thumbnail with video info', () => {
    render(<FallbackThumbnail video={mockVideo} />);

    // Check that duration is formatted correctly (2:05)
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  test('renders with small size', () => {
    const { container } = render(<FallbackThumbnail video={mockVideo} size="small" />);

    expect(container.querySelector('.thumbnail-small')).toBeInTheDocument();
  });

  test('renders with large size', () => {
    const { container } = render(<FallbackThumbnail video={mockVideo} size="large" />);

    expect(container.querySelector('.thumbnail-large')).toBeInTheDocument();
  });

  test('renders with medium size by default', () => {
    const { container } = render(<FallbackThumbnail video={mockVideo} />);

    expect(container.querySelector('.thumbnail-medium')).toBeInTheDocument();
  });

  test('shows category when showCategory is true and categories exist', () => {
    render(<FallbackThumbnail video={mockVideo} showCategory={true} />);

    expect(screen.getByText('Gaming')).toBeInTheDocument();
  });

  test('does not show category when showCategory is false', () => {
    render(<FallbackThumbnail video={mockVideo} showCategory={false} />);

    expect(screen.queryByText('Gaming')).not.toBeInTheDocument();
  });

  test('handles video with no categories', () => {
    const videoWithoutCategories = {
      ...mockVideo,
      categories: [],
    };

    render(<FallbackThumbnail video={videoWithoutCategories} showCategory={true} />);

    // Should not crash and duration should still show
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  test('handles video with undefined categories', () => {
    const videoWithoutCategories = {
      id: 1,
      title: 'Test Video',
      user: 'TestUser',
      duration: 125,
    };

    render(<FallbackThumbnail video={videoWithoutCategories} showCategory={true} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  test('formats duration with 0 seconds correctly', () => {
    const videoZeroDuration = {
      ...mockVideo,
      duration: 60,
    };

    render(<FallbackThumbnail video={videoZeroDuration} />);

    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  test('formats duration with negative value as 0:00', () => {
    const videoNegativeDuration = {
      ...mockVideo,
      duration: -10,
    };

    render(<FallbackThumbnail video={videoNegativeDuration} />);

    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  test('handles user as object with username', () => {
    const videoWithUserObject = {
      ...mockVideo,
      user: { username: 'ObjectUser' },
    };

    render(<FallbackThumbnail video={videoWithUserObject} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });
});
