// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Mock all CSS imports using identity-obj-proxy
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
