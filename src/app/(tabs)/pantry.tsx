import { useEffect, useCallback, useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { loadPantry, savePantry } from '@/features/pantry/services/pantryService';
import { useScan } from '@/features/scan/hooks/useScan';
import { IngredientChip } from '@/features/pantry/components/IngredientChip';
import { IngredientSearch } from '@/features/pantry/components/IngredientSearch';
import { PageContainer } from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';

export default function PantryScreen(): React.JSX.Element {
  const { user } = useAuthStore();
  const {
    selectedIngredients,
    isLoading,
    error,
    setLoading,
    setError,
    removeIngredient,
    clearPantry,
    addIngredient,
  } = usePantryStore();
  const router = useRouter();
  const isLoaded = useRef(false);

  const {
    takePhoto,
    pickFromGallery,
    isAnalyzing,
    status: scanStatus,
    error: scanError,
    accumulatedIngredients,
    clearAll,
  } = useScan();

  // Auto-add scanned ingredients to pantry when scan completes
  useEffect(() => {
    if (accumulatedIngredients.length > 0) {
      accumulatedIngredients.forEach((item) => addIngredient(item));
      clearAll();
    }
  }, [accumulatedIngredients, addIngredient, clearAll]);

  const handleLoad = useCallback(async (): Promise<void> => {
    if (!user) return;
    isLoaded.current = false;
    setLoading(true);
    setError(null);
    try {
      const ingredients = await loadPantry(user.uid);
      clearPantry();
      ingredients.forEach((item) => addIngredient(item));
    } catch {
      setError('Failed to load your kitchen. Please try again.');
    } finally {
      setLoading(false);
      isLoaded.current = true;
    }
  }, [user, setLoading, setError, clearPantry, addIngredient]);

  useEffect(() => {
    void handleLoad();
  }, [handleLoad]);

  // Auto-save whenever ingredients change (after initial load)
  useEffect(() => {
    if (!isLoaded.current || !user) return;
    const timer = setTimeout(() => {
      void savePantry(user.uid, selectedIngredients).catch(() => {
        setError('Auto-save failed. Your changes may not be saved.');
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedIngredients, user, setError]);

  const ingredientCount = selectedIngredients.length;
  const subtitle =
    ingredientCount > 0
      ? `${ingredientCount} ingredient${ingredientCount !== 1 ? 's' : ''} ready`
      : 'Search or scan below to add ingredients';
  const isWeb = Platform.OS === 'web';

  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const pantryGradient =
    holiday?.gradient ??
    (isDark
      ? (['#064e3b', '#065f46', '#047857'] as const)
      : (['#064e3b', '#065f46', '#10b981'] as const));
  const pantryEmoji = holiday?.bannerEmoji ?? '🥘';
  const pantrySubtitleColor = holiday?.subtitleHexColor ?? '#6ee7b7'; // emerald-300

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="pantry-screen">
      {/* Gradient header — emerald/green fresh ingredients theme */}
      <LinearGradient
        colors={[pantryGradient[0], pantryGradient[1], pantryGradient[2]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View className="items-center w-full">
          <View className={`w-full max-w-2xl px-6 pt-3 ${isWeb ? 'pb-6' : 'pb-5'} overflow-hidden`}>
            {/* Emoji + title stacked (matching other tabs) */}
            <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>{pantryEmoji}</Text>
            <Text
              className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              Add Your Ingredients
            </Text>
            <Text
              style={{ color: pantrySubtitleColor }}
              className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
            >
              {subtitle}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Loading state (initial load only) */}
      {isLoading && ingredientCount === 0 ? (
        <View testID="pantry-loading" className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="mt-3 text-gray-400 font-nunito">Loading your kitchen…</Text>
        </View>
      ) : (
        <>
          <View style={{ flex: 1 }}>
            <PageContainer>
              {/* Ingredient chips + Clear All — now in PageContainer */}
              {ingredientCount > 0 ? (
                <View className="px-4 pt-4 pb-2">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-nunito-bold text-gray-700 dark:text-gray-200">
                      My Kitchen ({ingredientCount})
                    </Text>
                    <Pressable
                      testID="btn-clear-pantry"
                      onPress={clearPantry}
                      className="flex-row items-center gap-1 bg-red-500/15 web:bg-red-500/30 border border-red-400/40 web:border-red-400/70 rounded-full px-3 py-1 active:opacity-75"
                    >
                      <Ionicons name="trash-outline" size={13} color="#f87171" />
                      <Text className="text-xs font-nunito-bold text-red-400">Clear All</Text>
                    </Pressable>
                  </View>
                  <View testID="pantry-chips" className="flex-row flex-wrap">
                    {selectedIngredients.map((ingredient) => (
                      <IngredientChip
                        key={ingredient.id}
                        ingredient={ingredient}
                        onRemove={() => removeIngredient(ingredient.id)}
                        testID={`chip-${ingredient.id}`}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Error banner */}
              {error ? (
                <View testID="pantry-error" className="mx-4 mt-3 rounded-xl bg-red-50 px-4 py-3">
                  <Text className="text-sm text-red-700 font-nunito">{error}</Text>
                </View>
              ) : null}

              {/* Empty hint */}
              {ingredientCount === 0 ? (
                <View testID="pantry-empty" className="px-4 pt-3 pb-1">
                  <Text className="text-sm text-gray-400 font-nunito">
                    No ingredients yet — search or scan below to add some.
                  </Text>
                </View>
              ) : null}

              {/* Scan buttons */}
              <View className="px-4 pt-3 pb-1 flex-row gap-2">
                <Pressable
                  testID="btn-scan-camera"
                  onPress={() => void takePhoto()}
                  disabled={isAnalyzing}
                  className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-primary-200 bg-primary-50 active:opacity-75"
                >
                  {isAnalyzing ? (
                    <ActivityIndicator size="small" color="#ea580c" />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={18} color="#c2410c" />
                      <Text className="text-sm font-nunito-bold text-primary-700">Take Photo</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  testID="btn-scan-gallery"
                  onPress={() => void pickFromGallery()}
                  disabled={isAnalyzing}
                  className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white active:opacity-75"
                >
                  <Ionicons name="images-outline" size={18} color="#6b7280" />
                  <Text className="text-sm font-nunito-bold text-gray-600">From Gallery</Text>
                </Pressable>
              </View>

              {isAnalyzing ? (
                <View
                  testID="scan-analyzing"
                  className="mx-4 mt-2 rounded-xl bg-orange-50 px-4 py-2"
                >
                  <Text className="text-xs font-nunito text-orange-700 text-center">
                    Scanning photo for ingredients…
                  </Text>
                </View>
              ) : null}

              {scanError ? (
                <View
                  testID="scan-error"
                  className="mx-4 mt-2 rounded-xl bg-red-50 px-4 py-2 border border-red-100"
                >
                  <Text className="text-xs font-nunito text-red-700 text-center">{scanError}</Text>
                </View>
              ) : null}

              {scanStatus === 'done' && accumulatedIngredients.length === 0 && !isAnalyzing ? (
                <View
                  testID="scan-empty"
                  className="mx-4 mt-2 rounded-xl bg-yellow-50 px-4 py-2 border border-yellow-100"
                >
                  <Text className="text-xs font-nunito text-yellow-700 text-center">
                    No ingredients detected. Try a clearer photo or add ingredients manually.
                  </Text>
                </View>
              ) : null}

              {/* Search + ingredient list */}
              <IngredientSearch />

              {/* How it works */}
              <View
                testID="pantry-how-it-works"
                className="mx-4 mt-4 mb-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4"
              >
                <Text className="text-sm font-nunito-bold text-gray-900 dark:text-white mb-3">
                  How it works
                </Text>
                {(
                  [
                    { emoji: '🥦', text: 'Search or scan to add your ingredients' },
                    {
                      emoji: '🍳',
                      text: 'Tap Find Recipes — Chef Jules will create meals from what you have',
                    },
                  ] as const
                ).map((step, i) => (
                  <View key={i} className={`flex-row items-start gap-3${i < 1 ? ' mb-3' : ''}`}>
                    <View className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center shrink-0">
                      <Text className="text-xs font-nunito-bold text-primary-700 dark:text-primary-300">
                        {i + 1}
                      </Text>
                    </View>
                    <Text className="text-xs font-nunito text-gray-600 dark:text-gray-300 flex-1 pt-0.5">
                      {step.emoji}
                      {'  '}
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Find Recipes CTA — visible when ingredients are selected */}
              {ingredientCount > 0 ? (
                <View className="px-4 mt-2 mb-4">
                  <Pressable
                    onPress={() => router.push('/(tabs)/recipes?autoSearch=true')}
                    className="flex-row items-center justify-center gap-2 rounded-xl bg-accent-600 py-3"
                    testID="btn-go-to-recipes"
                  >
                    <Text className="text-white font-nunito-bold text-base">Find Recipes →</Text>
                  </Pressable>
                </View>
              ) : null}
            </PageContainer>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
