module.exports = {
  presets: ['module:@react-native/babel-preset', "nativewind/babel"],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@': './src',
          '~':'./',
          "tailwind.config": "./tailwind.config.js",
        },
      },
    ],
    'react-native-reanimated/plugin',

  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
