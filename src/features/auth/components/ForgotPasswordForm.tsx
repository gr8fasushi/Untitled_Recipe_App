import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { sendPasswordReset, getAuthErrorMessage } from '../services/authService';
import { ForgotPasswordSchema } from '../types';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(): Promise<void> {
    setEmailError(undefined);
    setGeneralError(undefined);

    const result = ForgotPasswordSchema.safeParse({ email: email.trim() });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setEmailError(fieldErrors.email?.[0]);
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordReset(result.data.email);
      setSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setGeneralError(getAuthErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <View testID="forgot-password-success">
        <View className="mb-6 rounded-xl bg-green-50 px-4 py-4">
          <Text className="text-green-800 font-semibold text-base mb-1">Check your email</Text>
          <Text className="text-green-700 text-sm">
            We&apos;ve sent password reset instructions to {email.trim()}.
          </Text>
        </View>
        <Pressable onPress={onBack} testID="btn-back-to-sign-in">
          <Text className="text-center text-primary-600 font-semibold text-base">
            Back to Sign In
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {generalError !== undefined && (
        <View className="mb-4 rounded-xl bg-red-50 px-4 py-3" testID="forgot-password-error">
          <Text className="text-red-700 text-sm">{generalError}</Text>
        </View>
      )}

      <Text className="text-gray-600 text-sm mb-4">
        Enter your email and we&apos;ll send you a link to reset your password.
      </Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        error={emailError}
        testID="input-email"
      />

      <Button
        label={isLoading ? 'Sending…' : 'Send Reset Link'}
        onPress={handleSubmit}
        disabled={isLoading}
        testID="btn-send-reset"
      />

      {isLoading && (
        <ActivityIndicator className="mt-4" testID="forgot-password-loading" color="#2563eb" />
      )}

      <Pressable onPress={onBack} testID="btn-back" className="mt-4">
        <Text className="text-center text-gray-600 text-sm">Back to Sign In</Text>
      </Pressable>
    </View>
  );
}
