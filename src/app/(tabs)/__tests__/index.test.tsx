import React from 'react';
import { render } from '@testing-library/react-native';

import TabsIndex from '../index';

// (tabs)/index.tsx is a redirect shim — it immediately redirects to /(tabs)/home.
// The old pantry screen tests have been moved to pantry.test.tsx.

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text testID="redirect-target">{href}</Text>;
  },
}));

it('redirects to /(tabs)/home', () => {
  const { getByTestId } = render(<TabsIndex />);
  expect(getByTestId('redirect-target').props.children).toBe('/(tabs)/home');
});
