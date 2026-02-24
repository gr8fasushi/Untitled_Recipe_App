import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RatingPicker } from './RatingPicker';

describe('RatingPicker', () => {
  it('renders 10 rating buttons', () => {
    const { getByTestId } = render(<RatingPicker rating={null} onRatingChange={jest.fn()} />);
    for (let i = 1; i <= 10; i++) {
      expect(getByTestId(`rating-picker-btn-${i}`)).toBeTruthy();
    }
  });

  it('renders with a custom testID prefix', () => {
    const { getByTestId } = render(
      <RatingPicker rating={null} onRatingChange={jest.fn()} testID="my-picker" />
    );
    expect(getByTestId('my-picker')).toBeTruthy();
    expect(getByTestId('my-picker-btn-5')).toBeTruthy();
  });

  it('calls onRatingChange with the selected rating', () => {
    const onRatingChange = jest.fn();
    const { getByTestId } = render(<RatingPicker rating={null} onRatingChange={onRatingChange} />);
    fireEvent.press(getByTestId('rating-picker-btn-7'));
    expect(onRatingChange).toHaveBeenCalledWith(7);
  });

  it('calls onRatingChange with null when tapping the already-selected rating (deselect)', () => {
    const onRatingChange = jest.fn();
    const { getByTestId } = render(<RatingPicker rating={8} onRatingChange={onRatingChange} />);
    fireEvent.press(getByTestId('rating-picker-btn-8'));
    expect(onRatingChange).toHaveBeenCalledWith(null);
  });

  it('marks the selected button as selected in accessibilityState', () => {
    const { getByTestId } = render(<RatingPicker rating={5} onRatingChange={jest.fn()} />);
    expect(getByTestId('rating-picker-btn-5').props.accessibilityState?.selected).toBe(true);
    expect(getByTestId('rating-picker-btn-3').props.accessibilityState?.selected).toBe(false);
  });

  it('has correct accessibilityLabel on each button', () => {
    const { getByTestId } = render(<RatingPicker rating={null} onRatingChange={jest.fn()} />);
    expect(getByTestId('rating-picker-btn-1').props.accessibilityLabel).toBe('Rate 1');
    expect(getByTestId('rating-picker-btn-10').props.accessibilityLabel).toBe('Rate 10');
  });
});
