import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ChatBubble } from './ChatBubble';
import type { ChatMessage } from '@/shared/types';

const userMessage: ChatMessage = {
  id: 'msg-1',
  role: 'user',
  content: 'How long do I cook the chicken?',
  timestamp: '2024-01-01T10:00:00.000Z',
};

const assistantMessage: ChatMessage = {
  id: 'msg-2',
  role: 'assistant',
  content: 'Cook chicken to an internal temperature of 165°F.',
  timestamp: '2024-01-01T10:00:05.000Z',
};

describe('ChatBubble', () => {
  it('renders user message content', () => {
    render(<ChatBubble message={userMessage} />);
    expect(screen.getByText('How long do I cook the chicken?')).toBeTruthy();
  });

  it('renders assistant message content', () => {
    render(<ChatBubble message={assistantMessage} />);
    expect(screen.getByText('Cook chicken to an internal temperature of 165°F.')).toBeTruthy();
  });

  it('shows "You" label for user messages', () => {
    render(<ChatBubble message={userMessage} />);
    expect(screen.getByText('You')).toBeTruthy();
  });

  it('shows "Chef Jules" label for assistant messages', () => {
    render(<ChatBubble message={assistantMessage} />);
    expect(screen.getByText('Chef Jules')).toBeTruthy();
  });

  it('uses message id as default testID', () => {
    render(<ChatBubble message={userMessage} />);
    expect(screen.getByTestId('chat-bubble-msg-1')).toBeTruthy();
  });

  it('uses provided testID', () => {
    render(<ChatBubble message={userMessage} testID="bubble-custom" />);
    expect(screen.getByTestId('bubble-custom')).toBeTruthy();
  });

  it('exposes text node via testID', () => {
    render(<ChatBubble message={userMessage} testID="bubble-custom" />);
    expect(screen.getByTestId('bubble-custom-text')).toBeTruthy();
  });
});
