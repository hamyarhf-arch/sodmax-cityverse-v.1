[file name]: mobile/babel.config.js
[file content begin]
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
        ],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@context': './src/context',
          '@services': './src/services',
          '@navigation': './src/navigation',
          '@assets': './src/assets',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
[file content end]
