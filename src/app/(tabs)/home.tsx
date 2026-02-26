import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageContainer } from '@/shared/components/ui';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface TileProps {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  testID: string;
  accentColor?: string;
}

function Tile({
  emoji,
  title,
  subtitle,
  onPress,
  testID,
  accentColor = '#fff7ed',
}: TileProps): React.JSX.Element {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:opacity-75"
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: accentColor }}
      >
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <Text className="text-base font-nunito-bold text-gray-900 mb-0.5">{title}</Text>
      <Text className="text-xs font-nunito text-gray-500" numberOfLines={2}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const greeting = getGreeting();
  const name = profile?.displayName ?? '';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="home-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header */}
        <View className="w-full items-center bg-primary-700">
          <View className="w-full max-w-2xl">
            <LinearGradient
              colors={['#c2410c', '#ea580c', '#fb923c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="px-6 pt-6 pb-8">
                <Text className="text-3xl mb-1">🍽️</Text>
                <Text className="text-2xl font-nunito-bold text-white">
                  {greeting}
                  {name ? `, ${name}` : ''}!
                </Text>
                <Text className="text-orange-200 text-sm mt-1 font-nunito">
                  What would you like to cook today?
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <PageContainer className="px-4 mt-5">
          {/* Row 1 */}
          <View className="flex-row gap-3 mb-3">
            <Tile
              emoji="🥘"
              title="Cook from Pantry"
              subtitle="Use what you have to generate recipes"
              onPress={() => router.push('/(tabs)/pantry')}
              testID="tile-cook-pantry"
              accentColor="#fff7ed"
            />
            <Tile
              emoji="🔍"
              title="Search Recipes"
              subtitle="Find a specific dish by name"
              onPress={() => router.push('/(tabs)/recipe-search')}
              testID="tile-search-recipes"
              accentColor="#eff6ff"
            />
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-3">
            <Tile
              emoji="⭐"
              title="Popular Recipes"
              subtitle="See what the community is cooking"
              onPress={() => router.push('/(tabs)/community')}
              testID="tile-popular-recipes"
              accentColor="#fefce8"
            />
            <Tile
              emoji="🔖"
              title="My Saved"
              subtitle="Recipes you've bookmarked"
              onPress={() => router.push('/(tabs)/saved')}
              testID="tile-my-saved"
              accentColor="#f0fdf4"
            />
          </View>
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
