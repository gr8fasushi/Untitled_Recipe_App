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
import { BackgroundDecor, DECOR_SETS, PageContainer } from '@/shared/components/ui';
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
      setError('Failed to load pantry. Please try again.');
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
      ? (['#022c22', '#064e3b', '#065f46'] as const)
      : (['#064e3b', '#065f46', '#10b981'] as const));
  const pantryEmoji = holiday?.bannerEmoji ?? '🥘';
  const [pSil0, pSil1, pSil2] = holiday?.silhouetteEmojis ?? ['🥦', '🥕', '🍅'];
  const pantrySubtitleColor = holiday?.subtitleHexColor ?? '#6ee7b7'; // emerald-300

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="pantry-screen">
      <BackgroundDecor items={DECOR_SETS.pantry} />
      {/* Gradient header — emerald/green fresh ingredients theme */}
      <LinearGradient
        colors={[pantryGradient[0], pantryGradient[1], pantryGradient[2]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="items-center w-full">
          <View
            className={`w-full max-w-2xl px-6 pt-6 ${isWeb ? 'pb-10' : 'pb-8'} overflow-hidden`}
          >
            {/* Emoji silhouettes */}
            <View
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              pointerEvents="none"
            >
              <Text
                style={{ position: 'absolute', fontSize: 95, opacity: 0.18, top: -8, right: 12 }}
              >
                {pSil0}
              </Text>
              <Text
                style={{ position: 'absolute', fontSize: 70, opacity: 0.15, top: 22, right: 105 }}
              >
                {pSil1}
              </Text>
              <Text
                style={{ position: 'absolute', fontSize: 80, opacity: 0.15, top: -5, right: 185 }}
              >
                {pSil2}
              </Text>
            </View>
            {/* Emoji + title stacked (matching other tabs) */}
            <Text className="text-5xl mb-1">{pantryEmoji}</Text>
            <Text
              className={`${isWeb ? 'text-5xl' : 'text-3xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              My Pantry
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
          <Text className="mt-3 text-gray-400 font-nunito">Loading pantry…</Text>
        </View>
      ) : (
        <PageContainer>
          {/* Ingredient chips + Clear All — now in PageContainer */}
          {ingredientCount > 0 ? (
            <View className="px-4 pt-4 pb-2">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-nunito-bold text-gray-700">
                  Your Pantry ({ingredientCount})
                </Text>
                <Pressable
                  testID="btn-clear-pantry"
                  onPress={clearPantry}
                  className="active:opacity-75"
                >
                  <Text className="text-xs font-nunito-bold text-red-400">Clear all</Text>
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
            <View testID="scan-analyzing" className="mx-4 mt-2 rounded-xl bg-orange-50 px-4 py-2">
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

          {/* Find Recipes CTA — visible when ingredients are selected */}
          {ingredientCount > 0 ? (
            <View className="px-4 mt-2 mb-4">
              <Pressable
                onPress={() => router.push('/(tabs)/recipes')}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-accent-600 py-3"
                testID="btn-go-to-recipes"
              >
                <Text className="text-white font-nunito-bold text-base">Find Recipes →</Text>
              </Pressable>
            </View>
          ) : null}
        </PageContainer>
      )}
    </SafeAreaView>
  );
}
