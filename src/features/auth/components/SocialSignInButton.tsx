import { Platform, Pressable, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AntDesign } from '@expo/vector-icons';

interface SocialSignInButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

export function SocialSignInButton({
  provider,
  onPress,
  disabled,
  testID,
}: SocialSignInButtonProps): React.JSX.Element | null {
  if (provider === 'apple') {
    if (Platform.OS !== 'ios') return null;
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={12}
        style={{ width: '100%', height: 48 }}
        onPress={onPress}
        // AppleAuthenticationButton does not accept testID — wrap if needed for testing
      />
    );
  }

  // Google button
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      className={`flex-row items-center justify-center border border-gray-300 rounded-xl px-4 py-3 bg-white ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <View className="mr-3">
        <AntDesign name="google" size={20} color="#EA4335" />
      </View>
      <Text className="text-gray-900 font-semibold text-base">Continue with Google</Text>
    </Pressable>
  );
}
