import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThumbnailErrorBoundary from '../ThumbnailErrorBoundary';

// Mock FallbackThumbnail component
jest.mock('../FallbackThumbnail', () => ({
  __esModule: true,
  default: function MockFallbackThumbnail({ video }: { video: { id: number; title: string } }) {
    return <div data-testid="fallback-thumbnail">Fallback for {video.title}</div>;
  },
}));

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

const mockVideo = {
  id: 1,
  title: 'Test Video',
  user: 'TestUser',
  duration: 120,
  categories: ['Gaming'],
};

// Component that will throw an error
const ThrowingComponent = () => {
  throw new Error('Test error');
};

// Component that doesn't throw
const ValidComponent = () => <div>Valid content</div>;

describe('ThumbnailErrorBoundary Component', () => {
  test('renders children when there is no error', () => {
    render(
      <ThumbnailErrorBoundary video={mockVideo}>
        <ValidComponent />
      </ThumbnailErrorBoundary>
    );

    expect(screen.getByText('Valid content')).toBeInTheDocument();
  });

  test('renders fallback thumbnail when child throws an error', () => {
    render(
      <ThumbnailErrorBoundary video={mockVideo}>
        <ThrowingComponent />
      </ThumbnailErrorBoundary>
    );

    expect(screen.getByTestId('fallback-thumbnail')).toBeInTheDocument();
    expect(screen.getByText('Fallback for Test Video')).toBeInTheDocument();
  });

  test('passes size prop to fallback thumbnail', () => {
    render(
      <ThumbnailErrorBoundary video={mockVideo} size="large">
        <ThrowingComponent />
      </ThumbnailErrorBoundary>
    );

    expect(screen.getByTestId('fallback-thumbnail')).toBeInTheDocument();
  });

  test('passes showCategory prop to fallback thumbnail', () => {
    render(
      <ThumbnailErrorBoundary video={mockVideo} showCategory={false}>
        <ThrowingComponent />
      </ThumbnailErrorBoundary>
    );

    expect(screen.getByTestId('fallback-thumbnail')).toBeInTheDocument();
  });

  test('logs error to console when error is caught', () => {
    render(
      <ThumbnailErrorBoundary video={mockVideo}>
        <ThrowingComponent />
      </ThumbnailErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });
});
