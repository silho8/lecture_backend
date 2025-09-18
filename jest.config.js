module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  verbose: true,
  forceExit: true, // Jest can sometimes hang due to open handles with Express/DB
  clearMocks: true,
};
