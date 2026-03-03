import { Text, View } from 'react-native';

interface DecorItem {
  emoji: string;
  size: number;
  opacity?: number;
  bottom?: number;
  top?: number;
  right?: number;
  left?: number;
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
          style={{
            position: 'absolute',
            fontSize: item.size,
            opacity: item.opacity ?? 0.08,
            ...(item.top !== undefined ? { top: item.top } : {}),
            ...(item.bottom !== undefined ? { bottom: item.bottom } : {}),
            ...(item.right !== undefined ? { right: item.right } : {}),
            ...(item.left !== undefined ? { left: item.left } : {}),
            transform: item.rotate ? [{ rotate: item.rotate }] : [],
          }}
          aria-hidden
        >
          {item.emoji}
        </Text>
      ))}
    </View>
  );
}

// Pre-configured decor sets per tab theme (banner area — top + bottom anchored)
export const DECOR_SETS = {
  home: [
    { emoji: '🍽️', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '15deg' },
    { emoji: '🥘', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-12deg' },
    { emoji: '🍴', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-20deg' },
    { emoji: '🍲', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '8deg' },
    { emoji: '🫕', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '5deg' },
    { emoji: '🧂', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-8deg' },
    { emoji: '🥄', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '18deg' },
    { emoji: '🍳', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '22deg' },
  ],
  pantry: [
    { emoji: '🥦', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '10deg' },
    { emoji: '🥕', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-15deg' },
    { emoji: '🍅', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '18deg' },
    { emoji: '🌽', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-8deg' },
    { emoji: '🫑', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '6deg' },
    { emoji: '🧅', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-12deg' },
    { emoji: '🥑', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '14deg' },
    { emoji: '🥒', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '22deg' },
  ],
  recipes: [
    { emoji: '🍳', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '8deg' },
    { emoji: '🔥', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-10deg' },
    { emoji: '🥘', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-22deg' },
    { emoji: '🫙', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '12deg' },
    { emoji: '🫕', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '5deg' },
    { emoji: '🧂', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-15deg' },
    { emoji: '🥄', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '18deg' },
    { emoji: '🧅', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '-8deg' },
  ],
  saved: [
    { emoji: '🔖', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '12deg' },
    { emoji: '⭐', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-8deg' },
    { emoji: '❤️', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '15deg' },
    { emoji: '🌟', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-12deg' },
    { emoji: '📖', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '6deg' },
    { emoji: '🏆', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-8deg' },
    { emoji: '💫', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '20deg' },
    { emoji: '✨', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '-5deg' },
  ],
  profile: [
    { emoji: '👤', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '8deg' },
    { emoji: '🔒', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-12deg' },
    { emoji: '⚙️', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '18deg' },
    { emoji: '🛡️', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-8deg' },
    { emoji: '📱', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '5deg' },
    { emoji: '🔑', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-20deg' },
    { emoji: '💼', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '14deg' },
    { emoji: '🎯', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '-15deg' },
  ],
  chat: [
    { emoji: '👨‍🍳', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '12deg' },
    { emoji: '💬', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-8deg' },
    { emoji: '🍳', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-15deg' },
    { emoji: '📝', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '6deg' },
    { emoji: '🥄', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '10deg' },
    { emoji: '🌿', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-18deg' },
    { emoji: '✨', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '22deg' },
    { emoji: '🍽️', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '-10deg' },
  ],
  recipeSearch: [
    { emoji: '🔍', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '15deg' },
    { emoji: '📖', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-8deg' },
    { emoji: '🍽️', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '-20deg' },
    { emoji: '📋', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '5deg' },
    { emoji: '🥘', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '5deg' },
    { emoji: '🔖', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-15deg' },
    { emoji: '🌟', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '18deg' },
    { emoji: '📌', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '-8deg' },
  ],
  community: [
    { emoji: '⭐', size: 120, opacity: 0.1, top: 15, right: 10, rotate: '12deg' },
    { emoji: '👨‍🍳', size: 80, opacity: 0.07, top: 60, left: 20, rotate: '-10deg' },
    { emoji: '🌟', size: 65, opacity: 0.07, top: 25, right: 70, rotate: '18deg' },
    { emoji: '🍝', size: 90, opacity: 0.06, top: 50, left: 120, rotate: '-8deg' },
    { emoji: '🥘', size: 140, opacity: 0.1, bottom: 0, right: -10, rotate: '5deg' },
    { emoji: '🌎', size: 90, opacity: 0.08, bottom: 40, left: 25, rotate: '-20deg' },
    { emoji: '🍜', size: 70, opacity: 0.06, bottom: 20, left: 100, rotate: '14deg' },
    { emoji: '🌮', size: 60, opacity: 0.07, bottom: 5, right: 120, rotate: '-12deg' },
  ],
} as const satisfies Record<string, DecorItem[]>;

// Body decor — top-anchored, spread 20–1000px down page body. Shown on all platforms.
// Opacity 0.08–0.11 for clear visibility without competing with card content.
export const BODY_DECOR_SETS: Record<string, DecorItem[]> = {
  home: [
    { emoji: '🍽️', size: 120, opacity: 0.1, top: 20, right: 15, rotate: '12deg' },
    { emoji: '🥘', size: 85, opacity: 0.09, top: 80, left: 10, rotate: '-8deg' },
    { emoji: '🍴', size: 100, opacity: 0.1, top: 160, right: 70, rotate: '18deg' },
    { emoji: '🧂', size: 70, opacity: 0.08, top: 240, left: 85, rotate: '-15deg' },
    { emoji: '🫕', size: 115, opacity: 0.1, top: 320, right: 5, rotate: '6deg' },
    { emoji: '🍲', size: 65, opacity: 0.09, top: 380, left: 160, rotate: '22deg' },
    { emoji: '🥄', size: 90, opacity: 0.08, top: 450, right: 120, rotate: '-10deg' },
    { emoji: '🍳', size: 95, opacity: 0.1, top: 530, left: 20, rotate: '14deg' },
    { emoji: '🌿', size: 75, opacity: 0.09, top: 610, right: 50, rotate: '-20deg' },
    { emoji: '🫙', size: 110, opacity: 0.1, top: 680, left: 110, rotate: '8deg' },
    { emoji: '🧅', size: 60, opacity: 0.08, top: 760, right: 80, rotate: '-5deg' },
    { emoji: '🫚', size: 80, opacity: 0.09, top: 840, left: 40, rotate: '16deg' },
    { emoji: '🥗', size: 95, opacity: 0.1, top: 920, right: 140, rotate: '-12deg' },
    { emoji: '🍜', size: 70, opacity: 0.08, top: 1000, left: 15, rotate: '20deg' },
  ],
  pantry: [
    { emoji: '🥦', size: 120, opacity: 0.1, top: 20, right: 15, rotate: '10deg' },
    { emoji: '🥕', size: 85, opacity: 0.09, top: 80, left: 10, rotate: '-12deg' },
    { emoji: '🍅', size: 100, opacity: 0.1, top: 160, right: 70, rotate: '18deg' },
    { emoji: '🌽', size: 70, opacity: 0.08, top: 240, left: 85, rotate: '-8deg' },
    { emoji: '🫑', size: 115, opacity: 0.1, top: 320, right: 5, rotate: '6deg' },
    { emoji: '🧅', size: 65, opacity: 0.09, top: 380, left: 160, rotate: '-20deg' },
    { emoji: '🥑', size: 90, opacity: 0.08, top: 450, right: 120, rotate: '14deg' },
    { emoji: '🥒', size: 95, opacity: 0.1, top: 530, left: 20, rotate: '22deg' },
    { emoji: '🍋', size: 75, opacity: 0.09, top: 610, right: 50, rotate: '-15deg' },
    { emoji: '🫛', size: 110, opacity: 0.1, top: 680, left: 110, rotate: '8deg' },
    { emoji: '🌶️', size: 60, opacity: 0.08, top: 760, right: 80, rotate: '-5deg' },
    { emoji: '🍄', size: 80, opacity: 0.09, top: 840, left: 40, rotate: '16deg' },
    { emoji: '🫒', size: 95, opacity: 0.1, top: 920, right: 140, rotate: '-12deg' },
    { emoji: '🧄', size: 70, opacity: 0.08, top: 1000, left: 15, rotate: '18deg' },
  ],
  recipes: [
    { emoji: '🍳', size: 120, opacity: 0.1, top: 20, right: 15, rotate: '10deg' },
    { emoji: '🔥', size: 85, opacity: 0.09, top: 80, left: 10, rotate: '-12deg' },
    { emoji: '🥘', size: 100, opacity: 0.1, top: 160, right: 60, rotate: '8deg' },
    { emoji: '🫕', size: 70, opacity: 0.08, top: 240, left: 85, rotate: '-18deg' },
    { emoji: '🥄', size: 115, opacity: 0.1, top: 320, right: 5, rotate: '6deg' },
    { emoji: '🧅', size: 65, opacity: 0.09, top: 380, left: 160, rotate: '20deg' },
    { emoji: '🧂', size: 90, opacity: 0.08, top: 450, right: 120, rotate: '-8deg' },
    { emoji: '🫙', size: 95, opacity: 0.1, top: 530, left: 20, rotate: '15deg' },
    { emoji: '🌿', size: 75, opacity: 0.09, top: 610, right: 50, rotate: '-20deg' },
    { emoji: '🍽️', size: 110, opacity: 0.1, top: 680, left: 110, rotate: '8deg' },
    { emoji: '🫚', size: 60, opacity: 0.08, top: 760, right: 80, rotate: '-5deg' },
    { emoji: '🥗', size: 80, opacity: 0.09, top: 840, left: 40, rotate: '16deg' },
    { emoji: '🍜', size: 95, opacity: 0.1, top: 920, right: 140, rotate: '-12deg' },
    { emoji: '🧆', size: 70, opacity: 0.08, top: 1000, left: 15, rotate: '20deg' },
  ],
  saved: [
    { emoji: '🔖', size: 120, opacity: 0.1, top: 20, right: 15, rotate: '12deg' },
    { emoji: '⭐', size: 85, opacity: 0.09, top: 80, left: 10, rotate: '-8deg' },
    { emoji: '❤️', size: 100, opacity: 0.1, top: 160, right: 65, rotate: '15deg' },
    { emoji: '🏆', size: 70, opacity: 0.08, top: 240, left: 85, rotate: '-12deg' },
    { emoji: '📖', size: 115, opacity: 0.1, top: 320, right: 5, rotate: '6deg' },
    { emoji: '🌟', size: 65, opacity: 0.09, top: 380, left: 160, rotate: '-18deg' },
    { emoji: '💫', size: 90, opacity: 0.08, top: 450, right: 120, rotate: '20deg' },
    { emoji: '✨', size: 95, opacity: 0.1, top: 530, left: 20, rotate: '-5deg' },
    { emoji: '🎖️', size: 75, opacity: 0.09, top: 610, right: 50, rotate: '-15deg' },
    { emoji: '🍽️', size: 110, opacity: 0.1, top: 680, left: 110, rotate: '8deg' },
    { emoji: '🥘', size: 60, opacity: 0.08, top: 760, right: 80, rotate: '-5deg' },
    { emoji: '🍳', size: 80, opacity: 0.09, top: 840, left: 40, rotate: '16deg' },
    { emoji: '🌿', size: 95, opacity: 0.1, top: 920, right: 140, rotate: '-12deg' },
    { emoji: '🧂', size: 70, opacity: 0.08, top: 1000, left: 15, rotate: '20deg' },
  ],
  profile: [
    { emoji: '👤', size: 120, opacity: 0.1, top: 20, right: 15, rotate: '8deg' },
    { emoji: '⚙️', size: 85, opacity: 0.09, top: 80, left: 10, rotate: '-12deg' },
    { emoji: '🔒', size: 100, opacity: 0.1, top: 160, right: 65, rotate: '18deg' },
    { emoji: '🛡️', size: 70, opacity: 0.08, top: 240, left: 85, rotate: '-8deg' },
    { emoji: '📱', size: 115, opacity: 0.1, top: 320, right: 5, rotate: '5deg' },
    { emoji: '🔑', size: 65, opacity: 0.09, top: 380, left: 160, rotate: '-20deg' },
    { emoji: '💼', size: 90, opacity: 0.08, top: 450, right: 120, rotate: '14deg' },
    { emoji: '🎯', size: 95, opacity: 0.1, top: 530, left: 20, rotate: '-15deg' },
    { emoji: '🍽️', size: 75, opacity: 0.09, top: 610, right: 50, rotate: '-20deg' },
    { emoji: '🌿', size: 110, opacity: 0.1, top: 680, left: 110, rotate: '8deg' },
    { emoji: '⭐', size: 60, opacity: 0.08, top: 760, right: 80, rotate: '-5deg' },
    { emoji: '🥘', size: 80, opacity: 0.09, top: 840, left: 40, rotate: '16deg' },
    { emoji: '🍳', size: 95, opacity: 0.1, top: 920, right: 140, rotate: '-12deg' },
    { emoji: '🧂', size: 70, opacity: 0.08, top: 1000, left: 15, rotate: '20deg' },
  ],
  community: [
    { emoji: '⭐', size: 120, opacity: 0.1, top: 20, right: 15, rotate: '12deg' },
    { emoji: '👨‍🍳', size: 85, opacity: 0.09, top: 80, left: 10, rotate: '-10deg' },
    { emoji: '🌟', size: 100, opacity: 0.1, top: 160, right: 65, rotate: '18deg' },
    { emoji: '🍝', size: 70, opacity: 0.08, top: 240, left: 85, rotate: '-8deg' },
    { emoji: '🥘', size: 115, opacity: 0.1, top: 320, right: 5, rotate: '5deg' },
    { emoji: '🌎', size: 65, opacity: 0.09, top: 380, left: 160, rotate: '-20deg' },
    { emoji: '🍜', size: 90, opacity: 0.08, top: 450, right: 120, rotate: '14deg' },
    { emoji: '🌮', size: 95, opacity: 0.1, top: 530, left: 20, rotate: '-12deg' },
    { emoji: '🍱', size: 75, opacity: 0.09, top: 610, right: 50, rotate: '-15deg' },
    { emoji: '🥗', size: 110, opacity: 0.1, top: 680, left: 110, rotate: '8deg' },
    { emoji: '🫕', size: 60, opacity: 0.08, top: 760, right: 80, rotate: '-5deg' },
    { emoji: '🍣', size: 80, opacity: 0.09, top: 840, left: 40, rotate: '16deg' },
    { emoji: '🥘', size: 95, opacity: 0.1, top: 920, right: 140, rotate: '-12deg' },
    { emoji: '🌯', size: 70, opacity: 0.08, top: 1000, left: 15, rotate: '20deg' },
  ],
  chat: [
    { emoji: '👨‍🍳', size: 120, opacity: 0.1, top: 20, right: 15, rotate: '12deg' },
    { emoji: '🍳', size: 85, opacity: 0.09, top: 80, left: 10, rotate: '-8deg' },
    { emoji: '💬', size: 100, opacity: 0.1, top: 160, right: 65, rotate: '-15deg' },
    { emoji: '🥄', size: 70, opacity: 0.08, top: 240, left: 85, rotate: '10deg' },
    { emoji: '📝', size: 115, opacity: 0.1, top: 320, right: 5, rotate: '6deg' },
    { emoji: '🌿', size: 65, opacity: 0.09, top: 380, left: 160, rotate: '-18deg' },
    { emoji: '✨', size: 90, opacity: 0.08, top: 450, right: 120, rotate: '22deg' },
    { emoji: '🍽️', size: 95, opacity: 0.1, top: 530, left: 20, rotate: '-10deg' },
    { emoji: '🥘', size: 75, opacity: 0.09, top: 610, right: 50, rotate: '-20deg' },
    { emoji: '🧂', size: 110, opacity: 0.1, top: 680, left: 110, rotate: '8deg' },
    { emoji: '🫙', size: 60, opacity: 0.08, top: 760, right: 80, rotate: '-5deg' },
    { emoji: '🍲', size: 80, opacity: 0.09, top: 840, left: 40, rotate: '16deg' },
    { emoji: '🫕', size: 95, opacity: 0.1, top: 920, right: 140, rotate: '-12deg' },
    { emoji: '🌶️', size: 70, opacity: 0.08, top: 1000, left: 15, rotate: '20deg' },
  ],
};
