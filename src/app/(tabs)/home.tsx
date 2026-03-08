import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageContainer } from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';

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
      className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 active:opacity-75"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: accentColor }}
      >
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <Text className="text-base font-nunito-bold text-gray-900 dark:text-white mb-0.5">
        {title}
      </Text>
      <Text className="text-xs font-nunito text-gray-500 dark:text-gray-400" numberOfLines={2}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const DEFAULT_GRADIENT = ['#7c2d12', '#c2410c', '#f59e0b'] as const;
const DEFAULT_GRADIENT_DARK = ['#431407', '#7c2d12', '#c2410c'] as const;
const DEFAULT_SILHOUETTES = ['🍽️', '🥘', '🍴'] as const;
const DEFAULT_SUBTITLE_COLOR = '#fde68a'; // amber-200

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const greeting = getGreeting();
  const name = profile?.displayName ?? '';
  const isWeb = Platform.OS === 'web';

  const gradient = holiday?.gradient ?? (isDark ? DEFAULT_GRADIENT_DARK : DEFAULT_GRADIENT);
  const bannerEmoji = holiday?.bannerEmoji ?? DEFAULT_SILHOUETTES[0];
  const subtitleColor = holiday?.subtitleHexColor ?? DEFAULT_SUBTITLE_COLOR;
  const headingText = holiday
    ? `${holiday.greeting}${name ? `, ${name}` : ''}!`
    : `${greeting}${name ? `, ${name}` : ''}!`;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="home-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header */}
        <LinearGradient
          colors={[gradient[0], gradient[1], gradient[2]]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.28,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <View className="items-center w-full">
            <View className={`w-full max-w-2xl px-6 pt-3 ${isWeb ? 'pb-8' : 'pb-6'}`}>
              <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>{bannerEmoji}</Text>
              <Text
                className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
              >
                {headingText}
              </Text>
              <Text
                style={{ color: subtitleColor }}
                className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                {"Let's cook up a tasty meal!"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <PageContainer className="px-4 mt-5">
            {/* Row 1 */}
            <View className="flex-row gap-3 mb-3">
              <Tile
                emoji="🥦"
                title="Ingredient List"
                subtitle="View and manage your ingredients"
                onPress={() => router.push('/(tabs)/pantry')}
                testID="tile-cook-pantry"
                accentColor={holiday?.tileAccentHex ?? '#f0fdf4'}
              />
              <Tile
                emoji="🍳"
                title="Get Recipes"
                subtitle="Chef Jules picks recipes from your ingredients"
                onPress={() => router.push('/(tabs)/recipes')}
                testID="tile-search-recipes"
                accentColor={holiday?.tileAccentHex ?? '#fff7ed'}
              />
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-3">
              <Tile
                emoji="⭐"
                title="Popular Recipes"
                subtitle="Discover recipes by your own virtual chef"
                onPress={() => router.push('/(tabs)/community')}
                testID="tile-popular-recipes"
                accentColor={holiday?.tileAccentHex ?? '#fefce8'}
              />
              <Tile
                emoji="🔖"
                title="My Saved"
                subtitle="Recipes you've bookmarked"
                onPress={() => router.push('/(tabs)/saved')}
                testID="tile-my-saved"
                accentColor={holiday?.tileAccentHex ?? '#f5f3ff'}
              />
            </View>

            {/* How it works */}
            <View
              testID="how-it-works"
              className="mt-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4"
            >
              <Text className="text-sm font-nunito-bold text-gray-900 dark:text-white mb-3">
                How it works
              </Text>
              {(
                [
                  {
                    emoji: '🥦',
                    text: 'Add ingredients by tapping Ingredients - type, search, or snap a photo',
                  },
                  {
                    emoji: '🍳',
                    text: 'Tap Get Recipes — Chef Jules creates meals from what you have',
                  },
                  {
                    emoji: '🔖',
                    text: 'Save your favourites and ask Chef Jules cooking questions anytime',
                  },
                ] as const
              ).map((step, i) => (
                <View key={i} className={`flex-row items-start gap-3${i < 2 ? ' mb-3' : ''}`}>
                  <View className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center shrink-0">
                    <Text className="text-xs font-nunito-bold text-primary-700 dark:text-primary-300">
                      {i + 1}
                    </Text>
                  </View>
                  <Text className="text-xs font-nunito text-gray-600 dark:text-gray-300 flex-1 pt-0.5">
                    {step.emoji}
                    {'  '}
                    {step.text}
                  </Text>
                </View>
              ))}
            </View>
          </PageContainer>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
