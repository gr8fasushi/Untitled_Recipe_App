import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReviewInput } from './ReviewInput';
import { MAX_REVIEW_LENGTH } from '../types';

describe('ReviewInput', () => {
  it('renders with the default testID', () => {
    const { getByTestId } = render(<ReviewInput review="" onReviewChange={jest.fn()} />);
    expect(getByTestId('review-input')).toBeTruthy();
    expect(getByTestId('review-input-input')).toBeTruthy();
  });

  it('renders with a custom testID', () => {
    const { getByTestId } = render(
      <ReviewInput review="" onReviewChange={jest.fn()} testID="my-review" />
    );
    expect(getByTestId('my-review')).toBeTruthy();
  });

  it('displays the current review value', () => {
    const { getByDisplayValue } = render(
      <ReviewInput review="Excellent!" onReviewChange={jest.fn()} />
    );
    expect(getByDisplayValue('Excellent!')).toBeTruthy();
  });

  it('calls onReviewChange when text changes', () => {
    const onReviewChange = jest.fn();
    const { getByTestId } = render(<ReviewInput review="" onReviewChange={onReviewChange} />);
    fireEvent.changeText(getByTestId('review-input-input'), 'Tasty!');
    expect(onReviewChange).toHaveBeenCalledWith('Tasty!');
  });

  it('shows character counter', () => {
    const { getByText } = render(<ReviewInput review="Yum" onReviewChange={jest.fn()} />);
    expect(getByText(`3/${MAX_REVIEW_LENGTH}`)).toBeTruthy();
  });

  it('does not call onReviewChange when text exceeds max length', () => {
    const onReviewChange = jest.fn();
    const { getByTestId } = render(
      <ReviewInput review="existing" onReviewChange={onReviewChange} />
    );
    const overLimit = 'a'.repeat(MAX_REVIEW_LENGTH + 1);
    fireEvent.changeText(getByTestId('review-input-input'), overLimit);
    expect(onReviewChange).not.toHaveBeenCalled();
  });

  it('shows placeholder text', () => {
    const { getByPlaceholderText } = render(<ReviewInput review="" onReviewChange={jest.fn()} />);
    expect(getByPlaceholderText('Share your thoughts on this recipe…')).toBeTruthy();
  });
});
