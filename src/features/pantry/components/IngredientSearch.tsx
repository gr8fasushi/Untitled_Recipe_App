import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Input } from '@/shared/components/ui';
import { searchIngredients } from '@/constants/ingredients';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import type { PantryItem } from '@/features/pantry/types';

function getCategoryBg(category: string | undefined): string {
  switch (category) {
    case 'Proteins':
      return 'bg-red-100';
    case 'Dairy':
      return 'bg-yellow-100';
    case 'Vegetables':
      return 'bg-green-100';
    case 'Fruits':
      return 'bg-pink-100';
    case 'Grains':
      return 'bg-amber-100';
    case 'Legumes':
      return 'bg-orange-100';
    case 'Herbs & Spices':
      return 'bg-lime-100';
    case 'Nuts & Seeds':
      return 'bg-stone-200';
    case 'Custom':
      return 'bg-purple-100';
    default:
      return 'bg-gray-100';
  }
}

interface IngredientRowProps {
  item: PantryItem;
  isSelected: boolean;
  onPress: () => void;
}

function IngredientRow({ item, isSelected, onPress }: IngredientRowProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={isSelected}
      testID={`ingredient-row-${item.id}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${item.name}${isSelected ? ', already added' : ', tap to add'}`}
      className={`flex-row items-center justify-between px-4 py-3.5 mb-2 rounded-2xl bg-white shadow-sm ${
        isSelected ? 'opacity-50' : ''
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${getCategoryBg(item.category)}`}
        >
          <Text className="text-xl">{item.emoji ?? '🥄'}</Text>
        </View>
        <View>
          <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
          {item.category ? (
            <Text className="text-xs text-gray-400 mt-0.5">{item.category}</Text>
          ) : null}
        </View>
      </View>

      {isSelected ? (
        <View
          testID={`ingredient-row-${item.id}-check`}
          className="bg-accent-100 px-3 py-1 rounded-full"
        >
          <Text className="text-accent-700 text-xs font-semibold">Added ✓</Text>
        </View>
      ) : (
        <View className="bg-primary-100 px-3 py-1 rounded-full">
          <Text className="text-primary-600 text-xs font-bold">+ Add</Text>
        </View>
      )}
    </Pressable>
  );
}

export function IngredientSearch(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const { selectedIngredients, addIngredient } = usePantryStore();

  const hasQuery = query.trim().length > 0;
  const results = hasQuery ? searchIngredients(query) : [];
  const selectedIds = new Set(selectedIngredients.map((i) => i.id));

  return (
    <View testID="ingredient-search" className="flex-1">
      <View className="px-4 pt-4 pb-2">
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search ingredients…"
          testID="ingredient-search-input"
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {!hasQuery ? (
        <View testID="ingredient-search-prompt" className="items-center py-16 px-6">
          <Text className="text-4xl mb-3">🔍</Text>
          <Text className="text-gray-600 text-base font-semibold">Find your ingredients</Text>
          <Text className="text-gray-400 text-sm mt-1 text-center">
            Type above to search and add to your pantry
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <IngredientRow
              item={item}
              isSelected={selectedIds.has(item.id)}
              onPress={() => addIngredient(item)}
            />
          )}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View testID="ingredient-search-empty" className="items-center py-12">
              <Text className="text-2xl mb-2">🤷</Text>
              <Text className="text-gray-500 font-medium">No results for &quot;{query}&quot;</Text>
              <Text className="text-gray-400 text-sm mt-1">Try a different ingredient name</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
