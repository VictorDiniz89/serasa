/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: '<rootDir>/src/test/jsdom-environment.cjs',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { jsx: 'react-jsx', esModuleInterop: true, isolatedModules: true } },
    ],
  },
};
