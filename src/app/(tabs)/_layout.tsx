import { Tabs } from 'expo-router';

export default function TabLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // primary-600
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Pantry' }} />
      <Tabs.Screen name="recipes" options={{ title: 'Recipes' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
