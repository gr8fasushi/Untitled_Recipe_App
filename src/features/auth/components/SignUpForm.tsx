import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { signUpWithEmail, getAuthErrorMessage } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { SignUpSchema } from '../types';

interface SignUpFormProps {
  onSuccess: () => void;
  onSignIn: () => void;
}

export function SignUpForm({ onSuccess, onSignIn }: SignUpFormProps): React.JSX.Element {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | undefined>();

  const isLoading = useAuthStore((s) => s.isLoading);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleSubmit(): Promise<void> {
    setDisplayNameError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setConfirmPasswordError(undefined);
    setGeneralError(undefined);

    const result = SignUpSchema.safeParse({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setDisplayNameError(fieldErrors.displayName?.[0]);
      setEmailError(fieldErrors.email?.[0]);
      setPasswordError(fieldErrors.password?.[0]);
      setConfirmPasswordError(fieldErrors.confirmPassword?.[0]);
      return;
    }

    try {
      setLoading(true);
      const { user } = await signUpWithEmail(
        result.data.email,
        result.data.password,
        result.data.displayName
      );
      setUser(user);
      onSuccess();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setGeneralError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      {generalError !== undefined && (
        <View className="mb-4 rounded-xl bg-red-50 px-4 py-3" testID="sign-up-general-error">
          <Text className="text-red-700 text-sm">{generalError}</Text>
        </View>
      )}

      <Input
        label="Name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        error={displayNameError}
        testID="input-display-name"
      />

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="next"
        error={emailError}
        testID="input-email"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="next"
        error={passwordError}
        testID="input-password"
      />

      <Input
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repeat password"
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        error={confirmPasswordError}
        testID="input-confirm-password"
      />

      <Button
        label={isLoading ? 'Creating account…' : 'Create Account'}
        onPress={handleSubmit}
        disabled={isLoading}
        testID="btn-sign-up"
      />

      {isLoading && <ActivityIndicator className="mt-4" testID="sign-up-loading" color="#2563eb" />}

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-600 text-sm">Already have an account? </Text>
        <Pressable onPress={onSignIn} testID="link-sign-in">
          <Text className="text-primary-600 text-sm font-semibold">Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}
