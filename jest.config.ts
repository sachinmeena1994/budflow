import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    // Handle absolute imports (adjust if you use something different)
    '^@/(.*)$': '<rootDir>/src/$1',

    // Static assets like images
    '\\.(svg)$': '<rootDir>/__mocks__/svg.tsx',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__test__/jest.setup.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  coverageReporters: ['html', 'text', 'text-summary', 'lcov', 'cobertura'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.ts'],
};

export default config;
