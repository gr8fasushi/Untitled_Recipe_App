import { Text, View } from 'react-native';

interface DecorItem {
  emoji: string;
  size: number;
  bottom: number;
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
            opacity: 0.08,
            bottom: item.bottom,
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

// Pre-configured decor sets per tab theme
export const DECOR_SETS = {
  home: [
    { emoji: '🍽️', size: 120, bottom: 80, right: -10, rotate: '15deg' },
    { emoji: '🥘', size: 90, bottom: 200, right: 60, rotate: '-8deg' },
    { emoji: '🍴', size: 80, bottom: 320, left: 10, rotate: '-20deg' },
  ],
  pantry: [
    { emoji: '🥦', size: 120, bottom: 80, right: -10, rotate: '10deg' },
    { emoji: '🥕', size: 90, bottom: 230, right: 70, rotate: '-12deg' },
    { emoji: '🍅', size: 80, bottom: 350, left: 10, rotate: '18deg' },
  ],
  recipes: [
    { emoji: '🍳', size: 120, bottom: 80, right: -10, rotate: '8deg' },
    { emoji: '🔥', size: 90, bottom: 220, right: 65, rotate: '-10deg' },
    { emoji: '🥄', size: 80, bottom: 340, left: 8, rotate: '-22deg' },
  ],
  saved: [
    { emoji: '🔖', size: 120, bottom: 80, right: -10, rotate: '12deg' },
    { emoji: '⭐', size: 90, bottom: 220, right: 60, rotate: '-8deg' },
    { emoji: '❤️', size: 80, bottom: 340, left: 8, rotate: '15deg' },
  ],
  profile: [
    { emoji: '👤', size: 120, bottom: 80, right: -10, rotate: '8deg' },
    { emoji: '⚙️', size: 90, bottom: 220, right: 60, rotate: '-12deg' },
    { emoji: '🔒', size: 80, bottom: 340, left: 8, rotate: '18deg' },
  ],
  chat: [
    { emoji: '👨‍🍳', size: 130, bottom: 80, right: -15, rotate: '12deg' },
    { emoji: '🍳', size: 100, bottom: 240, right: 70, rotate: '-8deg' },
    { emoji: '💬', size: 85, bottom: 380, left: 8, rotate: '-15deg' },
  ],
} as const satisfies Record<string, DecorItem[]>;
