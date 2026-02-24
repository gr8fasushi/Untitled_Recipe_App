import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { searchIngredients } from '@/constants/ingredients';
import type { PantryItem } from '@/features/pantry/types';

interface ManualIngredientSearchProps {
  onAdd: (ingredient: PantryItem) => void;
  alreadyAdded: PantryItem[];
  testID?: string;
}

export function ManualIngredientSearch({
  onAdd,
  alreadyAdded,
  testID,
}: ManualIngredientSearchProps): React.JSX.Element {
  const [query, setQuery] = useState('');

  const results = query.trim().length > 0 ? searchIngredients(query).slice(0, 5) : [];
  const addedIds = new Set(alreadyAdded.map((i) => i.id));

  const handleSelect = (ingredient: PantryItem): void => {
    if (addedIds.has(ingredient.id)) return;
    onAdd(ingredient);
    setQuery('');
  };

  return (
    <View testID={testID}>
      <TextInput
        testID="manual-search-input"
        value={query}
        onChangeText={setQuery}
        placeholder="Search ingredients…"
        placeholderTextColor="#9ca3af"
        className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-white"
        returnKeyType="search"
        autoCorrect={false}
      />
      {results.length > 0 ? (
        <View className="mt-1 border border-gray-200 rounded-xl bg-white overflow-hidden">
          {results.map((item) => {
            const isAdded = addedIds.has(item.id);
            return (
              <Pressable
                key={item.id}
                testID={`manual-result-${item.id}`}
                onPress={() => handleSelect(item)}
                disabled={isAdded}
                className={`flex-row items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 ${isAdded ? 'opacity-50' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  {item.emoji ? <Text className="text-xl">{item.emoji}</Text> : null}
                  <Text className="text-base text-gray-900">{item.name}</Text>
                </View>
                {isAdded ? (
                  <Text
                    testID={`manual-result-${item.id}-check`}
                    className="text-primary-600 font-semibold"
                  >
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
