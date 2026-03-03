import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const isWeb = Platform.OS === 'web';
const TAB_ICON_SIZE = isWeb ? 28 : 22;

export default function TabLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ea580c',
        tabBarInactiveTintColor: '#a8a29e',
        tabBarStyle: {
          backgroundColor: '#1c1917',
          borderTopColor: '#292524',
          borderTopWidth: 1,
          ...Platform.select({
            web: { height: 88, paddingBottom: 16, paddingTop: 10 },
            default: { height: 68, paddingBottom: 10, paddingTop: 6 },
          }),
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_600SemiBold',
          letterSpacing: 0.2,
          ...Platform.select({
            web: { fontSize: 14 },
            default: { fontSize: 11 },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'My Kitchen',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'basket' : 'basket-outline'}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      {/* Hidden screens — push navigation only */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="recipes" options={{ href: null }} />
      <Tabs.Screen name="scan" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="recipe-detail" options={{ href: null }} />
      <Tabs.Screen name="saved-recipe-detail" options={{ href: null }} />
      <Tabs.Screen name="community-recipe-detail" options={{ href: null }} />
      <Tabs.Screen name="delete-account" options={{ href: null }} />
      <Tabs.Screen name="privacy-policy" options={{ href: null }} />
    </Tabs>
  );
}
