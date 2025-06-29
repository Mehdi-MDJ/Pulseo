import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock de TextEncoder pour supertest
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock de fetch global
global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock de console pour éviter le bruit dans les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock de process.env
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:test.db';
process.env.JWT_SECRET = 'test-secret';
process.env.REPLIT_AUTH_SECRET = 'test-replit-secret';

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.getItem.mockReturnValue(null);
});
