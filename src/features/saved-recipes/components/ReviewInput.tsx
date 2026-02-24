import { TextInput, Text, View } from 'react-native';
import { MAX_REVIEW_LENGTH } from '../types';

interface ReviewInputProps {
  review: string;
  onReviewChange: (review: string) => void;
  testID?: string;
}

export function ReviewInput({
  review,
  onReviewChange,
  testID = 'review-input',
}: ReviewInputProps): React.JSX.Element {
  return (
    <View testID={testID}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-semibold text-gray-700">
          Your Review <Text className="text-xs text-gray-400 font-normal">(public if shared)</Text>
        </Text>
        <Text
          testID={`${testID}-counter`}
          className={`text-xs ${review.length > MAX_REVIEW_LENGTH ? 'text-red-500' : 'text-gray-400'}`}
        >
          {review.length}/{MAX_REVIEW_LENGTH}
        </Text>
      </View>
      <TextInput
        testID={`${testID}-input`}
        value={review}
        onChangeText={(text) => {
          if (text.length <= MAX_REVIEW_LENGTH) {
            onReviewChange(text);
          }
        }}
        placeholder="Share your thoughts on this recipe…"
        multiline
        numberOfLines={4}
        maxLength={MAX_REVIEW_LENGTH}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50 min-h-[80px]"
        textAlignVertical="top"
      />
    </View>
  );
}
