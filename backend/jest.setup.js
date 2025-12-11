// Ensure a `jest` global exists for environments where ESM transforms may not expose it
try {
  if (typeof globalThis.jest === 'undefined') {
    // Provide minimal mock implementations from jest-mock if runner didn't set globals
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    globalThis.jest = require('jest-mock');
  }
} catch (e) {
  // ignore; test runner should provide jest in normal circumstances
}
