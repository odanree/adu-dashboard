module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/unit/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.spec\\.ts$'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverageFrom: [
    '../api/**/*.js',
    '!../api/**/*.spec.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
