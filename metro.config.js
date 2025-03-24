const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    enableBabelRCLookup: true,
  },
  resolver: {
    blacklistRE: exclusionList([/android\/build\//, /ios\/build\//]),
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === '@') {
            return path.join(__dirname, 'src');
          }
          return path.join(process.cwd(), `node_modules/${name}`);
        },
      },
    ),
    resolverMainFields: ['react-native', 'browser', 'main'],
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'cjs'],
  },
  watchFolders: [path.resolve(__dirname, 'src')],
};

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, config);
