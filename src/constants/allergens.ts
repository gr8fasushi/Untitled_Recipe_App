export interface Allergen {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const BIG_9_ALLERGENS: Allergen[] = [
  {
    id: 'milk',
    name: 'Milk',
    icon: '🥛',
    description: 'Dairy products including milk, cheese, butter, yogurt',
  },
  {
    id: 'eggs',
    name: 'Eggs',
    icon: '🥚',
    description: 'Chicken eggs and egg-derived products',
  },
  {
    id: 'fish',
    name: 'Fish',
    icon: '🐟',
    description: 'All fish including salmon, tuna, tilapia',
  },
  {
    id: 'shellfish',
    name: 'Shellfish',
    icon: '🦐',
    description: 'Crustaceans including shrimp, crab, lobster, crayfish',
  },
  {
    id: 'tree-nuts',
    name: 'Tree Nuts',
    icon: '🌰',
    description: 'Almonds, cashews, walnuts, pecans, pistachios, and more',
  },
  {
    id: 'peanuts',
    name: 'Peanuts',
    icon: '🥜',
    description: 'Peanuts and peanut-derived products',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    icon: '🌾',
    description: 'Wheat, spelt, kamut, farro, durum, bulgur, semolina',
  },
  {
    id: 'soybeans',
    name: 'Soybeans',
    icon: '🫘',
    description: 'Soy products including tofu, tempeh, edamame, soy sauce',
  },
  {
    id: 'sesame',
    name: 'Sesame',
    icon: '🌿',
    description: 'Sesame seeds, tahini, sesame oil',
  },
];

export const DIETARY_PREFERENCES = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥦' },
  { id: 'vegan', name: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', name: 'Gluten-Free', icon: '🌾' },
  { id: 'keto', name: 'Keto', icon: '🥑' },
  { id: 'paleo', name: 'Paleo', icon: '🥩' },
  { id: 'halal', name: 'Halal', icon: '☪️' },
  { id: 'kosher', name: 'Kosher', icon: '✡️' },
  { id: 'low-carb', name: 'Low-Carb', icon: '📉' },
  { id: 'dairy-free', name: 'Dairy-Free', icon: '🥛' },
] as const;
