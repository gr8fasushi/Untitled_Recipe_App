import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { useIngredientSearch } from '@/features/pantry/hooks/useIngredientSearch';
import { cacheIngredient } from '@/features/pantry/services/pantryService';
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

interface IngredientSearchProps {
  /** When provided, uses this list instead of the pantry store for "Added ✓" state. */
  controlledIngredients?: PantryItem[];
  /** When provided, calls this instead of pantryStore.addIngredient. */
  onControlledAdd?: (item: PantryItem) => void;
}

export function IngredientSearch({
  controlledIngredients,
  onControlledAdd,
}: IngredientSearchProps = {}): React.JSX.Element {
  const [query, setQuery] = useState('');
  const textInputRef = useRef<TextInput>(null);
  const { selectedIngredients: storeIngredients, addIngredient: storeAdd } = usePantryStore();
  const { results, isSearching, error } = useIngredientSearch(query);

  const selectedIngredients = controlledIngredients ?? storeIngredients;
  const addIngredient = onControlledAdd ?? storeAdd;

  const hasQuery = query.trim().length >= 2;
  const selectedIds = new Set(selectedIngredients.map((i) => i.id));

  function handleAdd(item: PantryItem): void {
    addIngredient(item);
    // Only cache USDA items when in pantry mode (not controlled/recipe-search mode)
    if (item.id.startsWith('usda-') && !onControlledAdd) {
      void cacheIngredient(item);
    }
    setQuery('');
    textInputRef.current?.focus();
  }

  function handleAddCustom(): void {
    const name = query.trim();
    if (!name) return;
    addIngredient({
      id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      category: 'Custom',
    });
    setQuery('');
    textInputRef.current?.focus();
  }

  return (
    <View testID="ingredient-search" className="flex-1">
      <View className="px-4 pt-4 pb-2">
        <TextInput
          ref={textInputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search any ingredient…"
          placeholderTextColor="#9ca3af"
          testID="ingredient-search-input"
          autoCapitalize="none"
          returnKeyType="search"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900"
        />
      </View>

      {!hasQuery ? (
        <View testID="ingredient-search-prompt" className="items-center py-4 px-6">
          <Text className="text-4xl mb-3">🔍</Text>
          <Text className="text-gray-600 text-base font-semibold">Search any ingredient</Text>
          <Text className="text-gray-400 text-sm mt-1 text-center">
            Type 2+ characters to search millions of ingredients
          </Text>
        </View>
      ) : isSearching ? (
        <View testID="ingredient-search-loading" className="items-center py-4">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-gray-400 text-sm mt-3">Searching…</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 180 }}
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <IngredientRow
              item={item}
              isSelected={selectedIds.has(item.id)}
              onPress={() => handleAdd(item)}
            />
          )}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            error ? (
              <View
                testID="ingredient-search-error"
                className="mb-3 rounded-xl bg-amber-50 px-4 py-3"
              >
                <Text className="text-amber-700 text-sm">{error}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View testID="ingredient-search-empty" className="items-center py-8">
              <Text className="text-2xl mb-2">🤷</Text>
              <Text className="text-gray-500 font-medium">
                No results for &quot;{query.trim()}&quot;
              </Text>
              <Text className="text-gray-400 text-sm mt-1 mb-4">
                Add it as a custom ingredient instead
              </Text>
              <Pressable
                onPress={handleAddCustom}
                testID="btn-add-custom"
                className="bg-purple-100 px-5 py-2.5 rounded-full"
              >
                <Text className="text-purple-700 font-semibold text-sm">
                  + Add &quot;{query.trim()}&quot;
                </Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* Custom add — always available when user has typed something */}
      {hasQuery && !isSearching && results.length > 0 && (
        <View className="px-4 pb-4 pt-1">
          <Pressable
            onPress={handleAddCustom}
            testID="btn-add-custom-inline"
            className="flex-row items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-purple-300 bg-purple-50"
          >
            <Text className="text-purple-600 font-semibold text-sm">
              + Add &quot;{query.trim()}&quot; as custom
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
