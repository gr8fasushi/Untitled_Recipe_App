import { View, Text } from 'react-native';

// TODO Feature 2: Implement sign-in with email/password, Google, Apple
export default function SignInScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900">Sign In</Text>
      <Text className="mt-2 text-gray-500 text-center">Auth coming in Feature 2</Text>
    </View>
  );
}
