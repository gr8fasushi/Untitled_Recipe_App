import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

export default function SignUpScreen(): React.JSX.Element {
  const router = useRouter();

  function handleSuccess(): void {
    router.replace('/');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="mb-10 items-center">
            <Text className="text-4xl font-bold text-primary-600">RecipeApp</Text>
            <Text className="mt-2 text-gray-500 text-base">Create your account</Text>
          </View>

          <SignUpForm onSuccess={handleSuccess} onSignIn={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
