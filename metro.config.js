// Import at top level to avoid lazy loading
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for latest Metro version
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.assetExts.push('bin');

// Optimize for performance
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_keys: true,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  warnings: false,
};

// Enable new Metro features
config.transformer.unstable_allowRequireContext = true;
config.resolver.unstable_enableSymlinks = false;

module.exports = config;