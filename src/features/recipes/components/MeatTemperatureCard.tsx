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

interface MeatTemperatureCardProps {
  ingredients: RecipeIngredient[];
  testID?: string;
}

export function MeatTemperatureCard({
  ingredients,
  testID = 'meat-temp-card',
}: MeatTemperatureCardProps): React.JSX.Element | null {
  const temps = detectMeatTemps(ingredients);
  if (temps.length === 0) return null;

  return (
    <View testID={testID} className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
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
  );
}
