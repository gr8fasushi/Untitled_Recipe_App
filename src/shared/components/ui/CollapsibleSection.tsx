import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface CollapsibleSectionProps {
  title: string;
  /** Number of active selections — shows a badge when > 0 */
  badge?: number;
  /** Start expanded. Defaults to false. */
  defaultExpanded?: boolean;
  children: React.ReactNode;
  testID?: string;
}

export function CollapsibleSection({
  title,
  badge,
  defaultExpanded = false,
  children,
  testID,
}: CollapsibleSectionProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View className="mb-4">
      <Pressable
        testID={testID ?? `collapsible-${title}`}
        onPress={() => setIsExpanded((v) => !v)}
        className="flex-row items-center justify-between py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-nunito-bold text-gray-700 dark:text-gray-200">{title}</Text>
          {badge != null && badge > 0 ? (
            <View className="bg-primary-600 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-[11px] font-nunito-bold text-white leading-tight">{badge}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
      </Pressable>
      {isExpanded ? <View className="pt-3">{children}</View> : null}
    </View>
  );
}
