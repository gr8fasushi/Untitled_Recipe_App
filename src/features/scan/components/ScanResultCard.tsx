import { Pressable, Text, View } from 'react-native';
import type { PantryItem } from '@/features/pantry/types';

interface ScanResultCardProps {
  ingredient: PantryItem;
  onRemove: () => void;
  testID?: string;
}

export function ScanResultCard({
  ingredient,
  onRemove,
  testID,
}: ScanResultCardProps): React.JSX.Element {
  const resolvedTestID = testID ?? `scan-result-${ingredient.id}`;
  return (
    <View
      testID={resolvedTestID}
      className="flex-row items-center justify-between px-4 py-3 bg-gray-50 rounded-xl mb-2"
    >
      <View className="flex-row items-center gap-3">
        {ingredient.emoji ? <Text className="text-2xl">{ingredient.emoji}</Text> : null}
        <Text testID={`${resolvedTestID}-name`} className="text-base font-medium text-gray-900">
          {ingredient.name}
        </Text>
      </View>
      <Pressable
        onPress={onRemove}
        testID={`${resolvedTestID}-remove`}
        accessibilityLabel={`Remove ${ingredient.name}`}
        className="p-2"
      >
        <Text className="text-gray-400 text-lg">×</Text>
      </Pressable>
    </View>
  );
}
