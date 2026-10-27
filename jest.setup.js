// Native modules that jest-expo does not mock.

// react-native-mmkv uses an in-memory store under Jest, but still loads Nitro at import time.
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: { createHybridObject: jest.fn() },
}));

// Skia needs a native (or CanvasKit) backend: component tests only check the canvas is mounted,
// drawing itself is covered by the pure geometry tests of src/render.
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Canvas = ({ children: _children, ...props }) => React.createElement(View, props);
  const DrawingNode = () => null;
  return new Proxy({ Canvas }, { get: (target, key) => target[key] ?? DrawingNode });
});

// Gesture Handler binds itself to the Worklets UI runtime, which the Jest (web) build of Worklets
// refuses to expose: hand it an empty holder (Gesture Handler's own module mock does the rest).
jest.mock('react-native-worklets', () => ({
  ...jest.requireActual('react-native-worklets'),
  getUIRuntimeHolder: () => ({}),
}));
