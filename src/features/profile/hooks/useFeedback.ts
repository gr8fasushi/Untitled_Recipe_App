import { useState, useCallback } from 'react';
import {
  submitFeedbackFn,
  type FeedbackCategory,
} from '@/shared/services/firebase/functions.service';

interface UseFeedbackReturn {
  rating: number;
  message: string;
  category: FeedbackCategory;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  setRating: (r: number) => void;
  setMessage: (m: string) => void;
  setCategory: (c: FeedbackCategory) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_CATEGORY: FeedbackCategory = 'general';

export function useFeedback(): UseFeedbackReturn {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>(DEFAULT_CATEGORY);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback((): void => {
    setRating(0);
    setMessage('');
    setCategory(DEFAULT_CATEGORY);
    setIsSuccess(false);
    setError(null);
  }, []);

  const submit = useCallback(async (): Promise<void> => {
    if (rating === 0 || message.trim().length < 10) return;

    setIsLoading(true);
    setError(null);

    try {
      await submitFeedbackFn({ rating, message: message.trim(), category });
      setIsSuccess(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [rating, message, category]);

  return {
    rating,
    message,
    category,
    isLoading,
    isSuccess,
    error,
    setRating,
    setMessage,
    setCategory,
    submit,
    reset,
  };
}
