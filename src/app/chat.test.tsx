import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ChatScreen from './chat';
import { useChatStore } from '@/features/chat/store/chatStore';

// ---------- helpers ----------

import { useChat } from '@/features/chat/hooks/useChat';
import { useTextToSpeech } from '@/features/chat/hooks/useTextToSpeech';
import { useRouter } from 'expo-router';

// ---------- mocks ----------

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ recipeId: 'recipe-xyz' }),
  useRouter: jest.fn().mockReturnValue({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/features/chat/store/chatStore', () => ({
  useChatStore: jest.fn(),
}));

jest.mock('@/features/chat/hooks/useChat', () => ({
  useChat: jest.fn(),
}));

jest.mock('@/features/chat/hooks/useTextToSpeech', () => ({
  useTextToSpeech: jest.fn(),
}));

jest.mock('@/features/chat/components/ChatInput', () => ({
  ChatInput: ({ testID }: { testID?: string }) => {
    const { View } = require('react-native');
    return <View testID={testID ?? 'chat-input'} />;
  },
}));

jest.mock('@/features/chat/components/ChatBubble', () => ({
  ChatBubble: ({
    testID,
    message,
  }: {
    testID?: string;
    message: { id: string; content: string };
  }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={testID ?? `chat-bubble-${message.id}`}>
        <Text>{message.content}</Text>
      </View>
    );
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
}));

const mockUseChatStore = useChatStore as unknown as jest.Mock;
const mockUseChat = useChat as unknown as jest.Mock;
const mockUseTTS = useTextToSpeech as unknown as jest.Mock;
const mockUseRouter = useRouter as unknown as jest.Mock;

function buildStoreMock(overrides = {}) {
  return (selector: (s: Record<string, unknown>) => unknown) => {
    const state: Record<string, unknown> = {
      messages: [],
      isLoading: false,
      error: null,
      isVoiceMuted: false,
      setRecipeId: jest.fn(),
      loadVoiceMuted: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn(),
      ...overrides,
    };
    return selector(state);
  };
}

function buildChatMock(overrides = {}) {
  return {
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    ...overrides,
  };
}

function buildTTSMock(overrides = {}) {
  return {
    isVoiceMuted: false,
    toggleMute: jest.fn(),
    speak: jest.fn(),
    stop: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockUseChatStore.mockImplementation(buildStoreMock());
  mockUseChat.mockReturnValue(buildChatMock());
  mockUseTTS.mockReturnValue(buildTTSMock());
  mockUseRouter.mockReturnValue({ back: jest.fn(), push: jest.fn() });
});

// ---------- helpers ----------

// render outside act(), flush effects separately
async function renderScreen(): Promise<void> {
  render(<ChatScreen />);
  await act(async () => {});
}

// ---------- tests ----------

describe('ChatScreen', () => {
  it('renders the screen', async () => {
    await renderScreen();
    expect(screen.getByTestId('chat-screen')).toBeTruthy();
  });

  it('shows empty state when no messages', async () => {
    await renderScreen();
    expect(screen.getByTestId('chat-empty')).toBeTruthy();
  });

  it('shows heading', async () => {
    await renderScreen();
    expect(screen.getByTestId('chat-heading')).toBeTruthy();
    expect(screen.getByText('AI Chef')).toBeTruthy();
  });

  it('shows mute toggle button', async () => {
    await renderScreen();
    expect(screen.getByTestId('btn-toggle-mute')).toBeTruthy();
  });

  it('shows speaker icon when not muted', async () => {
    await renderScreen();
    expect(screen.getByText('🔊')).toBeTruthy();
  });

  it('shows muted icon when muted', async () => {
    mockUseTTS.mockReturnValue(buildTTSMock({ isVoiceMuted: true }));
    await renderScreen();
    expect(screen.getByText('🔇')).toBeTruthy();
  });

  it('calls toggleMute when mute button pressed', async () => {
    const toggleMute = jest.fn();
    mockUseTTS.mockReturnValue(buildTTSMock({ toggleMute }));
    await renderScreen();
    fireEvent.press(screen.getByTestId('btn-toggle-mute'));
    expect(toggleMute).toHaveBeenCalledTimes(1);
  });

  it('shows back button and navigates on press', async () => {
    const back = jest.fn();
    mockUseRouter.mockReturnValue({ back, push: jest.fn() });
    await renderScreen();
    fireEvent.press(screen.getByTestId('btn-back'));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('shows message list when messages exist', async () => {
    const messages = [
      { id: 'msg-1', role: 'user', content: 'Hello', timestamp: '2024-01-01T00:00:00.000Z' },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: '2024-01-01T00:00:05.000Z',
      },
    ];
    mockUseChat.mockReturnValue(buildChatMock({ messages }));
    mockUseChatStore.mockImplementation(buildStoreMock({ messages }));
    await renderScreen();
    expect(screen.getByTestId('chat-message-list')).toBeTruthy();
    expect(screen.queryByTestId('chat-empty')).toBeNull();
  });

  it('shows loading indicator when isLoading', async () => {
    mockUseChat.mockReturnValue(buildChatMock({ isLoading: true }));
    await renderScreen();
    expect(screen.getByTestId('chat-loading')).toBeTruthy();
  });

  it('does not show loading indicator when not loading', async () => {
    await renderScreen();
    expect(screen.queryByTestId('chat-loading')).toBeNull();
  });

  it('shows error banner when error exists', async () => {
    mockUseChat.mockReturnValue(buildChatMock({ error: 'Something went wrong' }));
    await renderScreen();
    expect(screen.getByTestId('chat-error')).toBeTruthy();
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('does not show error banner when no error', async () => {
    await renderScreen();
    expect(screen.queryByTestId('chat-error')).toBeNull();
  });

  it('renders the chat input bar', async () => {
    await renderScreen();
    expect(screen.getByTestId('chat-input-bar')).toBeTruthy();
  });
});
