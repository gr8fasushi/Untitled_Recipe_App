import { Pressable, ScrollView, Text, View } from 'react-native';

interface RatingPickerProps {
  rating: number | null;
  onRatingChange: (rating: number | null) => void;
  testID?: string;
}

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function RatingPicker({
  rating,
  onRatingChange,
  testID = 'rating-picker',
}: RatingPickerProps): React.JSX.Element {
  return (
    <View testID={testID}>
      <Text className="text-sm font-semibold text-gray-700 mb-2">Your Rating</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 py-1">
          {RATINGS.map((n) => {
            const isSelected = rating === n;
            return (
              <Pressable
                key={n}
                testID={`${testID}-btn-${n}`}
                onPress={() => onRatingChange(isSelected ? null : n)}
                accessibilityLabel={`Rate ${n}`}
                accessibilityState={{ selected: isSelected }}
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isSelected ? 'bg-primary-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
