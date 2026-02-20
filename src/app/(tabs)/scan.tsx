import { View, Text } from 'react-native';

// TODO Feature 8: Implement Gemini Vision photo scanning
export default function ScanScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Scan Ingredients</Text>
      <Text className="mt-2 text-gray-500">Photo recognition — coming in Feature 8</Text>
    </View>
  );
}
