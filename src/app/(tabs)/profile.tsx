import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { BackgroundDecor, DECOR_SETS } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { AllergenCard } from '@/features/onboarding/components/AllergenCard';
import { DietaryPreferenceCard } from '@/features/onboarding/components/DietaryPreferenceCard';
import { DisclaimerCard } from '@/features/onboarding/components/DisclaimerCard';
import { BIG_9_ALLERGENS, DIETARY_PREFERENCES } from '@/constants/allergens';
import { useProfileSettings } from '@/features/profile/hooks/useProfileSettings';
import { VoicePicker } from '@/features/profile/components/VoicePicker';
import { FeedbackSection } from '@/features/profile/components/FeedbackSection';
import { useUIStore } from '@/stores/uiStore';
import type { ColorSchemePreference } from '@/stores/uiStore';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';

const APPEARANCE_OPTIONS: { label: string; value: ColorSchemePreference; emoji: string }[] = [
  { label: 'Light', value: 'light', emoji: '☀️' },
  { label: 'Dark', value: 'dark', emoji: '🌙' },
  { label: 'System', value: 'system', emoji: '⚙️' },
];

export default function ProfileScreen(): React.JSX.Element {
  const {
    email,
    displayName,
    selectedAllergens,
    selectedDietaryPreferences,
    isLoading,
    error,
    hasChanges,
    setDisplayName,
    toggleAllergen,
    toggleDietaryPreference,
    saveChanges,
    signOut,
  } = useProfileSettings();

  const router = useRouter();
  const version = (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';
  const isWeb = Platform.OS === 'web';
  const colorScheme = useUIStore((s) => s.colorScheme);
  const setColorScheme = useUIStore((s) => s.setColorScheme);
  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const profileGradient =
    holiday?.gradient ??
    (isDark
      ? (['#1e3a8a', '#1e40af', '#2563eb'] as const)
      : (['#1e3a8a', '#1d4ed8', '#60a5fa'] as const));
  const profileEmoji = holiday?.bannerEmoji ?? '👤';
  const [prSil0, prSil1, prSil2] = holiday?.silhouetteEmojis ?? ['👤', '⚙️', '🔒'];
  const profileSubtitleColor = holiday?.subtitleHexColor ?? '#bfdbfe'; // blue-200

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="profile-screen">
      <BackgroundDecor items={DECOR_SETS.profile} />
      {/* Gradient header — navy/blue account theme */}
      <LinearGradient
        colors={[profileGradient[0], profileGradient[1], profileGradient[2]]}
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
                style={{ position: 'absolute', fontSize: 95, opacity: 0.18, top: -8, right: 12 }}
              >
                {prSil0}
              </Text>
              <Text
                style={{ position: 'absolute', fontSize: 70, opacity: 0.15, top: 22, right: 105 }}
              >
                {prSil1}
              </Text>
              <Text
                style={{ position: 'absolute', fontSize: 80, opacity: 0.15, top: -5, right: 185 }}
              >
                {prSil2}
              </Text>
            </View>
            <Text className="text-5xl mb-1">{profileEmoji}</Text>
            <Text
              className={`${isWeb ? 'text-5xl' : 'text-3xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              Profile
            </Text>
            <Text
              style={{ color: profileSubtitleColor }}
              className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
            >
              Manage your account and preferences
            </Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="w-full max-w-2xl self-center">
          {/* Account section */}
          <View className="px-4 pt-6">
            <Text className="mb-4 text-lg font-bold text-gray-900">Account</Text>
            <Input
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              testID="input-display-name"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={() => undefined}
              editable={false}
              autoCapitalize="none"
              keyboardType="email-address"
              testID="input-email"
            />
          </View>

          {/* Allergens section */}
          <View className="px-4 pt-6">
            <Text className="mb-4 text-lg font-bold text-gray-900">Allergens</Text>
            {BIG_9_ALLERGENS.map((allergen) => (
              <AllergenCard
                key={allergen.id}
                allergen={allergen}
                isSelected={selectedAllergens.includes(allergen.id)}
                onToggle={() => {
                  toggleAllergen(allergen.id);
                }}
                testID={`card-allergen-${allergen.id}`}
              />
            ))}
          </View>

          {/* Dietary preferences section */}
          <View className="px-4 pt-6">
            <Text className="mb-4 text-lg font-bold text-gray-900">Dietary Preferences</Text>
            {DIETARY_PREFERENCES.map((pref) => (
              <DietaryPreferenceCard
                key={pref.id}
                preference={pref}
                isSelected={selectedDietaryPreferences.includes(pref.id)}
                onToggle={() => {
                  toggleDietaryPreference(pref.id);
                }}
                testID={`card-dietary-${pref.id}`}
              />
            ))}
          </View>

          {/* Appearance section */}
          <View className="px-4 pt-6">
            <Text className="mb-4 text-lg font-bold text-gray-900">Appearance</Text>
            <View className="flex-row gap-2">
              {APPEARANCE_OPTIONS.map(({ label, value, emoji }) => {
                const isActive = colorScheme === value;
                return (
                  <Pressable
                    key={value}
                    testID={`btn-appearance-${value}`}
                    onPress={() => setColorScheme(value)}
                    className={`flex-1 items-center py-3 px-2 rounded-xl border ${
                      isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className="text-xl mb-1">{emoji}</Text>
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Voice section */}
          <View className="px-4 pt-6">
            <Text className="mb-2 text-lg font-bold text-gray-900">AI Voice</Text>
            <Text className="text-sm text-gray-500 font-nunito mb-3">
              Choose the voice used when reading recipe instructions aloud.
            </Text>
            <VoicePicker />
          </View>

          {/* Feedback section */}
          <View className="px-4 pt-6">
            <FeedbackSection />
          </View>

          {/* Disclaimer + Save */}
          <View className="px-4 pt-6">
            <DisclaimerCard />
            {error !== null && (
              <Text className="mb-4 mt-2 text-sm text-red-600" testID="profile-error">
                {error}
              </Text>
            )}
            {isLoading && (
              <ActivityIndicator testID="profile-loading" size="large" className="my-4" />
            )}
            <Button
              label="Save Changes"
              onPress={() => {
                void saveChanges();
              }}
              disabled={!hasChanges || isLoading}
              testID="btn-save-profile"
            />
          </View>

          {/* Account actions */}
          <View className="mx-4 mt-8 border-t border-gray-100 pt-6">
            <Text className="mb-4 text-lg font-bold text-gray-900">Account Actions</Text>
            <Button
              label="Sign Out"
              variant="secondary"
              onPress={() => {
                void signOut();
              }}
              testID="btn-sign-out"
            />
            <View className="mt-3">
              <Button
                label="Privacy Policy"
                variant="secondary"
                onPress={() => {
                  router.push('/(tabs)/privacy-policy');
                }}
                testID="btn-privacy-policy"
              />
            </View>
            <View className="mt-3">
              <Button
                label="Delete Account"
                variant="danger"
                onPress={() => {
                  router.push('/(tabs)/delete-account');
                }}
                testID="btn-delete-account"
              />
            </View>
          </View>

          {/* App version */}
          <View className="items-center py-6">
            <Text className="text-sm text-gray-400" testID="app-version">
              Version {version}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
