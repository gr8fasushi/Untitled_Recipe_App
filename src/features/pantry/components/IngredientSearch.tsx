import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Input } from '@/shared/components/ui';
import { searchIngredients } from '@/constants/ingredients';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import type { PantryItem } from '@/features/pantry/types';

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
      className={`flex-row items-center justify-between px-4 py-3 border-b border-gray-100 ${
        isSelected ? 'opacity-40' : ''
      }`}
    >
      <View className="flex-row items-center gap-3">
        {item.emoji ? <Text className="text-xl">{item.emoji}</Text> : null}
        <View>
          <Text className="text-base text-gray-900">{item.name}</Text>
          {item.category ? <Text className="text-xs text-gray-400">{item.category}</Text> : null}
        </View>
      </View>
      {isSelected ? (
        <Text
          testID={`ingredient-row-${item.id}-check`}
          className="text-primary-600 font-semibold text-sm"
        >
          Added ✓
        </Text>
      ) : (
        <Text className="text-primary-600 font-semibold text-sm">+ Add</Text>
      )}
    </Pressable>
  );
}

export function IngredientSearch(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const { selectedIngredients, addIngredient } = usePantryStore();

  const results = searchIngredients(query);
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
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
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
            <Text className="text-gray-400">No ingredients found for &quot;{query}&quot;</Text>
          </View>
        }
      />
    </View>
  );
}
