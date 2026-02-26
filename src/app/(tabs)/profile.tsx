import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { AllergenCard } from '@/features/onboarding/components/AllergenCard';
import { DietaryPreferenceCard } from '@/features/onboarding/components/DietaryPreferenceCard';
import { DisclaimerCard } from '@/features/onboarding/components/DisclaimerCard';
import { BIG_9_ALLERGENS, DIETARY_PREFERENCES } from '@/constants/allergens';
import { useProfileSettings } from '@/features/profile/hooks/useProfileSettings';

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="profile-screen">
      {/* Gradient header */}
      <View className="w-full items-center bg-primary-700">
        <View className="w-full max-w-2xl">
          <LinearGradient
            colors={['#c2410c', '#ea580c', '#fb923c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="px-6 pt-5 pb-6">
              <Text className="text-3xl mb-1">👤</Text>
              <Text className="text-2xl font-nunito-bold text-white">Profile</Text>
              <Text className="text-orange-200 text-sm mt-1 font-nunito">
                Manage your account and preferences
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
