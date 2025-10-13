import { Component, ErrorInfo, ReactNode } from 'react';
import FallbackThumbnail from './FallbackThumbnail';

interface Props {
  children: ReactNode;
  video: {
    id: number;
    title: string;
    user: string;
    duration: number;
    meta?: {
      categories?: string[];
    };
  };
  size?: 'small' | 'medium' | 'large';
  showCategory?: boolean;
}

interface State {
  hasError: boolean;
}

class ThumbnailErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThumbnailErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <FallbackThumbnail video={this.props.video} size={this.props.size} showCategory={this.props.showCategory} />
      );
    }

    return this.props.children;
  }
}

export default ThumbnailErrorBoundary;
