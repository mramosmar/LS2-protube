import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import VideoGrid from '../VideoGrid';
import fetchMock from 'jest-fetch-mock';
import { Video } from '../../App';

describe('this component', () => {
  beforeEach(() => {
    fetchMock.resetMocks(); // Reset mocks before each test
  });

  it('renders correctly', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(['video 1 test', 'video 2 test']));
    const asFragment = await act(async () => {
      return render(
        <VideoGrid
          videos={[]}
          onVideoSelect={function (_: Video): void {
            throw new Error('Function not implemented.');
          }}
        />
      ).asFragment;
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
