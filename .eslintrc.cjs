module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit',
    '@electron-toolkit/eslint-config-prettier'
  ],
  rules: {
    semi: ['error', 'always'],
    'prettier/prettier': ['error', { semi: true }]
  }
};
