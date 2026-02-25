import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

it('renders the label', () => {
  const { getByText } = render(<Button label="Tap Me" onPress={() => {}} />);
  expect(getByText('Tap Me')).toBeTruthy();
});

it('calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByTestId } = render(<Button label="Go" onPress={onPress} testID="btn" />);
  fireEvent.press(getByTestId('btn'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

it('does not call onPress when disabled', () => {
  const onPress = jest.fn();
  const { getByTestId } = render(
    <Button label="Disabled" onPress={onPress} disabled testID="btn" />
  );
  fireEvent.press(getByTestId('btn'));
  expect(onPress).not.toHaveBeenCalled();
});

it('sets accessibilityState disabled when disabled prop is true', () => {
  const { getByTestId } = render(
    <Button label="Disabled" onPress={() => {}} disabled testID="btn" />
  );
  expect(getByTestId('btn').props.accessibilityState?.disabled).toBe(true);
});

it('renders ghost variant without throwing', () => {
  const { getByText } = render(<Button label="Ghost" onPress={() => {}} variant="ghost" />);
  expect(getByText('Ghost')).toBeTruthy();
});

it('renders with fullWidth prop without throwing', () => {
  const { getByTestId } = render(
    <Button label="Full" onPress={() => {}} fullWidth testID="btn-full" />
  );
  expect(getByTestId('btn-full')).toBeTruthy();
});
