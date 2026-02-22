import { Stack } from 'expo-router';

export default function OnboardingLayout(): React.JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="disclaimer" />
      <Stack.Screen name="allergens" />
      <Stack.Screen name="dietary" />
    </Stack>
  );
}
