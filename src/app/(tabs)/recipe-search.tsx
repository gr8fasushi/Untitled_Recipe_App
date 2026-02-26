import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/shared/services/firebase/firebase.config';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
import { RecipeSummaryCard } from '@/features/recipes/components/RecipeSummaryCard';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { PageContainer } from '@/shared/components/ui';
import type { Recipe } from '@/shared/types';

export default function RecipeSearchScreen(): React.JSX.Element {
  const router = useRouter();
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(): Promise<void> {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    try {
      // Prefix search on community-recipes by title
      const recipesRef = collection(db, 'community-recipes');
      const titleQuery = query(
        recipesRef,
        where('title', '>=', q),
        where('title', '<=', q + '\uf8ff'),
        orderBy('title'),
        limit(10)
      );
      const snapshot = await getDocs(titleQuery);
      const found = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Recipe);
      setResults(found);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAIGenerate(): Promise<void> {
    const q = searchQuery.trim();
    if (!q) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateRecipeFn({
        ingredients: [{ id: 'search-dish', name: q }],
        allergens: [],
        dietaryPreferences: [],
      });
      setResults(result.data.recipes);
    } catch {
      setError('Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleViewFull(recipe: Recipe): void {
    setCurrentRecipe(recipe);
    router.push('/(tabs)/recipe-detail');
  }

  const showAIButton = hasSearched && !isSearching && results.length < 3;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="recipe-search-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {/* Gradient header */}
        <View className="w-full items-center bg-primary-700">
          <View className="w-full max-w-2xl">
            <LinearGradient
              colors={['#c2410c', '#ea580c', '#fb923c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="px-6 pt-5 pb-6">
                <Text className="text-3xl mb-1">🔍</Text>
                <Text className="text-2xl font-nunito-bold text-white">Search Recipes</Text>
                <Text className="text-orange-200 text-sm mt-1 font-nunito">
                  Find a dish by name or keyword
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <PageContainer className="px-4 mt-4">
          {/* Search input */}
          <View className="flex-row gap-2">
            <TextInput
              testID="input-recipe-search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => void handleSearch()}
              placeholder="e.g. tacos, pasta, chicken stir fry…"
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-nunito text-gray-900"
            />
            <Pressable
              testID="btn-search"
              onPress={() => void handleSearch()}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="bg-primary-600 rounded-xl px-4 items-center justify-center active:opacity-75"
            >
              <Text className="text-white font-nunito-bold text-sm">Search</Text>
            </Pressable>
          </View>

          {/* Error */}
          {error ? (
            <View className="mt-3 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-nunito text-red-700">{error}</Text>
            </View>
          ) : null}

          {/* Loading */}
          {isSearching ? (
            <View testID="search-loading" className="mt-8 items-center">
              <ActivityIndicator size="large" color="#ea580c" />
              <Text className="mt-3 font-nunito text-gray-400">Searching…</Text>
            </View>
          ) : null}

          {/* Results */}
          {!isSearching && results.length > 0 ? (
            <View testID="search-results" className="mt-5">
              <Text className="text-sm font-nunito-semibold text-gray-500 mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </Text>
              {results.map((recipe, index) => (
                <RecipeSummaryCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewFull={() => handleViewFull(recipe)}
                  testID={`search-result-${index}`}
                />
              ))}
            </View>
          ) : null}

          {/* Empty state */}
          {hasSearched && !isSearching && results.length === 0 ? (
            <View testID="search-empty" className="mt-8 items-center px-4">
              <Text className="text-4xl mb-3">🍽️</Text>
              <Text className="text-base font-nunito-bold text-gray-700 text-center mb-1">
                No recipes found
              </Text>
              <Text className="text-sm font-nunito text-gray-500 text-center">
                Try a different search term, or let AI generate one for you.
              </Text>
            </View>
          ) : null}

          {/* AI Generate fallback */}
          {showAIButton ? (
            <View className="mt-4">
              <Pressable
                testID="btn-ai-generate"
                onPress={() => void handleAIGenerate()}
                disabled={isGenerating}
                className="rounded-xl border border-primary-200 bg-primary-50 py-3 items-center"
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#ea580c" />
                ) : (
                  <Text className="text-sm font-nunito-bold text-primary-700">
                    ✨ Generate with AI instead
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
