import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { signInWithEmail, getAuthErrorMessage } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { SignInSchema } from '../types';

interface SignInFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export function SignInForm({
  onSuccess,
  onForgotPassword,
  onSignUp,
}: SignInFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | undefined>();

  const isLoading = useAuthStore((s) => s.isLoading);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleSubmit(): Promise<void> {
    setEmailError(undefined);
    setPasswordError(undefined);
    setGeneralError(undefined);

    const result = SignInSchema.safeParse({ email: email.trim(), password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setEmailError(fieldErrors.email?.[0]);
      setPasswordError(fieldErrors.password?.[0]);
      return;
    }

    try {
      setLoading(true);
      const { user } = await signInWithEmail(result.data.email, result.data.password);
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
        <View className="mb-4 rounded-xl bg-red-50 px-4 py-3" testID="sign-in-general-error">
          <Text className="text-red-700 text-sm">{generalError}</Text>
        </View>
      )}

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
        placeholder="Password"
        secureTextEntry
        autoComplete="current-password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        error={passwordError}
        testID="input-password"
      />

      <Pressable onPress={onForgotPassword} testID="link-forgot-password" className="mb-4 self-end">
        <Text className="text-primary-600 text-sm font-medium">Forgot password?</Text>
      </Pressable>

      <Button
        label={isLoading ? 'Signing in…' : 'Sign In'}
        onPress={handleSubmit}
        disabled={isLoading}
        testID="btn-sign-in"
      />

      {isLoading && <ActivityIndicator className="mt-4" testID="sign-in-loading" color="#ea580c" />}

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-600 text-sm">Don&apos;t have an account? </Text>
        <Pressable onPress={onSignUp} testID="link-sign-up">
          <Text className="text-primary-600 text-sm font-semibold">Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}
