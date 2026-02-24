import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

// TODO Feature 11: Implement full account deletion flow (required for App Store)
export default function DeleteAccountScreen(): React.JSX.Element {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white" testID="delete-account-screen">
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <Pressable
          testID="btn-back"
          onPress={() => {
            router.back();
          }}
        >
          <Text className="text-lg font-medium text-primary-600">← Back</Text>
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-gray-900">Delete Account</Text>
      </View>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-base text-gray-500">
          Account deletion coming in a future update.
        </Text>
      </View>
    </SafeAreaView>
  );
}
