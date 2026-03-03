import { Text, View, type TextStyle } from 'react-native';

interface DecorItem {
  emoji: string;
  size: number;
  opacity?: number;
  bottom?: number | string;
  top?: number | string;
  right?: number | string;
  left?: number | string;
  rotate?: string;
}

interface BackgroundDecorProps {
  items: DecorItem[];
}

/**
 * Renders large faint emoji decorations absolutely positioned behind page content.
 * Wrap the parent in `position: relative` (flex-1 containers already satisfy this).
 */
export function BackgroundDecor({ items }: BackgroundDecorProps): React.JSX.Element {
  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="none"
    >
      {items.map((item, i) => (
        <Text
          key={i}
          style={
            {
              position: 'absolute',
              fontSize: item.size,
              opacity: item.opacity ?? 0.08,
              ...(item.top !== undefined ? { top: item.top } : {}),
              ...(item.bottom !== undefined ? { bottom: item.bottom } : {}),
              ...(item.right !== undefined ? { right: item.right } : {}),
              ...(item.left !== undefined ? { left: item.left } : {}),
              transform: item.rotate ? [{ rotate: item.rotate }] : [],
            } as TextStyle
          }
          aria-hidden
        >
          {item.emoji}
        </Text>
      ))}
    </View>
  );
}

// Pre-configured decor sets per tab theme (banner area — spread across banner height)
export const DECOR_SETS = {
  home: [
    { emoji: '🍽️', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '15deg' },
    { emoji: '🥘', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-12deg' },
    { emoji: '🍴', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-20deg' },
    { emoji: '🍲', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '8deg' },
    { emoji: '🫕', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '5deg' },
    { emoji: '🧂', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-8deg' },
    { emoji: '🥄', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '18deg' },
    { emoji: '🍳', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '22deg' },
  ],
  pantry: [
    { emoji: '🥦', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '10deg' },
    { emoji: '🥕', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-15deg' },
    { emoji: '🍅', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '18deg' },
    { emoji: '🌽', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-8deg' },
    { emoji: '🫑', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '6deg' },
    { emoji: '🧅', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-12deg' },
    { emoji: '🥑', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '14deg' },
    { emoji: '🥒', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '22deg' },
  ],
  recipes: [
    { emoji: '🍳', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '8deg' },
    { emoji: '🔥', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-10deg' },
    { emoji: '🥘', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-22deg' },
    { emoji: '🫙', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '12deg' },
    { emoji: '🫕', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '5deg' },
    { emoji: '🧂', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-15deg' },
    { emoji: '🥄', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '18deg' },
    { emoji: '🧅', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '-8deg' },
  ],
  saved: [
    { emoji: '🔖', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '12deg' },
    { emoji: '⭐', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-8deg' },
    { emoji: '❤️', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '15deg' },
    { emoji: '🌟', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-12deg' },
    { emoji: '📖', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '6deg' },
    { emoji: '🏆', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-8deg' },
    { emoji: '💫', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '20deg' },
    { emoji: '✨', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '-5deg' },
  ],
  profile: [
    { emoji: '👤', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '8deg' },
    { emoji: '🔒', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-12deg' },
    { emoji: '⚙️', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '18deg' },
    { emoji: '🛡️', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-8deg' },
    { emoji: '📱', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '5deg' },
    { emoji: '🔑', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-20deg' },
    { emoji: '💼', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '14deg' },
    { emoji: '🎯', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '-15deg' },
  ],
  chat: [
    { emoji: '👨‍🍳', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '12deg' },
    { emoji: '💬', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-8deg' },
    { emoji: '🍳', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-15deg' },
    { emoji: '📝', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '6deg' },
    { emoji: '🥄', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '10deg' },
    { emoji: '🌿', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-18deg' },
    { emoji: '✨', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '22deg' },
    { emoji: '🍽️', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '-10deg' },
  ],
  recipeSearch: [
    { emoji: '🔍', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '15deg' },
    { emoji: '📖', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-8deg' },
    { emoji: '🍽️', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-20deg' },
    { emoji: '📋', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '5deg' },
    { emoji: '🥘', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '5deg' },
    { emoji: '🔖', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-15deg' },
    { emoji: '🌟', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '18deg' },
    { emoji: '📌', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '-8deg' },
  ],
  community: [
    { emoji: '⭐', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '12deg' },
    { emoji: '👨‍🍳', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-10deg' },
    { emoji: '🌟', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '18deg' },
    { emoji: '🍝', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-8deg' },
    { emoji: '🥘', size: 110, opacity: 0.08, top: 80, right: 15, rotate: '5deg' },
    { emoji: '🌎', size: 90, opacity: 0.08, top: 100, left: 25, rotate: '-20deg' },
    { emoji: '🍜', size: 70, opacity: 0.06, top: 130, left: 100, rotate: '14deg' },
    { emoji: '🌮', size: 60, opacity: 0.07, top: 120, right: 130, rotate: '-12deg' },
  ],
} as const satisfies Record<string, DecorItem[]>;

// Body decor — placed as a sibling BEFORE PageContainer (inside ScrollView content).
// This ensures it spans the full page width (not constrained to the max-w-2xl column).
// Items use a mix of edge pixel values and percentage strings for wide horizontal spread.
// Opacity 0.08–0.11 for visibility without competing with card content.
export const BODY_DECOR_SETS: Record<string, DecorItem[]> = {
  home: [
    { emoji: '🍽️', size: 120, opacity: 0.1, top: 20, left: 15, rotate: '12deg' },
    { emoji: '🥘', size: 85, opacity: 0.09, top: 80, right: 20, rotate: '-8deg' },
    { emoji: '🍴', size: 100, opacity: 0.1, top: 160, left: '35%', rotate: '18deg' },
    { emoji: '🧂', size: 70, opacity: 0.08, top: 240, right: 30, rotate: '-15deg' },
    { emoji: '🫕', size: 115, opacity: 0.1, top: 320, left: '62%', rotate: '6deg' },
    { emoji: '🍲', size: 65, opacity: 0.09, top: 400, left: 20, rotate: '22deg' },
    { emoji: '🥄', size: 90, opacity: 0.08, top: 480, right: '18%', rotate: '-10deg' },
    { emoji: '🍳', size: 95, opacity: 0.1, top: 560, left: '45%', rotate: '14deg' },
    { emoji: '🌿', size: 75, opacity: 0.09, top: 640, right: 15, rotate: '-20deg' },
    { emoji: '🫙', size: 110, opacity: 0.1, top: 720, left: 25, rotate: '8deg' },
    { emoji: '🧅', size: 60, opacity: 0.08, top: 800, left: '55%', rotate: '-5deg' },
    { emoji: '🫚', size: 80, opacity: 0.09, top: 880, right: 35, rotate: '16deg' },
    { emoji: '🥗', size: 95, opacity: 0.1, top: 960, left: '30%', rotate: '-12deg' },
    { emoji: '🍜', size: 70, opacity: 0.08, top: 1040, left: 15, rotate: '20deg' },
  ],
  pantry: [
    { emoji: '🥦', size: 120, opacity: 0.1, top: 20, left: 15, rotate: '10deg' },
    { emoji: '🥕', size: 85, opacity: 0.09, top: 80, right: 20, rotate: '-12deg' },
    { emoji: '🍅', size: 100, opacity: 0.1, top: 160, left: '38%', rotate: '18deg' },
    { emoji: '🌽', size: 70, opacity: 0.08, top: 240, right: 30, rotate: '-8deg' },
    { emoji: '🫑', size: 115, opacity: 0.1, top: 320, left: '60%', rotate: '6deg' },
    { emoji: '🧅', size: 65, opacity: 0.09, top: 400, left: 20, rotate: '-20deg' },
    { emoji: '🥑', size: 90, opacity: 0.08, top: 480, right: '15%', rotate: '14deg' },
    { emoji: '🥒', size: 95, opacity: 0.1, top: 560, left: '42%', rotate: '22deg' },
    { emoji: '🍋', size: 75, opacity: 0.09, top: 640, right: 15, rotate: '-15deg' },
    { emoji: '🫛', size: 110, opacity: 0.1, top: 720, left: 25, rotate: '8deg' },
    { emoji: '🌶️', size: 60, opacity: 0.08, top: 800, left: '58%', rotate: '-5deg' },
    { emoji: '🍄', size: 80, opacity: 0.09, top: 880, right: 35, rotate: '16deg' },
    { emoji: '🫒', size: 95, opacity: 0.1, top: 960, left: '32%', rotate: '-12deg' },
    { emoji: '🧄', size: 70, opacity: 0.08, top: 1040, left: 15, rotate: '18deg' },
  ],
  recipes: [
    { emoji: '🍳', size: 120, opacity: 0.1, top: 20, left: 15, rotate: '10deg' },
    { emoji: '🔥', size: 85, opacity: 0.09, top: 80, right: 20, rotate: '-12deg' },
    { emoji: '🥘', size: 100, opacity: 0.1, top: 160, left: '36%', rotate: '8deg' },
    { emoji: '🫕', size: 70, opacity: 0.08, top: 240, right: 30, rotate: '-18deg' },
    { emoji: '🥄', size: 115, opacity: 0.1, top: 320, left: '62%', rotate: '6deg' },
    { emoji: '🧅', size: 65, opacity: 0.09, top: 400, left: 20, rotate: '20deg' },
    { emoji: '🧂', size: 90, opacity: 0.08, top: 480, right: '16%', rotate: '-8deg' },
    { emoji: '🫙', size: 95, opacity: 0.1, top: 560, left: '44%', rotate: '15deg' },
    { emoji: '🌿', size: 75, opacity: 0.09, top: 640, right: 15, rotate: '-20deg' },
    { emoji: '🍽️', size: 110, opacity: 0.1, top: 720, left: 25, rotate: '8deg' },
    { emoji: '🫚', size: 60, opacity: 0.08, top: 800, left: '56%', rotate: '-5deg' },
    { emoji: '🥗', size: 80, opacity: 0.09, top: 880, right: 35, rotate: '16deg' },
    { emoji: '🍜', size: 95, opacity: 0.1, top: 960, left: '30%', rotate: '-12deg' },
    { emoji: '🧆', size: 70, opacity: 0.08, top: 1040, left: 15, rotate: '20deg' },
  ],
  saved: [
    { emoji: '🔖', size: 120, opacity: 0.1, top: 20, left: 15, rotate: '12deg' },
    { emoji: '⭐', size: 85, opacity: 0.09, top: 80, right: 20, rotate: '-8deg' },
    { emoji: '❤️', size: 100, opacity: 0.1, top: 160, left: '38%', rotate: '15deg' },
    { emoji: '🏆', size: 70, opacity: 0.08, top: 240, right: 30, rotate: '-12deg' },
    { emoji: '📖', size: 115, opacity: 0.1, top: 320, left: '60%', rotate: '6deg' },
    { emoji: '🌟', size: 65, opacity: 0.09, top: 400, left: 20, rotate: '-18deg' },
    { emoji: '💫', size: 90, opacity: 0.08, top: 480, right: '14%', rotate: '20deg' },
    { emoji: '✨', size: 95, opacity: 0.1, top: 560, left: '44%', rotate: '-5deg' },
    { emoji: '🎖️', size: 75, opacity: 0.09, top: 640, right: 15, rotate: '-15deg' },
    { emoji: '🍽️', size: 110, opacity: 0.1, top: 720, left: 25, rotate: '8deg' },
    { emoji: '🥘', size: 60, opacity: 0.08, top: 800, left: '57%', rotate: '-5deg' },
    { emoji: '🍳', size: 80, opacity: 0.09, top: 880, right: 35, rotate: '16deg' },
    { emoji: '🌿', size: 95, opacity: 0.1, top: 960, left: '32%', rotate: '-12deg' },
    { emoji: '🧂', size: 70, opacity: 0.08, top: 1040, left: 15, rotate: '20deg' },
  ],
  profile: [
    { emoji: '👤', size: 120, opacity: 0.1, top: 20, left: 15, rotate: '8deg' },
    { emoji: '⚙️', size: 85, opacity: 0.09, top: 80, right: 20, rotate: '-12deg' },
    { emoji: '🔒', size: 100, opacity: 0.1, top: 160, left: '37%', rotate: '18deg' },
    { emoji: '🛡️', size: 70, opacity: 0.08, top: 240, right: 30, rotate: '-8deg' },
    { emoji: '📱', size: 115, opacity: 0.1, top: 320, left: '61%', rotate: '5deg' },
    { emoji: '🔑', size: 65, opacity: 0.09, top: 400, left: 20, rotate: '-20deg' },
    { emoji: '💼', size: 90, opacity: 0.08, top: 480, right: '15%', rotate: '14deg' },
    { emoji: '🎯', size: 95, opacity: 0.1, top: 560, left: '43%', rotate: '-15deg' },
    { emoji: '🍽️', size: 75, opacity: 0.09, top: 640, right: 15, rotate: '-20deg' },
    { emoji: '🌿', size: 110, opacity: 0.1, top: 720, left: 25, rotate: '8deg' },
    { emoji: '⭐', size: 60, opacity: 0.08, top: 800, left: '56%', rotate: '-5deg' },
    { emoji: '🥘', size: 80, opacity: 0.09, top: 880, right: 35, rotate: '16deg' },
    { emoji: '🍳', size: 95, opacity: 0.1, top: 960, left: '31%', rotate: '-12deg' },
    { emoji: '🧂', size: 70, opacity: 0.08, top: 1040, left: 15, rotate: '20deg' },
  ],
  community: [
    { emoji: '⭐', size: 120, opacity: 0.1, top: 20, left: 15, rotate: '12deg' },
    { emoji: '👨‍🍳', size: 85, opacity: 0.09, top: 80, right: 20, rotate: '-10deg' },
    { emoji: '🌟', size: 100, opacity: 0.1, top: 160, left: '38%', rotate: '18deg' },
    { emoji: '🍝', size: 70, opacity: 0.08, top: 240, right: 30, rotate: '-8deg' },
    { emoji: '🥘', size: 115, opacity: 0.1, top: 320, left: '60%', rotate: '5deg' },
    { emoji: '🌎', size: 65, opacity: 0.09, top: 400, left: 20, rotate: '-20deg' },
    { emoji: '🍜', size: 90, opacity: 0.08, top: 480, right: '16%', rotate: '14deg' },
    { emoji: '🌮', size: 95, opacity: 0.1, top: 560, left: '43%', rotate: '-12deg' },
    { emoji: '🍱', size: 75, opacity: 0.09, top: 640, right: 15, rotate: '-15deg' },
    { emoji: '🥗', size: 110, opacity: 0.1, top: 720, left: 25, rotate: '8deg' },
    { emoji: '🫕', size: 60, opacity: 0.08, top: 800, left: '57%', rotate: '-5deg' },
    { emoji: '🍣', size: 80, opacity: 0.09, top: 880, right: 35, rotate: '16deg' },
    { emoji: '🥘', size: 95, opacity: 0.1, top: 960, left: '32%', rotate: '-12deg' },
    { emoji: '🌯', size: 70, opacity: 0.08, top: 1040, left: 15, rotate: '20deg' },
  ],
  chat: [
    { emoji: '👨‍🍳', size: 120, opacity: 0.1, top: 20, left: 15, rotate: '12deg' },
    { emoji: '🍳', size: 85, opacity: 0.09, top: 80, right: 20, rotate: '-8deg' },
    { emoji: '💬', size: 100, opacity: 0.1, top: 160, left: '37%', rotate: '-15deg' },
    { emoji: '🥄', size: 70, opacity: 0.08, top: 240, right: 30, rotate: '10deg' },
    { emoji: '📝', size: 115, opacity: 0.1, top: 320, left: '61%', rotate: '6deg' },
    { emoji: '🌿', size: 65, opacity: 0.09, top: 400, left: 20, rotate: '-18deg' },
    { emoji: '✨', size: 90, opacity: 0.08, top: 480, right: '15%', rotate: '22deg' },
    { emoji: '🍽️', size: 95, opacity: 0.1, top: 560, left: '44%', rotate: '-10deg' },
    { emoji: '🥘', size: 75, opacity: 0.09, top: 640, right: 15, rotate: '-20deg' },
    { emoji: '🧂', size: 110, opacity: 0.1, top: 720, left: 25, rotate: '8deg' },
    { emoji: '🫙', size: 60, opacity: 0.08, top: 800, left: '56%', rotate: '-5deg' },
    { emoji: '🍲', size: 80, opacity: 0.09, top: 880, right: 35, rotate: '16deg' },
    { emoji: '🫕', size: 95, opacity: 0.1, top: 960, left: '31%', rotate: '-12deg' },
    { emoji: '🌶️', size: 70, opacity: 0.08, top: 1040, left: 15, rotate: '20deg' },
  ],
};
