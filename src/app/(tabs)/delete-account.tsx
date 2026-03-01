import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/features/auth/store/authStore';
import { deleteUserAccount, getAuthErrorMessage } from '@/features/auth/services/authService';

export default function DeleteAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete(): Promise<void> {
    if (!user) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteUserAccount(user.uid);
      // Auth listener in _layout.tsx fires automatically and redirects to sign-in
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(getAuthErrorMessage(code));
      setIsDeleting(false);
    }
  }

  function handleDeletePress(): void {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void confirmDelete();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" testID="delete-account-screen">
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <Pressable
          testID="btn-back"
          onPress={() => {
            router.back();
          }}
        >
          <Text className="text-lg font-medium text-primary-600">← Back</Text>
        </Pressable>
        <Text testID="heading-delete-account" className="ml-3 text-lg font-bold text-gray-900">
          Delete Account
        </Text>
      </View>

      <View className="flex-1 px-4 pt-8">
        <Text className="mb-2 text-xl font-bold text-gray-900">
          Permanently delete your account
        </Text>
        <Text className="mb-6 text-base text-gray-600">
          Deleting your account will permanently remove all your data including your profile, saved
          recipes, and preferences. This action cannot be undone.
        </Text>

        {error !== null && (
          <Text className="mb-4 text-sm text-red-600" testID="delete-error">
            {error}
          </Text>
        )}
        {isDeleting && <ActivityIndicator testID="delete-loading" size="large" className="my-4" />}

        <Button
          label="Delete My Account"
          variant="danger"
          onPress={handleDeletePress}
          disabled={isDeleting}
          testID="btn-delete-confirm"
        />
      </View>
    </SafeAreaView>
  );
}
