import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { BackgroundDecor, DECOR_SETS, PageContainer } from '@/shared/components/ui';
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
      className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm active:opacity-75"
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

const DEFAULT_GRADIENT = ['#92400e', '#b45309', '#f59e0b'] as const;
const DEFAULT_GRADIENT_DARK = ['#78350f', '#92400e', '#b45309'] as const;
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
  const [sil0, sil1, sil2] = holiday?.silhouetteEmojis ?? DEFAULT_SILHOUETTES;
  const subtitleColor = holiday?.subtitleHexColor ?? DEFAULT_SUBTITLE_COLOR;
  const headingText = holiday
    ? `${holiday.greeting}${name ? `, ${name}` : ''}!`
    : `${greeting}${name ? `, ${name}` : ''}!`;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="home-screen">
      <BackgroundDecor items={DECOR_SETS.home} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header */}
        <LinearGradient
          colors={[gradient[0], gradient[1], gradient[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="items-center w-full">
            <View
              className={`w-full max-w-2xl px-6 pt-6 ${isWeb ? 'pb-10' : 'pb-8'} overflow-hidden`}
            >
              {/* Emoji silhouettes */}
              <View
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                pointerEvents="none"
              >
                <Text
                  style={{
                    position: 'absolute',
                    fontSize: 100,
                    opacity: 0.18,
                    top: -10,
                    right: 10,
                  }}
                >
                  {sil0}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 75, opacity: 0.15, top: 20, right: 105 }}
                >
                  {sil1}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 85, opacity: 0.15, top: -5, right: 185 }}
                >
                  {sil2}
                </Text>
              </View>
              <Text className="text-5xl mb-1">{bannerEmoji}</Text>
              <Text
                className={`${isWeb ? 'text-5xl' : 'text-3xl'} font-nunito-extrabold text-white tracking-tight`}
              >
                {headingText}
              </Text>
              <Text
                style={{ color: subtitleColor }}
                className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                What would you like to cook today?
              </Text>
            </View>
          </View>
        </LinearGradient>

        <PageContainer className="px-4 mt-5">
          {/* Row 1 */}
          <View className="flex-row gap-3 mb-3">
            <Tile
              emoji="🥘"
              title="Cook from Pantry"
              subtitle="Use what you have to generate recipes"
              onPress={() => router.push('/(tabs)/pantry')}
              testID="tile-cook-pantry"
              accentColor={holiday?.tileAccentHex ?? '#fff7ed'}
            />
            <Tile
              emoji="🔍"
              title="Find My Meal"
              subtitle="AI-generate recipes from your ingredients"
              onPress={() => router.push('/(tabs)/recipes')}
              testID="tile-search-recipes"
              accentColor={holiday?.tileAccentHex ?? '#eff6ff'}
            />
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-3">
            <Tile
              emoji="⭐"
              title="Popular Recipes"
              subtitle="Discover AI-curated recipes by cuisine"
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
              accentColor={holiday?.tileAccentHex ?? '#f0fdf4'}
            />
          </View>
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
