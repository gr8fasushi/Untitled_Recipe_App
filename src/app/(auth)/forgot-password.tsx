import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="mb-10">
            <Text className="text-3xl font-bold text-gray-900">Reset Password</Text>
            <Text className="mt-2 text-gray-500 text-base">We&apos;ll send you a reset link.</Text>
          </View>

          <ForgotPasswordForm onBack={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
