const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    '<rootDir>/components/**/*.{ts,tsx}',
    '<rootDir>/lib/**/*.{ts,tsx}',
    '<rootDir>/hooks/**/*.{ts,tsx}',
    '<rootDir>/app/**/*.{ts,tsx}',
    '!<rootDir>/**/_app.tsx',
    '!<rootDir>/**/_document.tsx',
    '!<rootDir>/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 0, // will tighten later phases
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
