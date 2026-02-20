import { View, Text } from 'react-native';

// TODO Feature 10: Implement profile & settings
// TODO Feature 11: Account deletion (required for App Store)
export default function ProfileScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      <Text className="mt-2 text-gray-500">Settings & account — coming in Feature 10</Text>
    </View>
  );
}
