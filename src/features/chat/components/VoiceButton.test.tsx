import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { VoiceButton } from './VoiceButton';

describe('VoiceButton', () => {
  it('renders mic icon when not listening', () => {
    render(<VoiceButton isListening={false} isAvailable={true} onPress={jest.fn()} />);
    expect(screen.getByText('🎤')).toBeTruthy();
  });

  it('renders stop icon when listening', () => {
    render(<VoiceButton isListening={true} isAvailable={true} onPress={jest.fn()} />);
    expect(screen.getByText('⏹')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<VoiceButton isListening={false} isAvailable={true} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('btn-voice'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('returns null when not available', () => {
    const { toJSON } = render(
      <VoiceButton isListening={false} isAvailable={false} onPress={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('uses provided testID', () => {
    render(
      <VoiceButton
        isListening={false}
        isAvailable={true}
        onPress={jest.fn()}
        testID="my-voice-btn"
      />
    );
    expect(screen.getByTestId('my-voice-btn')).toBeTruthy();
  });

  it('has correct accessibilityLabel when not listening', () => {
    render(<VoiceButton isListening={false} isAvailable={true} onPress={jest.fn()} />);
    const btn = screen.getByTestId('btn-voice');
    expect(btn.props.accessibilityLabel).toBe('Start voice input');
  });

  it('has correct accessibilityLabel when listening', () => {
    render(<VoiceButton isListening={true} isAvailable={true} onPress={jest.fn()} />);
    const btn = screen.getByTestId('btn-voice');
    expect(btn.props.accessibilityLabel).toBe('Stop listening');
  });

  it('has selected accessibilityState when listening', () => {
    render(<VoiceButton isListening={true} isAvailable={true} onPress={jest.fn()} />);
    const btn = screen.getByTestId('btn-voice');
    expect(btn.props.accessibilityState).toEqual({ selected: true });
  });
});
