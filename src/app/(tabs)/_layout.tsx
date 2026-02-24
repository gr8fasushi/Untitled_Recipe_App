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
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      {/* Hidden screens — push nav only */}
      <Tabs.Screen name="recipe-detail" options={{ href: null }} />
      <Tabs.Screen name="saved-recipe-detail" options={{ href: null }} />
      <Tabs.Screen name="community-recipe-detail" options={{ href: null }} />
    </Tabs>
  );
}
