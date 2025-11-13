module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-flow', { all: true }],
          ['@babel/preset-env', { targets: { node: 'current' } }],
          [
            '@babel/preset-typescript',
            {
              allowDeclareFields: true,
              isTSX: true,
              allExtensions: true,
            },
          ],
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-clipboard|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-webview)/)',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/jest/react-native-mock.js',
  },
};
