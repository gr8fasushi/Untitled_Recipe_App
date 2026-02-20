import { Redirect } from 'expo-router';

// TODO Feature 2: Replace with auth state check
// - Not signed in → /(auth)/sign-in
// - Signed in, no onboarding → /(onboarding)/welcome
// - Signed in, onboarded → /(tabs)
export default function Index(): React.JSX.Element {
  return <Redirect href="/(auth)/sign-in" />;
}
