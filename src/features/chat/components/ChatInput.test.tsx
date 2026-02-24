import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ChatInput } from './ChatInput';

// Voice not available by default — keeps test surface narrow
jest.mock('../hooks/useVoiceInput', () => ({
  useVoiceInput: () => ({
    isListening: false,
    transcript: '',
    error: null,
    isAvailable: false,
    startListening: jest.fn(),
    stopListening: jest.fn(),
    clearTranscript: jest.fn(),
  }),
}));

describe('ChatInput', () => {
  it('renders the text input', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    expect(screen.getByTestId('chat-text-input')).toBeTruthy();
  });

  it('renders the send button', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    expect(screen.getByTestId('btn-send-message')).toBeTruthy();
  });

  it('send button is disabled when text is empty', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    expect(screen.getByTestId('btn-send-message').props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it('send button is enabled when text is present', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    fireEvent.changeText(screen.getByTestId('chat-text-input'), 'Hello');
    expect(screen.getByTestId('btn-send-message').props.accessibilityState).toEqual({
      disabled: false,
    });
  });

  it('calls onSend with trimmed text when send button pressed', () => {
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);
    fireEvent.changeText(screen.getByTestId('chat-text-input'), '  Cook time?  ');
    fireEvent.press(screen.getByTestId('btn-send-message'));
    expect(onSend).toHaveBeenCalledWith('Cook time?');
  });

  it('clears the input after sending', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    const input = screen.getByTestId('chat-text-input');
    fireEvent.changeText(input, 'Hello');
    fireEvent.press(screen.getByTestId('btn-send-message'));
    expect(input.props.value).toBe('');
  });

  it('does not call onSend when text is only whitespace', () => {
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);
    fireEvent.changeText(screen.getByTestId('chat-text-input'), '   ');
    fireEvent.press(screen.getByTestId('btn-send-message'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('send button is disabled when loading', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={true} />);
    expect(screen.getByTestId('btn-send-message').props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it('does not show voice button when voice not available', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    expect(screen.queryByTestId('btn-voice')).toBeNull();
  });

  it('uses provided testID on the container', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} testID="my-input-bar" />);
    expect(screen.getByTestId('my-input-bar')).toBeTruthy();
  });

  it('uses default testID when none provided', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    expect(screen.getByTestId('chat-input')).toBeTruthy();
  });
});
