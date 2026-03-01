import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" testID="scan-screen">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Scan Ingredients</Text>
          <Text className="mt-1 text-sm text-gray-500">
            Take a photo to identify food ingredients, or search manually below.
          </Text>
        </View>

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
                label={`Add ${count} to Pantry`}
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
