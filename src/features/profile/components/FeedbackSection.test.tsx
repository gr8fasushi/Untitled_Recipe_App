const mockSubmit = jest.fn().mockResolvedValue(undefined);
const mockReset = jest.fn();
const mockSetRating = jest.fn();
const mockSetMessage = jest.fn();
const mockSetCategory = jest.fn();

let mockHookReturn = {
  rating: 0,
  message: '',
  category: 'general' as const,
  isLoading: false,
  isSuccess: false,
  error: null as string | null,
  setRating: mockSetRating,
  setMessage: mockSetMessage,
  setCategory: mockSetCategory,
  submit: mockSubmit,
  reset: mockReset,
};

jest.mock('../hooks/useFeedback', () => ({
  useFeedback: () => mockHookReturn,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View />;
  },
}));

// eslint-disable-next-line import/first
import React from 'react';
// eslint-disable-next-line import/first
import { render, fireEvent } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { FeedbackSection } from './FeedbackSection';

describe('FeedbackSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookReturn = {
      rating: 0,
      message: '',
      category: 'general',
      isLoading: false,
      isSuccess: false,
      error: null,
      setRating: mockSetRating,
      setMessage: mockSetMessage,
      setCategory: mockSetCategory,
      submit: mockSubmit,
      reset: mockReset,
    };
  });

  it('renders the feedback section form', () => {
    const { getByTestId } = render(<FeedbackSection />);
    expect(getByTestId('feedback-section')).toBeTruthy();
  });

  it('renders all 5 star buttons', () => {
    const { getByTestId } = render(<FeedbackSection />);
    for (let i = 1; i <= 5; i++) {
      expect(getByTestId(`star-${i}`)).toBeTruthy();
    }
  });

  it('renders all 3 category chips', () => {
    const { getByTestId } = render(<FeedbackSection />);
    expect(getByTestId('category-general')).toBeTruthy();
    expect(getByTestId('category-bug')).toBeTruthy();
    expect(getByTestId('category-feature')).toBeTruthy();
  });

  it('renders message input', () => {
    const { getByTestId } = render(<FeedbackSection />);
    expect(getByTestId('feedback-message')).toBeTruthy();
  });

  it('submit button is disabled when rating is 0 and message is empty', () => {
    const { getByTestId } = render(<FeedbackSection />);
    const btn = getByTestId('btn-submit-feedback');
    expect(btn.props.accessibilityState.disabled).toBe(true);
  });

  it('submit button is enabled when rating > 0 and message >= 10 chars', () => {
    mockHookReturn = { ...mockHookReturn, rating: 4, message: '1234567890' };
    const { getByTestId } = render(<FeedbackSection />);
    const btn = getByTestId('btn-submit-feedback');
    expect(btn.props.accessibilityState.disabled).toBe(false);
  });

  it('pressing a star calls setRating', () => {
    const { getByTestId } = render(<FeedbackSection />);
    fireEvent.press(getByTestId('star-3'));
    expect(mockSetRating).toHaveBeenCalledWith(3);
  });

  it('pressing a category chip calls setCategory', () => {
    const { getByTestId } = render(<FeedbackSection />);
    fireEvent.press(getByTestId('category-bug'));
    expect(mockSetCategory).toHaveBeenCalledWith('bug');
  });

  it('pressing submit calls submit', () => {
    mockHookReturn = { ...mockHookReturn, rating: 5, message: 'Long enough message' };
    const { getByTestId } = render(<FeedbackSection />);
    fireEvent.press(getByTestId('btn-submit-feedback'));
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('shows error message when error is set', () => {
    mockHookReturn = { ...mockHookReturn, error: 'Something went wrong' };
    const { getByTestId } = render(<FeedbackSection />);
    expect(getByTestId('feedback-error')).toBeTruthy();
  });

  it('shows success view when isSuccess is true', () => {
    mockHookReturn = { ...mockHookReturn, isSuccess: true };
    const { getByTestId, queryByTestId } = render(<FeedbackSection />);
    expect(getByTestId('feedback-success')).toBeTruthy();
    expect(queryByTestId('feedback-section')).toBeNull();
  });

  it('shows loading text when isLoading', () => {
    mockHookReturn = {
      ...mockHookReturn,
      rating: 5,
      message: 'Long enough message',
      isLoading: true,
    };
    const { getByText } = render(<FeedbackSection />);
    expect(getByText('Sending...')).toBeTruthy();
  });
});
