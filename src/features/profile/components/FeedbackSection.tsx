import { useEffect } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from '../hooks/useFeedback';
import type { FeedbackCategory } from '@/shared/services/firebase/functions.service';

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature Request' },
];

export function FeedbackSection(): React.JSX.Element {
  const {
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
  } = useFeedback();

  const isSubmitDisabled = rating === 0 || message.trim().length < 10 || isLoading;

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(reset, 3000);
    return () => clearTimeout(timer);
  }, [isSuccess, reset]);

  if (isSuccess) {
    return (
      <View testID="feedback-success" className="items-center py-6">
        <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
        <Text className="mt-3 text-base font-semibold text-green-700 dark:text-green-400">
          Thanks for your feedback!
        </Text>
      </View>
    );
  }

  return (
    <View testID="feedback-section">
      <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Send Feedback</Text>

      {/* Star rating */}
      <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Rating</Text>
      <View className="mb-4 flex-row gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            testID={`star-${star}`}
            onPress={() => setRating(star)}
            accessibilityLabel={`${star} star`}
            accessibilityRole="button"
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#f59e0b' : '#d1d5db'}
            />
          </Pressable>
        ))}
      </View>

      {/* Category chips */}
      <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Category</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.value;
          return (
            <Pressable
              key={cat.value}
              testID={`category-${cat.value}`}
              onPress={() => setCategory(cat.value)}
              className={`rounded-full px-4 py-1.5 ${
                isActive ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Message input */}
      <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Message</Text>
      <TextInput
        testID="feedback-message"
        value={message}
        onChangeText={setMessage}
        placeholder="Tell us what you think... (min 10 characters)"
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={4}
        maxLength={500}
        className="mb-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        style={{ textAlignVertical: 'top', minHeight: 96 }}
        accessibilityLabel="Feedback message"
      />
      <Text className="mb-4 text-right text-xs text-gray-400">{message.length}/500</Text>

      {/* Error */}
      {error !== null && (
        <Text testID="feedback-error" className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </Text>
      )}

      {/* Submit */}
      <Pressable
        testID="btn-submit-feedback"
        onPress={submit}
        disabled={isSubmitDisabled}
        className={`items-center rounded-xl py-3 ${
          isSubmitDisabled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-600'
        }`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitDisabled }}
      >
        <Text
          className={`text-base font-semibold ${isSubmitDisabled ? 'text-gray-400' : 'text-white'}`}
        >
          {isLoading ? 'Sending...' : 'Send Feedback'}
        </Text>
      </Pressable>
    </View>
  );
}
