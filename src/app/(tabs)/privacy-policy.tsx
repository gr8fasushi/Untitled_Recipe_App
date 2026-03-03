import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

function Section({
  title,
  children,
  testID,
}: {
  title: string;
  children: string;
  testID?: string;
}): React.JSX.Element {
  return (
    <View className="mb-6" testID={testID}>
      <Text className="mb-2 text-base font-bold text-gray-900">{title}</Text>
      <Text className="text-sm leading-6 text-gray-600">{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen(): React.JSX.Element {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" testID="privacy-policy-screen">
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <Pressable
          testID="btn-back"
          onPress={() => {
            router.back();
          }}
        >
          <Text className="text-lg font-medium text-primary-600">← Back</Text>
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-gray-900">Privacy Policy</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        testID="privacy-policy-content"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="mb-1 text-xs text-gray-400">Effective date: February 24, 2026</Text>
        <Text className="mb-6 text-sm leading-6 text-gray-600">
          This Privacy Policy explains how RecipeApp (&quot;we&quot;, &quot;our&quot;, or
          &quot;us&quot;) collects, uses, and protects your information when you use our mobile
          application.
        </Text>

        <Section title="Data We Collect">
          {`We collect the following information to provide and improve our service:

• Account information: email address and display name (via Firebase Authentication).
• Dietary profile: allergens and dietary preferences you enter during onboarding or in settings.
• Pantry data: ingredient selections you make within the app.
• Saved recipes: recipes you save, including your personal notes (private) and reviews (public when shared).
• Community content: recipes and reviews you choose to share publicly.
• Ingredient photos: photos you submit for scanning are processed on our servers and immediately discarded — they are never stored.`}
        </Section>

        <Section title="How We Use Your Data">
          {`We use your data exclusively to operate and personalise the app:

• Personalise Chef Jules recipes based on your allergens and dietary preferences.
• Power Chef Jules, your virtual chef, within recipe sessions.
• Display community-shared recipes to other users.
• Sync your data across devices via your account.

We do not use your data for advertising. We do not sell your data to third parties.`}
        </Section>

        <Section title="Third-Party Services">
          {`We use the following third-party services:

• Google Firebase: authentication and database storage (Firestore). Subject to Google's Privacy Policy.
• AI providers (Groq, Google Gemini): ingredient and recipe data is processed via our server-side Cloud Functions only. No data is stored by these providers beyond the duration of the request.

We do not share your dietary or health-related information with any third party beyond what is described above.`}
        </Section>

        <Section title="Data Security">
          {`Your data is stored in Google Firebase infrastructure, which applies industry-standard security controls. Authentication tokens are stored in encrypted device storage. All AI processing is performed through our server-side Cloud Functions — your Groq and Gemini API keys are never exposed to the app or stored on your device.`}
        </Section>

        <Section title="Data Retention and Deletion">
          {`Your data is retained while your account is active. You may delete your account at any time via Account Settings → Delete Account. Deletion permanently removes all your data from Firestore and Firebase Authentication. There is no way to recover deleted accounts.`}
        </Section>

        <Section title="Children's Privacy">
          {`RecipeApp is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us and we will delete it promptly.`}
        </Section>

        <Section title="Changes to This Policy">
          {`We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the effective date above. Continued use of the app after changes are posted constitutes your acceptance of the updated policy.`}
        </Section>

        <Section title="Contact Us">
          {`If you have questions about this Privacy Policy or your data, please contact us at:\n\nprivacy@[yourdomain].com`}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
