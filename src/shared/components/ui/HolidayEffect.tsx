import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';

interface HolidayEffectProps {
  particle: string;
  count?: number;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  size: number;
  anim: Animated.Value;
  delay: number;
  duration: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

function createParticles(particle: string, count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * (SCREEN_WIDTH - 40),
    size: 20 + Math.floor(Math.random() * 21), // 20-40
    anim: new Animated.Value(0),
    delay: Math.random() * 2000,
    duration: 1500 + Math.random() * 2000, // 1.5-3.5s
    // particle is captured via closure in parent
  }));
}

/**
 * Renders animated falling emoji particles across the full screen.
 * Unmounts itself after all animations complete.
 * Rendered in _layout.tsx — plays once per app launch.
 */
export function HolidayEffect({
  particle,
  count = 20,
  onComplete,
}: HolidayEffectProps): React.JSX.Element | null {
  const [visible, setVisible] = useState(true);
  const particles = useRef<Particle[]>(createParticles(particle, count));

  useEffect(() => {
    const anims = particles.current.map((p) =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        useNativeDriver: true,
      })
    );

    Animated.parallel(anims).start(() => {
      setVisible(false);
      onComplete?.();
    });
  }, [onComplete]);

  if (!visible) return null;

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
      pointerEvents="none"
    >
      {particles.current.map((p) => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, SCREEN_HEIGHT + 50],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.1, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.Text
            key={p.id}
            aria-hidden
            style={{
              position: 'absolute',
              left: p.x,
              top: 0,
              fontSize: p.size,
              transform: [{ translateY }],
              opacity,
            }}
          >
            {particle}
          </Animated.Text>
        );
      })}
    </View>
  );
}
