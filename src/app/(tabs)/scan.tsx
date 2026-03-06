import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import { useScan } from '@/features/scan/hooks/useScan';
import { ScanResultCard } from '@/features/scan/components/ScanResultCard';
import { ManualIngredientSearch } from '@/features/scan/components/ManualIngredientSearch';
import { Button } from '@/shared/components/ui';

export default function ScanScreen(): React.JSX.Element {
  const {
    status,
    error,
    accumulatedIngredients,
    isAnalyzing,
    takePhoto,
    pickFromGallery,
    addManually,
    removeIngredient,
    addAllToPantry,
    clearAll,
  } = useScan();

  const count = accumulatedIngredients.length;
  const isDark = useIsDarkMode();
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="scan-screen">
      {/* Gradient header — teal/cyan photo scan theme */}
      <LinearGradient
        colors={isDark ? ['#042f2e', '#134e4a', '#0f766e'] : ['#134e4a', '#0f766e', '#14b8a6']}
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
          <View className={`w-full max-w-2xl px-6 pt-3 ${isWeb ? 'pb-8' : 'pb-6'}`}>
            <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>📷</Text>
            <Text
              className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              Scan Ingredients
            </Text>
            <Text
              className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              style={{ color: '#99f6e4' }}
            >
              Take a photo or search to add ingredients
            </Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Camera / Gallery buttons */}
        <View className="flex-row gap-3 px-4 pb-4">
          <View className="flex-1">
            <Button
              label={isAnalyzing ? 'Analyzing…' : '📷 Take Photo'}
              onPress={takePhoto}
              disabled={isAnalyzing}
              testID="btn-take-photo"
            />
          </View>
          <View className="flex-1">
            <Button
              label="🖼 From Library"
              onPress={pickFromGallery}
              disabled={isAnalyzing}
              variant="secondary"
              testID="btn-pick-gallery"
            />
          </View>
        </View>

        {/* Analyzing indicator */}
        {isAnalyzing ? (
          <View testID="scan-analyzing-indicator" className="flex-row items-center gap-2 px-4 pb-3">
            <ActivityIndicator size="small" color="#2563eb" />
            <Text className="text-sm text-gray-500">Analyzing photo…</Text>
          </View>
        ) : null}

        {/* Error banner */}
        {status === 'error' && error ? (
          <View testID="scan-error-banner" className="mx-4 mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        ) : null}

        {/* Manual search */}
        <View className="px-4 pb-4">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Or add manually
          </Text>
          <ManualIngredientSearch onAdd={addManually} alreadyAdded={accumulatedIngredients} />
        </View>

        {/* Accumulated ingredients list */}
        {count > 0 ? (
          <View className="px-4 pb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Detected ({count})
              </Text>
              <Pressable onPress={clearAll} testID="btn-clear-all">
                <Text className="text-sm text-red-500">Clear</Text>
              </Pressable>
            </View>

            <View testID="scan-results-list">
              {accumulatedIngredients.map((ingredient) => (
                <ScanResultCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  onRemove={() => removeIngredient(ingredient.id)}
                />
              ))}
            </View>

            <View className="mt-4">
              <Button
                label={`Add ${count} to My Kitchen`}
                onPress={addAllToPantry}
                testID="btn-add-all"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
