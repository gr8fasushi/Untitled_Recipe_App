export interface HolidayTheme {
  name: string;
  gradient: readonly [string, string, string];
  bannerEmoji: string;
  silhouetteEmojis: readonly [string, string, string];
  particle: string;
  particleCount: number;
  greeting: string;
  /** Hex color for subtitle text in the banner */
  subtitleHexColor: string;
  /** Hex color for tile accent background */
  tileAccentHex: string;
}

interface HolidayDefinition extends HolidayTheme {
  /** Returns true if the given date falls on this holiday */
  matches: (month: number, day: number, weekOfMonth?: number, weekday?: number) => boolean;
}

const HOLIDAYS: HolidayDefinition[] = [
  {
    name: 'Christmas',
    gradient: ['#14532d', '#166534', '#dc2626'],
    bannerEmoji: '🎄',
    silhouetteEmojis: ['🎄', '❄️', '🎅'],
    particle: '❄️',
    particleCount: 20,
    greeting: 'Merry Christmas',
    subtitleHexColor: '#fecaca', // red-200
    tileAccentHex: '#fef2f2', // red-50
    matches: (month, day) => month === 12 && (day === 24 || day === 25),
  },
  {
    name: "New Year's",
    gradient: ['#111827', '#1f2937', '#b45309'],
    bannerEmoji: '🥂',
    silhouetteEmojis: ['🎆', '🥂', '✨'],
    particle: '🎆',
    particleCount: 20,
    greeting: 'Happy New Year',
    subtitleHexColor: '#fef08a', // yellow-200
    tileAccentHex: '#fefce8', // yellow-50
    matches: (month, day) => (month === 12 && day === 31) || (month === 1 && day === 1),
  },
  {
    name: 'July 4th',
    gradient: ['#1e3a8a', '#1d4ed8', '#dc2626'],
    bannerEmoji: '🎆',
    silhouetteEmojis: ['🎆', '🎉', '⭐'],
    particle: '🎇',
    particleCount: 18,
    greeting: 'Happy 4th of July',
    subtitleHexColor: '#bfdbfe', // blue-200
    tileAccentHex: '#eff6ff', // blue-50
    matches: (month, day) => month === 7 && day === 4,
  },
  {
    name: 'Halloween',
    gradient: ['#111827', '#1f2937', '#ea580c'],
    bannerEmoji: '🎃',
    silhouetteEmojis: ['🎃', '👻', '🦇'],
    particle: '🦇',
    particleCount: 18,
    greeting: 'Happy Halloween',
    subtitleHexColor: '#fed7aa', // orange-200
    tileAccentHex: '#fff7ed', // orange-50
    matches: (month, day) => month === 10 && day === 31,
  },
  {
    name: "Valentine's Day",
    gradient: ['#881337', '#be185d', '#f472b6'],
    bannerEmoji: '💝',
    silhouetteEmojis: ['❤️', '🌹', '💕'],
    particle: '❤️',
    particleCount: 22,
    greeting: "Happy Valentine's Day",
    subtitleHexColor: '#fbcfe8', // pink-200
    tileAccentHex: '#fdf2f8', // pink-50
    matches: (month, day) => month === 2 && day === 14,
  },
  {
    name: "St. Patrick's Day",
    gradient: ['#14532d', '#15803d', '#4ade80'],
    bannerEmoji: '🍀',
    silhouetteEmojis: ['🍀', '☘️', '🌈'],
    particle: '🍀',
    particleCount: 20,
    greeting: "Happy St. Patrick's Day",
    subtitleHexColor: '#bbf7d0', // green-200
    tileAccentHex: '#f0fdf4', // green-50
    matches: (month, day) => month === 3 && day === 17,
  },
  {
    name: 'Thanksgiving',
    gradient: ['#78350f', '#92400e', '#d97706'],
    bannerEmoji: '🦃',
    silhouetteEmojis: ['🦃', '🍂', '🌽'],
    particle: '🍂',
    particleCount: 18,
    greeting: 'Happy Thanksgiving',
    subtitleHexColor: '#fde68a', // amber-200
    tileAccentHex: '#fffbeb', // amber-50
    // 4th Thursday of November
    matches: (month, _day, weekOfMonth, weekday) =>
      month === 11 && weekOfMonth === 4 && weekday === 4,
  },
];

/** Returns the week-of-month (1-based) and weekday (0=Sun..6=Sat) for a date */
function getWeekInfo(date: Date): { weekOfMonth: number; weekday: number } {
  const weekday = date.getDay();
  const day = date.getDate();
  const weekOfMonth = Math.ceil(day / 7);
  return { weekOfMonth, weekday };
}

/**
 * Returns the current holiday theme if today is a recognized holiday, otherwise null.
 * Pure function of the current date — no side effects.
 */
export function useHolidayTheme(): HolidayTheme | null {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const { weekOfMonth, weekday } = getWeekInfo(now);

  for (const holiday of HOLIDAYS) {
    if (holiday.matches(month, day, weekOfMonth, weekday)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { matches: _m, ...theme } = holiday;
      return theme;
    }
  }
  return null;
}
