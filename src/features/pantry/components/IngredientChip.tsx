import { Pressable, Text, View } from 'react-native';
import type { PantryItem } from '@/features/pantry/types';

interface IngredientChipProps {
  ingredient: PantryItem;
  onRemove: () => void;
  testID?: string;
}

function getCategoryColors(category: string | undefined): {
  bg: string;
  text: string;
  remove: string;
} {
  switch (category) {
    case 'Proteins':
      return {
        bg: 'bg-red-100 dark:bg-red-900/40',
        text: 'text-red-800 dark:text-red-200',
        remove: 'bg-red-300 dark:bg-red-700',
      };
    case 'Dairy':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/40',
        text: 'text-yellow-800 dark:text-yellow-200',
        remove: 'bg-yellow-300 dark:bg-yellow-700',
      };
    case 'Vegetables':
      return {
        bg: 'bg-green-100 dark:bg-green-900/40',
        text: 'text-green-800 dark:text-green-200',
        remove: 'bg-green-300 dark:bg-green-700',
      };
    case 'Fruits':
      return {
        bg: 'bg-pink-100 dark:bg-pink-900/40',
        text: 'text-pink-800 dark:text-pink-200',
        remove: 'bg-pink-300 dark:bg-pink-700',
      };
    case 'Grains':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        text: 'text-amber-800 dark:text-amber-200',
        remove: 'bg-amber-300 dark:bg-amber-700',
      };
    case 'Legumes':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/40',
        text: 'text-orange-800 dark:text-orange-200',
        remove: 'bg-orange-300 dark:bg-orange-700',
      };
    case 'Herbs & Spices':
      return {
        bg: 'bg-lime-100 dark:bg-lime-900/40',
        text: 'text-lime-800 dark:text-lime-200',
        remove: 'bg-lime-300 dark:bg-lime-700',
      };
    case 'Nuts & Seeds':
      return {
        bg: 'bg-stone-200 dark:bg-stone-700',
        text: 'text-stone-800 dark:text-stone-200',
        remove: 'bg-stone-400 dark:bg-stone-500',
      };
    case 'Custom':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/40',
        text: 'text-purple-800 dark:text-purple-200',
        remove: 'bg-purple-300 dark:bg-purple-700',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        remove: 'bg-gray-300 dark:bg-gray-500',
      };
  }
}

export function IngredientChip({
  ingredient,
  onRemove,
  testID,
}: IngredientChipProps): React.JSX.Element {
  const colors = getCategoryColors(ingredient.category);

  return (
    <View
      testID={testID}
      className={`flex-row items-center rounded-full ${colors.bg} px-3 py-1.5 mr-2 mb-2`}
    >
      {ingredient.emoji ? <Text className="text-base mr-1">{ingredient.emoji}</Text> : null}
      <Text className={`text-sm font-semibold ${colors.text}`}>{ingredient.name}</Text>
      <Pressable
        onPress={onRemove}
        testID={`${testID ?? 'ingredient-chip'}-remove`}
        accessibilityLabel={`Remove ${ingredient.name}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
        className={`ml-1.5 h-4 w-4 items-center justify-center rounded-full ${colors.remove}`}
      >
        <Text className={`text-xs font-bold ${colors.text} leading-none`}>×</Text>
      </Pressable>
    </View>
  );
}
