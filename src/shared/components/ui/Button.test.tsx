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
