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
        isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl">{preference.icon}</Text>
          <Text
            className={`text-base font-semibold ${
              isSelected ? 'text-primary-700' : 'text-gray-900'
            }`}
          >
            {preference.name}
          </Text>
        </View>
        <View
          testID={`${testID ?? 'dietary-card'}-checkmark`}
          className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
            isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'
          }`}
        >
          {isSelected && <Text className="text-xs font-bold text-white">✓</Text>}
        </View>
      </View>
    </Pressable>
  );
}
