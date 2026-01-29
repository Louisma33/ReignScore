// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const localRule = require('./scripts/eslint-rules/no-link-child-style-array');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      'local': {
        rules: {
          'no-link-child-style-array': localRule
        }
      }
    },
    rules: {
      'local/no-link-child-style-array': 'error'
    },
    ignores: ['dist/*'],
  },
]);
