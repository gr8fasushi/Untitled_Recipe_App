import { Text, View } from 'react-native';
import type { RecipeIngredient } from '@/shared/types';

interface MeatTemp {
  label: string;
  fahrenheit: number;
  celsius: number;
  note?: string;
}

// Ordered most-specific first to prevent shorter keywords (e.g. "beef") from
// shadowing multi-word phrases (e.g. "ground beef") matched earlier in the list.
const MEAT_RULES: { keywords: string[]; temp: MeatTemp }[] = [
  {
    keywords: ['chicken', 'turkey', 'duck', 'poultry', 'hen', 'fowl', 'quail', 'cornish'],
    temp: { label: 'Poultry', fahrenheit: 165, celsius: 74 },
  },
  {
    keywords: [
      'ground beef',
      'ground pork',
      'ground lamb',
      'minced beef',
      'minced pork',
      'ground meat',
      'ground turkey',
    ],
    temp: { label: 'Ground meat', fahrenheit: 160, celsius: 71 },
  },
  {
    keywords: [
      'fish',
      'salmon',
      'tuna',
      'cod',
      'shrimp',
      'prawn',
      'lobster',
      'crab',
      'scallop',
      'seafood',
      'tilapia',
      'halibut',
      'trout',
      'mahi',
      'bass',
      'snapper',
      'flounder',
    ],
    temp: { label: 'Fish & seafood', fahrenheit: 145, celsius: 63 },
  },
  {
    keywords: ['ham'],
    temp: { label: 'Ham (raw)', fahrenheit: 145, celsius: 63, note: '+ 3 min rest' },
  },
  {
    keywords: [
      'beef',
      'pork',
      'lamb',
      'veal',
      'steak',
      'roast',
      'chop',
      'loin',
      'tenderloin',
      'rib',
      'brisket',
      'sirloin',
      'filet',
      'fillet',
      'rack',
      'shank',
    ],
    temp: {
      label: 'Beef / pork / lamb / veal',
      fahrenheit: 145,
      celsius: 63,
      note: '+ 3 min rest',
    },
  },
];

const STEAK_KEYWORDS = [
  'steak',
  'ribeye',
  'rib-eye',
  'sirloin',
  't-bone',
  'tbone',
  'new york strip',
  'ny strip',
  'filet mignon',
  'tenderloin',
  'strip steak',
  'flank steak',
  'skirt steak',
  'porterhouse',
];

interface SteakDoneness {
  level: string;
  range: string;
  description: string;
}

const STEAK_DONENESS: SteakDoneness[] = [
  { level: 'Rare', range: '120–125°F / 49–52°C', description: 'Cool red center' },
  { level: 'Medium-Rare', range: '130–135°F / 54–57°C', description: 'Warm red center' },
  { level: 'Medium', range: '140–145°F / 60–63°C', description: 'Pink center' },
  { level: 'Medium-Well', range: '150–155°F / 66–68°C', description: 'Slight pink' },
  { level: 'Well-Done', range: '160°F+ / 71°C+', description: 'No pink' },
];

function detectMeatTemps(ingredients: RecipeIngredient[]): MeatTemp[] {
  const found = new Map<string, MeatTemp>();
  for (const ingredient of ingredients) {
    const name = ingredient.name.toLowerCase();
    for (const rule of MEAT_RULES) {
      if (rule.keywords.some((kw) => name.includes(kw))) {
        if (!found.has(rule.temp.label)) {
          found.set(rule.temp.label, rule.temp);
        }
        break; // first matching rule wins per ingredient
      }
    }
  }
  return Array.from(found.values());
}

function isSteak(recipeTitle: string, ingredients: RecipeIngredient[]): boolean {
  const titleLower = recipeTitle.toLowerCase();
  if (STEAK_KEYWORDS.some((kw) => titleLower.includes(kw))) return true;
  return ingredients.some((ing) => {
    const name = ing.name.toLowerCase();
    return STEAK_KEYWORDS.some((kw) => name.includes(kw));
  });
}

interface MeatTemperatureCardProps {
  ingredients: RecipeIngredient[];
  recipeTitle?: string;
  testID?: string;
}

export function MeatTemperatureCard({
  ingredients,
  recipeTitle = '',
  testID = 'meat-temp-card',
}: MeatTemperatureCardProps): React.JSX.Element | null {
  const temps = detectMeatTemps(ingredients);
  const showDoneness = isSteak(recipeTitle, ingredients);

  if (temps.length === 0 && !showDoneness) return null;

  return (
    <>
      {temps.length > 0 && (
        <View
          testID={testID}
          className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3"
        >
          <Text className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">
            Safe Internal Temperatures (USDA)
          </Text>
          {temps.map((temp) => (
            <View
              key={temp.label}
              testID={`meat-temp-row-${temp.label}`}
              className="flex-row justify-between items-center py-1"
            >
              <Text className="text-sm text-amber-700 flex-1">{temp.label}</Text>
              <Text className="text-sm font-semibold text-amber-900">
                {temp.fahrenheit}°F / {temp.celsius}°C{temp.note ? ` (${temp.note})` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {showDoneness && (
        <View
          testID="steak-doneness-card"
          className="mb-5 rounded-xl border border-red-200 overflow-hidden"
        >
          {/* Header */}
          <View className="px-4 py-2 bg-red-700">
            <Text className="text-xs font-semibold text-red-100 uppercase tracking-wide">
              🥩 Steak Doneness Guide
            </Text>
          </View>
          {/* Table rows */}
          <View className="bg-red-50">
            {/* Column headers */}
            <View className="flex-row border-b border-red-200 px-3 py-1.5 bg-red-100">
              <Text className="text-xs font-bold text-red-800 flex-1">Doneness</Text>
              <Text className="text-xs font-bold text-red-800 w-40">Temperature</Text>
              <Text className="text-xs font-bold text-red-800 w-28">Center</Text>
            </View>
            {STEAK_DONENESS.map((row, i) => (
              <View
                key={row.level}
                testID={`steak-row-${row.level.toLowerCase().replace(/[^a-z]/g, '-')}`}
                className={`flex-row px-3 py-2 items-center ${i < STEAK_DONENESS.length - 1 ? 'border-b border-red-100' : ''}`}
              >
                <Text className="text-sm font-nunito-semibold text-red-900 flex-1">
                  {row.level}
                </Text>
                <Text className="text-xs text-red-700 w-40">{row.range}</Text>
                <Text className="text-xs text-red-600 w-28">{row.description}</Text>
              </View>
            ))}
          </View>
          {/* Footer note */}
          <View className="px-4 py-2 bg-red-100 border-t border-red-200">
            <Text className="text-xs text-red-700 italic">
              Rest steak 5 minutes after cooking before cutting.
            </Text>
          </View>
        </View>
      )}
    </>
  );
}
