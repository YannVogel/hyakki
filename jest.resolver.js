// Reanimated (and Worklets) resolve their web implementations under Jest; React Native's own
// resolver (set by jest-expo) must still run underneath.
const reanimatedResolver = require('react-native-reanimated/jest/resolver');
const reactNativeResolver = require('@react-native/jest-preset/jest/resolver');

module.exports = (request, options) =>
  reanimatedResolver(request, {
    ...options,
    defaultResolver: (innerRequest, innerOptions) =>
      reactNativeResolver(innerRequest, {
        ...innerOptions,
        defaultResolver: options.defaultResolver,
      }),
  });
