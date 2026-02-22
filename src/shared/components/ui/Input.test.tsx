import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from './Input';

it('renders placeholder text', () => {
  const { getByPlaceholderText } = render(
    <Input value="" onChangeText={() => {}} placeholder="Enter email" />
  );
  expect(getByPlaceholderText('Enter email')).toBeTruthy();
});

it('renders label when provided', () => {
  const { getByText } = render(<Input value="" onChangeText={() => {}} label="Email address" />);
  expect(getByText('Email address')).toBeTruthy();
});

it('does not render label when not provided', () => {
  const { queryByText } = render(<Input value="" onChangeText={() => {}} />);
  expect(queryByText(/label/i)).toBeNull();
});

it('calls onChangeText when text changes', () => {
  const onChangeText = jest.fn();
  const { getByTestId } = render(
    <Input value="" onChangeText={onChangeText} testID="input-email" />
  );
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  expect(onChangeText).toHaveBeenCalledWith('test@example.com');
});

it('shows error message when error prop is set', () => {
  const { getByText } = render(
    <Input value="" onChangeText={() => {}} error="Invalid email" testID="input-email" />
  );
  expect(getByText('Invalid email')).toBeTruthy();
});

it('does not show error message when error prop is absent', () => {
  const { queryByText } = render(<Input value="" onChangeText={() => {}} testID="input-email" />);
  expect(queryByText('Invalid email')).toBeNull();
});

it('renders error with auto-generated testID', () => {
  const { getByTestId } = render(
    <Input value="" onChangeText={() => {}} error="Required" testID="input-email" />
  );
  expect(getByTestId('input-email-error')).toBeTruthy();
});

it('does not fire onChangeText when editable is false', () => {
  const onChangeText = jest.fn();
  const { getByTestId } = render(
    <Input value="" onChangeText={onChangeText} editable={false} testID="input-email" />
  );
  fireEvent.changeText(getByTestId('input-email'), 'abc');
  // editable=false — React Native ignores the event; onChangeText should not be called
  expect(onChangeText).not.toHaveBeenCalled();
});
