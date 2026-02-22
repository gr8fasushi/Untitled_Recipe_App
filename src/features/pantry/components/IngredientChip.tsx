import { Pressable, Text, View } from 'react-native';
import type { PantryItem } from '@/features/pantry/types';

interface IngredientChipProps {
  ingredient: PantryItem;
  onRemove: () => void;
  testID?: string;
}

export function IngredientChip({
  ingredient,
  onRemove,
  testID,
}: IngredientChipProps): React.JSX.Element {
  return (
    <View
      testID={testID}
      className="flex-row items-center rounded-full bg-primary-100 px-3 py-1.5 mr-2 mb-2"
    >
      {ingredient.emoji ? <Text className="text-sm mr-1">{ingredient.emoji}</Text> : null}
      <Text className="text-sm font-medium text-primary-800">{ingredient.name}</Text>
      <Pressable
        onPress={onRemove}
        testID={`${testID ?? 'ingredient-chip'}-remove`}
        accessibilityLabel={`Remove ${ingredient.name}`}
        accessibilityRole="button"
        className="ml-1.5 h-4 w-4 items-center justify-center rounded-full bg-primary-300"
      >
        <Text className="text-xs font-bold text-primary-800 leading-none">×</Text>
      </Pressable>
    </View>
  );
}
