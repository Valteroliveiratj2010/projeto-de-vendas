module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/public/js', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'public/js/**/*.js',
    '!public/js/libs/**',
    '!public/js/pages/**',
    '!**/*.min.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/public/js/$1',
    '^@modules/(.*)$': '<rootDir>/public/js/modules/$1',
    '^@css/(.*)$': '<rootDir>/public/css/$1',
    '^@utils/(.*)$': '<rootDir>/public/js/utils/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  verbose: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}; 