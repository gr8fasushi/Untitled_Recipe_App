import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

// TODO Feature 12: Implement privacy policy screen with full policy content
export default function PrivacyPolicyScreen(): React.JSX.Element {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white" testID="privacy-policy-screen">
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <Pressable
          testID="btn-back"
          onPress={() => {
            router.back();
          }}
        >
          <Text className="text-lg font-medium text-primary-600">← Back</Text>
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-gray-900">Privacy Policy</Text>
      </View>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-base text-gray-500">
          Privacy policy coming in a future update.
        </Text>
      </View>
    </SafeAreaView>
  );
}
