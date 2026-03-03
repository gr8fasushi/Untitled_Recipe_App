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

// Pre-configured decor sets per tab theme (banner area — bottom-anchored)
export const DECOR_SETS = {
  home: [
    { emoji: '🍽️', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '15deg' },
    { emoji: '🥘', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-8deg' },
    { emoji: '🍴', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '-20deg' },
    { emoji: '🧂', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '12deg' },
    { emoji: '🫕', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '5deg' },
    { emoji: '🍲', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-15deg' },
    { emoji: '🥄', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '20deg' },
    { emoji: '🍳', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '-10deg' },
  ],
  pantry: [
    { emoji: '🥦', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '10deg' },
    { emoji: '🥕', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-12deg' },
    { emoji: '🍅', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '18deg' },
    { emoji: '🌽', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '-8deg' },
    { emoji: '🫑', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '6deg' },
    { emoji: '🧅', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-20deg' },
    { emoji: '🥑', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '14deg' },
    { emoji: '🥒', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '22deg' },
  ],
  recipes: [
    { emoji: '🍳', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '8deg' },
    { emoji: '🔥', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-10deg' },
    { emoji: '🥄', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '-22deg' },
    { emoji: '🧂', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '12deg' },
    { emoji: '🫕', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '5deg' },
    { emoji: '🥘', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-15deg' },
    { emoji: '🫙', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '18deg' },
    { emoji: '🧅', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '-8deg' },
  ],
  saved: [
    { emoji: '🔖', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '12deg' },
    { emoji: '⭐', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-8deg' },
    { emoji: '❤️', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '15deg' },
    { emoji: '🏆', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '-12deg' },
    { emoji: '📖', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '6deg' },
    { emoji: '🌟', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-18deg' },
    { emoji: '💫', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '20deg' },
    { emoji: '✨', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '-5deg' },
  ],
  profile: [
    { emoji: '👤', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '8deg' },
    { emoji: '⚙️', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-12deg' },
    { emoji: '🔒', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '18deg' },
    { emoji: '🛡️', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '-8deg' },
    { emoji: '📱', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '5deg' },
    { emoji: '🔑', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-20deg' },
    { emoji: '💼', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '14deg' },
    { emoji: '🎯', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '-15deg' },
  ],
  chat: [
    { emoji: '👨‍🍳', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '12deg' },
    { emoji: '🍳', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-8deg' },
    { emoji: '💬', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '-15deg' },
    { emoji: '🥄', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '10deg' },
    { emoji: '📝', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '6deg' },
    { emoji: '🌿', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-18deg' },
    { emoji: '✨', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '22deg' },
    { emoji: '🍽️', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '-10deg' },
  ],
  recipeSearch: [
    { emoji: '🔍', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '15deg' },
    { emoji: '📖', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-8deg' },
    { emoji: '🍽️', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '-20deg' },
    { emoji: '🥘', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '12deg' },
    { emoji: '📋', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '5deg' },
    { emoji: '🔖', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-15deg' },
    { emoji: '🌟', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '18deg' },
    { emoji: '📌', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '-8deg' },
  ],
  community: [
    { emoji: '⭐', size: 140, opacity: 0.1, bottom: 0, right: 10, rotate: '12deg' },
    { emoji: '👨‍🍳', size: 90, opacity: 0.08, bottom: 40, left: 20, rotate: '-10deg' },
    { emoji: '🌟', size: 80, opacity: 0.06, bottom: 80, right: 60, rotate: '18deg' },
    { emoji: '🍝', size: 65, opacity: 0.08, bottom: 20, left: 80, rotate: '-8deg' },
    { emoji: '🥘', size: 100, opacity: 0.06, bottom: 60, right: -10, rotate: '5deg' },
    { emoji: '🌎', size: 70, opacity: 0.05, bottom: 30, left: 140, rotate: '-20deg' },
    { emoji: '🍜', size: 60, opacity: 0.07, bottom: 10, right: 130, rotate: '14deg' },
    { emoji: '🌮', size: 55, opacity: 0.05, bottom: 50, left: 50, rotate: '-12deg' },
  ],
} as const satisfies Record<string, DecorItem[]>;

// Web-only body decor — top-anchored, spread 50–620px down page body (web only)
// Lighter opacity (0.04–0.05) so cards remain readable against the decor
export const BODY_DECOR_SETS: Record<string, DecorItem[]> = {
  home: [
    { emoji: '🍽️', size: 100, opacity: 0.05, top: 60, right: 20, rotate: '12deg' },
    { emoji: '🥘', size: 75, opacity: 0.04, top: 160, left: 15, rotate: '-8deg' },
    { emoji: '🍴', size: 85, opacity: 0.05, top: 260, right: 65, rotate: '-18deg' },
    { emoji: '🧂', size: 65, opacity: 0.04, top: 360, left: 80, rotate: '15deg' },
    { emoji: '🫕', size: 90, opacity: 0.05, top: 440, right: -5, rotate: '5deg' },
    { emoji: '🍲', size: 60, opacity: 0.04, top: 320, left: 155, rotate: '-20deg' },
    { emoji: '🥄', size: 70, opacity: 0.04, top: 520, right: 125, rotate: '18deg' },
    { emoji: '🍳', size: 55, opacity: 0.04, top: 600, left: 40, rotate: '-10deg' },
  ],
  pantry: [
    { emoji: '🥦', size: 100, opacity: 0.05, top: 60, right: 20, rotate: '10deg' },
    { emoji: '🥕', size: 75, opacity: 0.04, top: 160, left: 15, rotate: '-12deg' },
    { emoji: '🍅', size: 85, opacity: 0.05, top: 260, right: 65, rotate: '18deg' },
    { emoji: '🌽', size: 65, opacity: 0.04, top: 360, left: 80, rotate: '-8deg' },
    { emoji: '🫑', size: 90, opacity: 0.05, top: 440, right: -5, rotate: '6deg' },
    { emoji: '🧅', size: 60, opacity: 0.04, top: 320, left: 155, rotate: '-20deg' },
    { emoji: '🥑', size: 70, opacity: 0.04, top: 520, right: 125, rotate: '14deg' },
    { emoji: '🥒', size: 55, opacity: 0.04, top: 600, left: 40, rotate: '22deg' },
  ],
  recipes: [
    { emoji: '🍳', size: 100, opacity: 0.05, top: 60, right: 20, rotate: '10deg' },
    { emoji: '🔥', size: 75, opacity: 0.04, top: 160, left: 15, rotate: '-12deg' },
    { emoji: '🥘', size: 85, opacity: 0.05, top: 260, right: 60, rotate: '8deg' },
    { emoji: '🫕', size: 65, opacity: 0.04, top: 360, left: 80, rotate: '-18deg' },
    { emoji: '🥄', size: 90, opacity: 0.05, top: 460, right: -5, rotate: '6deg' },
    { emoji: '🧅', size: 60, opacity: 0.04, top: 320, left: 155, rotate: '20deg' },
    { emoji: '🧂', size: 70, opacity: 0.04, top: 540, right: 120, rotate: '-8deg' },
    { emoji: '🫙', size: 55, opacity: 0.04, top: 620, left: 40, rotate: '15deg' },
  ],
  saved: [
    { emoji: '🔖', size: 100, opacity: 0.05, top: 60, right: 20, rotate: '12deg' },
    { emoji: '⭐', size: 75, opacity: 0.04, top: 160, left: 15, rotate: '-8deg' },
    { emoji: '❤️', size: 85, opacity: 0.05, top: 260, right: 65, rotate: '15deg' },
    { emoji: '🏆', size: 65, opacity: 0.04, top: 360, left: 80, rotate: '-12deg' },
    { emoji: '📖', size: 90, opacity: 0.05, top: 440, right: -5, rotate: '6deg' },
    { emoji: '🌟', size: 60, opacity: 0.04, top: 320, left: 155, rotate: '-18deg' },
    { emoji: '💫', size: 70, opacity: 0.04, top: 520, right: 125, rotate: '20deg' },
    { emoji: '✨', size: 55, opacity: 0.04, top: 600, left: 40, rotate: '-5deg' },
  ],
  profile: [
    { emoji: '👤', size: 100, opacity: 0.05, top: 60, right: 20, rotate: '8deg' },
    { emoji: '⚙️', size: 75, opacity: 0.04, top: 160, left: 15, rotate: '-12deg' },
    { emoji: '🔒', size: 85, opacity: 0.05, top: 260, right: 65, rotate: '18deg' },
    { emoji: '🛡️', size: 65, opacity: 0.04, top: 360, left: 80, rotate: '-8deg' },
    { emoji: '📱', size: 90, opacity: 0.05, top: 440, right: -5, rotate: '5deg' },
    { emoji: '🔑', size: 60, opacity: 0.04, top: 320, left: 155, rotate: '-20deg' },
    { emoji: '💼', size: 70, opacity: 0.04, top: 520, right: 125, rotate: '14deg' },
    { emoji: '🎯', size: 55, opacity: 0.04, top: 600, left: 40, rotate: '-15deg' },
  ],
  community: [
    { emoji: '⭐', size: 100, opacity: 0.05, top: 60, right: 20, rotate: '12deg' },
    { emoji: '👨‍🍳', size: 75, opacity: 0.04, top: 160, left: 15, rotate: '-10deg' },
    { emoji: '🌟', size: 85, opacity: 0.05, top: 260, right: 65, rotate: '18deg' },
    { emoji: '🍝', size: 65, opacity: 0.04, top: 360, left: 80, rotate: '-8deg' },
    { emoji: '🥘', size: 90, opacity: 0.05, top: 440, right: -5, rotate: '5deg' },
    { emoji: '🌎', size: 60, opacity: 0.04, top: 320, left: 155, rotate: '-20deg' },
    { emoji: '🍜', size: 70, opacity: 0.04, top: 520, right: 125, rotate: '14deg' },
    { emoji: '🌮', size: 55, opacity: 0.04, top: 600, left: 40, rotate: '-12deg' },
  ],
  chat: [
    { emoji: '👨‍🍳', size: 100, opacity: 0.05, top: 60, right: 20, rotate: '12deg' },
    { emoji: '🍳', size: 75, opacity: 0.04, top: 160, left: 15, rotate: '-8deg' },
    { emoji: '💬', size: 85, opacity: 0.05, top: 260, right: 65, rotate: '-15deg' },
    { emoji: '🥄', size: 65, opacity: 0.04, top: 360, left: 80, rotate: '10deg' },
    { emoji: '📝', size: 90, opacity: 0.05, top: 440, right: -5, rotate: '6deg' },
    { emoji: '🌿', size: 60, opacity: 0.04, top: 320, left: 155, rotate: '-18deg' },
    { emoji: '✨', size: 70, opacity: 0.04, top: 520, right: 125, rotate: '22deg' },
    { emoji: '🍽️', size: 55, opacity: 0.04, top: 600, left: 40, rotate: '-10deg' },
  ],
};
