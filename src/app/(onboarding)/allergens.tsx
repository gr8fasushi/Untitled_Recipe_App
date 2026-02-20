import { View, Text } from 'react-native';

// TODO Feature 3: Implement Big 9 allergen selection
export default function AllergensScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900">Allergens</Text>
      <Text className="mt-2 text-gray-500 text-center">
        Select your allergens — coming in Feature 3
      </Text>
    </View>
  );
}
