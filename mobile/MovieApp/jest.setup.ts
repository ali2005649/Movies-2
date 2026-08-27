/**
 * Shared Jest setup for Expo / React Native unit & component tests.
 */

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const chain = () => {
    const api: Record<string, unknown> = {};
    api.delay = () => api;
    api.springify = () => api;
    api.damping = () => api;
    api.stiffness = () => api;
    api.duration = () => api;
    api.build = () => ({});
    return api;
  };

  return {
    __esModule: true,
    default: {
      View,
      Text: require('react-native').Text,
      createAnimatedComponent: (Component: React.ComponentType) => Component,
      call: () => {},
    },
    FadeInDown: chain(),
    FadeIn: chain(),
    FadeInUp: chain(),
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: (updater: () => object) => {
      try {
        return updater();
      } catch {
        return {};
      }
    },
    withSpring: (value: unknown) => value,
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props: { testID?: string }) =>
    React.createElement(View, { testID: props.testID ?? 'icon' });
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
  };
});
