import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { SignInForm } from '@/features/auth/components/SignInForm';
import { SocialSignInButton } from '@/features/auth/components/SocialSignInButton';
import { useGoogleSignIn } from '@/features/auth/hooks/useGoogleSignIn';
import { useAppleSignIn } from '@/features/auth/hooks/useAppleSignIn';

export default function SignInScreen(): React.JSX.Element {
  const router = useRouter();
  const { signInWithGoogle, isAvailable: isGoogleAvailable } = useGoogleSignIn();
  const { signInWithApple, isAvailable: isAppleAvailable } = useAppleSignIn();

  function handleSuccess(): void {
    router.replace('/');
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="mb-10 items-center">
            <Text className="text-4xl font-bold text-primary-600">RecipeApp</Text>
            <Text className="mt-2 text-gray-500 text-base">Sign in to your account</Text>
          </View>

          <SignInForm
            onSuccess={handleSuccess}
            onForgotPassword={() => router.push('/(auth)/forgot-password')}
            onSignUp={() => router.push('/(auth)/sign-up')}
          />

          {(isGoogleAvailable || isAppleAvailable) && (
            <View className="mt-6">
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="mx-4 text-gray-400 text-sm">or continue with</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <View className="gap-3">
                {isGoogleAvailable && (
                  <SocialSignInButton
                    provider="google"
                    onPress={() => void signInWithGoogle()}
                    testID="btn-google-sign-in"
                  />
                )}
                {isAppleAvailable && (
                  <SocialSignInButton provider="apple" onPress={() => void signInWithApple()} />
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
