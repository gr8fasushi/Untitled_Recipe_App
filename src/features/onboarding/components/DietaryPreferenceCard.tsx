import { Pressable, Text, View } from 'react-native';

interface DietaryPreference {
  id: string;
  name: string;
  icon: string;
}

interface DietaryPreferenceCardProps {
  preference: DietaryPreference;
  isSelected: boolean;
  onToggle: () => void;
  testID?: string;
}

export function DietaryPreferenceCard({
  preference,
  isSelected,
  onToggle,
  testID,
}: DietaryPreferenceCardProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onToggle}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${preference.name}${isSelected ? ', selected' : ''}`}
      className={`mb-3 rounded-xl border-2 p-4 ${
        isSelected
          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl">{preference.icon}</Text>
          <Text
            className={`text-base font-semibold ${
              isSelected ? 'text-primary-700' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {preference.name}
          </Text>
        </View>
        <View
          testID={`${testID ?? 'dietary-card'}-checkmark`}
          className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
            isSelected
              ? 'border-primary-600 bg-primary-600'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          }`}
        >
          {isSelected && <Text className="text-xs font-bold text-white">✓</Text>}
        </View>
      </View>
    </Pressable>
  );
}
