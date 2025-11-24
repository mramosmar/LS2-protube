import '@testing-library/jest-dom';

import fetchMock from 'jest-fetch-mock';

// Add TextEncoder and TextDecoder polyfills for jsdom
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

jest.mock('./src/utils/Env', () => ({
  getEnv: () => ({
    API_BASE_URL: 'other',
    MEDIA_BASE_URL: 'development',
  }),
}));

fetchMock.enableMocks();
