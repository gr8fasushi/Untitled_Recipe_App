import { View, Text } from 'react-native';

// TODO Feature 9: Implement saved recipes from Firestore
export default function SavedScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Saved Recipes</Text>
      <Text className="mt-2 text-gray-500">Firestore saved recipes — coming in Feature 9</Text>
    </View>
  );
}
