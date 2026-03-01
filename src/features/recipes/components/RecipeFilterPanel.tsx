import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { IngredientSearch } from '@/features/pantry/components/IngredientSearch';
import { CUISINES } from '@/constants/cuisines';
import type { FilterMode, RecipeFilters } from '@/features/recipes/hooks/useRecipeFilters';

const TABS: { mode: FilterMode; label: string }[] = [
  { mode: 'ingredients', label: '🥕 Ingredients' },
  { mode: 'cuisine', label: '🌍 Cuisine' },
  { mode: 'name', label: '🔎 By Name' },
];

interface RecipeFilterPanelProps {
  filters: RecipeFilters;
  testID?: string;
}

export function RecipeFilterPanel({
  filters,
  testID = 'recipe-filter-panel',
}: RecipeFilterPanelProps): React.JSX.Element {
  return (
    <View testID={testID}>
      {/* Mode tab bar */}
      <View className="flex-row gap-2 mb-4 flex-wrap">
        {TABS.map(({ mode, label }) => {
          const isActive = filters.mode === mode;
          return (
            <Pressable
              key={mode}
              testID={`filter-tab-${mode}`}
              onPress={() => filters.setMode(mode)}
              className={`px-4 py-2 rounded-full ${isActive ? 'bg-primary-600' : 'bg-gray-100'}`}
            >
              <Text
                className={`text-xs font-nunito-bold ${isActive ? 'text-white' : 'text-gray-600'}`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Mode content */}
      {filters.mode === 'name' ? (
        <View testID="filter-name-panel">
          <TextInput
            value={filters.searchName}
            onChangeText={filters.setSearchName}
            placeholder="Search by recipe name…"
            placeholderTextColor="#9ca3af"
            testID="filter-name-input"
            autoCapitalize="none"
            returnKeyType="search"
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900"
          />
        </View>
      ) : filters.mode === 'ingredients' ? (
        <View testID="filter-ingredients-panel">
          <IngredientSearch
            controlledIngredients={filters.selectedIngredients}
            onControlledAdd={filters.addIngredient}
          />
          {filters.selectedIngredients.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 -mx-1">
              {filters.selectedIngredients.map((ingredient) => (
                <Pressable
                  key={ingredient.id}
                  testID={`filter-chip-${ingredient.id}`}
                  onPress={() => filters.removeIngredient(ingredient.id)}
                  className="flex-row items-center gap-1 bg-primary-50 border border-primary-200 rounded-full px-3 py-1 mr-2"
                >
                  <Text className="text-xs font-nunito-bold text-primary-700">
                    {ingredient.name}
                  </Text>
                  <Text className="text-xs text-primary-400">×</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : (
        <View testID="filter-cuisine-panel">
          <View className="flex-row flex-wrap gap-2">
            {CUISINES.map((cuisine) => {
              const isActive = filters.selectedCuisines.includes(cuisine.id);
              return (
                <Pressable
                  key={cuisine.id}
                  testID={`filter-cuisine-${cuisine.id}`}
                  onPress={() => filters.toggleCuisine(cuisine.id)}
                  className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
                    isActive ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className="text-sm">{cuisine.emoji}</Text>
                  <Text
                    className={`text-xs font-nunito-bold ${
                      isActive ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {cuisine.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
