import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { sendChatMessage } from '../services/chatService';
import type { ChatMessage } from '@/shared/types';

function buildMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const recipeId = useChatStore((s) => s.recipeId);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const setError = useChatStore((s) => s.setError);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg = buildMessage('user', trimmed);
      addMessage(userMsg);
      setLoading(true);
      setError(null);

      try {
        const history = useChatStore
          .getState()
          .messages.map((m) => ({ role: m.role, content: m.content }));
        const reply = await sendChatMessage(trimmed, history, recipeId ?? undefined);
        addMessage(buildMessage('assistant', reply));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to get a response.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [addMessage, setLoading, setError, recipeId]
  );

  return { messages, isLoading, error, sendMessage };
}
