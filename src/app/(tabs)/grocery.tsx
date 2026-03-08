import { FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGroceryList } from '@/features/grocery';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import { PageContainer } from '@/shared/components/ui';
import type { GroceryItem } from '@/features/grocery';

export default function GroceryScreen(): React.JSX.Element {
  const { items, isLoading, removeItem, toggleChecked, clearChecked, clearAll } = useGroceryList();
  const isDark = useIsDarkMode();
  const isWeb = Platform.OS === 'web';

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="grocery-screen">
      {/* Gradient banner — teal theme (mirrors scan.tsx) */}
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
          <View className={`w-full max-w-2xl px-6 pt-3 ${isWeb ? 'pb-6' : 'pb-5'} overflow-hidden`}>
            <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>🛒</Text>
            <Text
              className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              Grocery List
            </Text>
            <Text
              style={{ color: '#99f6e4' }}
              className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
            >
              {items.length === 0
                ? 'Add ingredients from any recipe'
                : `${items.length} item${items.length !== 1 ? 's' : ''} — ${checkedCount} checked`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <PageContainer className="px-4 mt-4 flex-1">
        {/* Action row */}
        {items.length > 0 ? (
          <View className="flex-row gap-2 mb-4">
            <Pressable
              testID="btn-clear-checked"
              disabled={checkedCount === 0}
              onPress={clearChecked}
              className={`flex-1 py-2.5 rounded-xl border items-center ${
                checkedCount > 0
                  ? 'bg-white border-teal-300 dark:bg-gray-800 dark:border-teal-600'
                  : 'bg-gray-100 border-gray-200 dark:bg-gray-900 dark:border-gray-700 opacity-50'
              }`}
              accessibilityState={{ disabled: checkedCount === 0 }}
            >
              <Text
                className={`text-sm font-nunito-bold ${
                  checkedCount > 0
                    ? 'text-teal-700 dark:text-teal-400'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                Clear Checked
              </Text>
            </Pressable>
            <Pressable
              testID="btn-clear-all"
              onPress={clearAll}
              className="flex-1 py-2.5 rounded-xl border border-red-200 bg-white dark:bg-gray-800 dark:border-red-800 items-center"
            >
              <Text className="text-sm font-nunito-bold text-red-600 dark:text-red-400">
                Clear All
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* List */}
        {isLoading ? (
          <View testID="grocery-loading" className="mt-16 items-center">
            <Text className="text-gray-400 font-nunito">Loading...</Text>
          </View>
        ) : items.length === 0 ? (
          <View testID="grocery-empty" className="mt-16 items-center px-4">
            <Text className="text-4xl mb-3">🛒</Text>
            <Text className="text-base font-nunito-bold text-gray-700 dark:text-gray-300 text-center mb-1">
              Your grocery list is empty
            </Text>
            <Text className="text-sm font-nunito text-gray-500 dark:text-gray-400 text-center">
              Add ingredients from any recipe using the &quot;Add to Grocery List&quot; button.
            </Text>
          </View>
        ) : (
          <FlatList<GroceryItem>
            data={items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item }) => (
              <View
                testID={`grocery-item-${item.id}`}
                className={`flex-row items-center py-3 px-4 mb-2 rounded-2xl bg-white dark:bg-gray-800 border shadow-sm ${
                  item.checked
                    ? 'border-teal-100 dark:border-teal-900 opacity-60'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                {/* Checkbox */}
                <Pressable
                  testID={`grocery-checkbox-${item.id}`}
                  onPress={() => toggleChecked(item.id)}
                  className="mr-3"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.checked }}
                >
                  <Ionicons
                    name={item.checked ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={item.checked ? '#0f766e' : '#9ca3af'}
                  />
                </Pressable>

                {/* Name + amount */}
                <View className="flex-1">
                  <Text
                    className={`text-sm font-nunito-bold text-gray-900 dark:text-gray-100 ${
                      item.checked ? 'line-through' : ''
                    }`}
                  >
                    {item.name}
                    {item.optional ? (
                      <Text className="text-gray-400 font-nunito"> (optional)</Text>
                    ) : null}
                  </Text>
                  {item.amount || item.unit ? (
                    <Text className="text-xs font-nunito text-gray-500 dark:text-gray-400 mt-0.5">
                      {[item.amount, item.unit].filter(Boolean).join(' ')}
                    </Text>
                  ) : null}
                  <Text className="text-xs font-nunito text-gray-400 dark:text-gray-500 mt-0.5">
                    {item.recipeTitle}
                  </Text>
                </View>

                {/* Remove */}
                <Pressable
                  testID={`grocery-remove-${item.id}`}
                  onPress={() => removeItem(item.id)}
                  className="ml-2 p-1"
                >
                  <Ionicons name="close-circle-outline" size={20} color="#9ca3af" />
                </Pressable>
              </View>
            )}
          />
        )}
      </PageContainer>
    </SafeAreaView>
  );
}
