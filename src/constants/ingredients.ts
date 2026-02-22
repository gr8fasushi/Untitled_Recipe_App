import type { PantryItem } from '@/features/pantry/types';

export const INGREDIENT_CATEGORIES = [
  'Proteins',
  'Dairy',
  'Vegetables',
  'Fruits',
  'Grains',
  'Legumes',
  'Pantry Staples',
  'Herbs & Spices',
  'Nuts & Seeds',
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export const INGREDIENTS: PantryItem[] = [
  // Proteins
  { id: 'chicken-breast', name: 'Chicken Breast', emoji: '🍗', category: 'Proteins' },
  { id: 'ground-beef', name: 'Ground Beef', emoji: '🥩', category: 'Proteins' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', category: 'Proteins' },
  { id: 'shrimp', name: 'Shrimp', emoji: '🦐', category: 'Proteins' },
  { id: 'tuna', name: 'Tuna', emoji: '🐟', category: 'Proteins' },
  { id: 'tofu', name: 'Tofu', emoji: '🫙', category: 'Proteins' },
  { id: 'eggs', name: 'Eggs', emoji: '🥚', category: 'Proteins' },
  { id: 'bacon', name: 'Bacon', emoji: '🥓', category: 'Proteins' },
  { id: 'turkey', name: 'Turkey', emoji: '🦃', category: 'Proteins' },
  { id: 'pork-chops', name: 'Pork Chops', emoji: '🥩', category: 'Proteins' },

  // Dairy
  { id: 'milk', name: 'Milk', emoji: '🥛', category: 'Dairy' },
  { id: 'butter', name: 'Butter', emoji: '🧈', category: 'Dairy' },
  { id: 'cheddar-cheese', name: 'Cheddar Cheese', emoji: '🧀', category: 'Dairy' },
  { id: 'parmesan', name: 'Parmesan', emoji: '🧀', category: 'Dairy' },
  { id: 'mozzarella', name: 'Mozzarella', emoji: '🧀', category: 'Dairy' },
  { id: 'yogurt', name: 'Yogurt', emoji: '🫙', category: 'Dairy' },
  { id: 'heavy-cream', name: 'Heavy Cream', emoji: '🥛', category: 'Dairy' },
  { id: 'sour-cream', name: 'Sour Cream', emoji: '🫙', category: 'Dairy' },
  { id: 'cream-cheese', name: 'Cream Cheese', emoji: '🧀', category: 'Dairy' },

  // Vegetables
  { id: 'onion', name: 'Onion', emoji: '🧅', category: 'Vegetables' },
  { id: 'garlic', name: 'Garlic', emoji: '🧄', category: 'Vegetables' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Vegetables' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'Vegetables' },
  { id: 'potato', name: 'Potato', emoji: '🥔', category: 'Vegetables' },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'Vegetables' },
  { id: 'spinach', name: 'Spinach', emoji: '🥬', category: 'Vegetables' },
  { id: 'bell-pepper', name: 'Bell Pepper', emoji: '🫑', category: 'Vegetables' },
  { id: 'zucchini', name: 'Zucchini', emoji: '🥒', category: 'Vegetables' },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', category: 'Vegetables' },
  { id: 'celery', name: 'Celery', emoji: '🥬', category: 'Vegetables' },
  { id: 'cucumber', name: 'Cucumber', emoji: '🥒', category: 'Vegetables' },
  { id: 'corn', name: 'Corn', emoji: '🌽', category: 'Vegetables' },
  { id: 'sweet-potato', name: 'Sweet Potato', emoji: '🍠', category: 'Vegetables' },
  { id: 'cabbage', name: 'Cabbage', emoji: '🥬', category: 'Vegetables' },
  { id: 'asparagus', name: 'Asparagus', emoji: '🌿', category: 'Vegetables' },
  { id: 'green-beans', name: 'Green Beans', emoji: '🫘', category: 'Vegetables' },

  // Fruits
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'Fruits' },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'Fruits' },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', category: 'Fruits' },
  { id: 'lime', name: 'Lime', emoji: '🍋', category: 'Fruits' },
  { id: 'orange', name: 'Orange', emoji: '🍊', category: 'Fruits' },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', category: 'Fruits' },
  { id: 'blueberry', name: 'Blueberry', emoji: '🫐', category: 'Fruits' },
  { id: 'avocado', name: 'Avocado', emoji: '🥑', category: 'Fruits' },

  // Grains
  { id: 'white-rice', name: 'White Rice', emoji: '🍚', category: 'Grains' },
  { id: 'brown-rice', name: 'Brown Rice', emoji: '🍚', category: 'Grains' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', category: 'Grains' },
  { id: 'bread', name: 'Bread', emoji: '🍞', category: 'Grains' },
  { id: 'all-purpose-flour', name: 'All-Purpose Flour', emoji: '🌾', category: 'Grains' },
  { id: 'oats', name: 'Oats', emoji: '🌾', category: 'Grains' },
  { id: 'quinoa', name: 'Quinoa', emoji: '🌾', category: 'Grains' },
  { id: 'breadcrumbs', name: 'Breadcrumbs', emoji: '🍞', category: 'Grains' },
  { id: 'tortillas', name: 'Tortillas', emoji: '🫓', category: 'Grains' },

  // Legumes
  { id: 'black-beans', name: 'Black Beans', emoji: '🫘', category: 'Legumes' },
  { id: 'chickpeas', name: 'Chickpeas', emoji: '🫘', category: 'Legumes' },
  { id: 'lentils', name: 'Lentils', emoji: '🫘', category: 'Legumes' },
  { id: 'kidney-beans', name: 'Kidney Beans', emoji: '🫘', category: 'Legumes' },
  { id: 'pinto-beans', name: 'Pinto Beans', emoji: '🫘', category: 'Legumes' },

  // Pantry Staples
  { id: 'olive-oil', name: 'Olive Oil', emoji: '🫙', category: 'Pantry Staples' },
  { id: 'vegetable-oil', name: 'Vegetable Oil', emoji: '🫙', category: 'Pantry Staples' },
  { id: 'salt', name: 'Salt', emoji: '🧂', category: 'Pantry Staples' },
  { id: 'black-pepper', name: 'Black Pepper', emoji: '🌶️', category: 'Pantry Staples' },
  { id: 'sugar', name: 'Sugar', emoji: '🍬', category: 'Pantry Staples' },
  { id: 'brown-sugar', name: 'Brown Sugar', emoji: '🍬', category: 'Pantry Staples' },
  { id: 'soy-sauce', name: 'Soy Sauce', emoji: '🫙', category: 'Pantry Staples' },
  { id: 'white-vinegar', name: 'White Vinegar', emoji: '🫙', category: 'Pantry Staples' },
  {
    id: 'apple-cider-vinegar',
    name: 'Apple Cider Vinegar',
    emoji: '🫙',
    category: 'Pantry Staples',
  },
  { id: 'ketchup', name: 'Ketchup', emoji: '🍅', category: 'Pantry Staples' },
  { id: 'mustard', name: 'Mustard', emoji: '🌭', category: 'Pantry Staples' },
  { id: 'hot-sauce', name: 'Hot Sauce', emoji: '🌶️', category: 'Pantry Staples' },
  { id: 'honey', name: 'Honey', emoji: '🍯', category: 'Pantry Staples' },
  { id: 'tomato-paste', name: 'Tomato Paste', emoji: '🍅', category: 'Pantry Staples' },
  { id: 'chicken-broth', name: 'Chicken Broth', emoji: '🫙', category: 'Pantry Staples' },
  { id: 'vegetable-broth', name: 'Vegetable Broth', emoji: '🫙', category: 'Pantry Staples' },
  { id: 'coconut-milk', name: 'Coconut Milk', emoji: '🥥', category: 'Pantry Staples' },
  {
    id: 'worcestershire-sauce',
    name: 'Worcestershire Sauce',
    emoji: '🫙',
    category: 'Pantry Staples',
  },

  // Herbs & Spices
  { id: 'cumin', name: 'Cumin', emoji: '🌿', category: 'Herbs & Spices' },
  { id: 'paprika', name: 'Paprika', emoji: '🌶️', category: 'Herbs & Spices' },
  { id: 'oregano', name: 'Oregano', emoji: '🌿', category: 'Herbs & Spices' },
  { id: 'thyme', name: 'Thyme', emoji: '🌿', category: 'Herbs & Spices' },
  { id: 'rosemary', name: 'Rosemary', emoji: '🌿', category: 'Herbs & Spices' },
  { id: 'cinnamon', name: 'Cinnamon', emoji: '🍂', category: 'Herbs & Spices' },
  { id: 'ginger', name: 'Ginger', emoji: '🫚', category: 'Herbs & Spices' },
  { id: 'turmeric', name: 'Turmeric', emoji: '🌿', category: 'Herbs & Spices' },
  { id: 'chili-powder', name: 'Chili Powder', emoji: '🌶️', category: 'Herbs & Spices' },
  { id: 'garlic-powder', name: 'Garlic Powder', emoji: '🧄', category: 'Herbs & Spices' },
  { id: 'onion-powder', name: 'Onion Powder', emoji: '🧅', category: 'Herbs & Spices' },
  { id: 'basil', name: 'Basil', emoji: '🌿', category: 'Herbs & Spices' },
  { id: 'bay-leaves', name: 'Bay Leaves', emoji: '🍃', category: 'Herbs & Spices' },
  { id: 'cayenne-pepper', name: 'Cayenne Pepper', emoji: '🌶️', category: 'Herbs & Spices' },
  { id: 'italian-seasoning', name: 'Italian Seasoning', emoji: '🌿', category: 'Herbs & Spices' },

  // Nuts & Seeds
  { id: 'almonds', name: 'Almonds', emoji: '🌰', category: 'Nuts & Seeds' },
  { id: 'walnuts', name: 'Walnuts', emoji: '🌰', category: 'Nuts & Seeds' },
  { id: 'peanuts', name: 'Peanuts', emoji: '🥜', category: 'Nuts & Seeds' },
  { id: 'peanut-butter', name: 'Peanut Butter', emoji: '🥜', category: 'Nuts & Seeds' },
  { id: 'sesame-seeds', name: 'Sesame Seeds', emoji: '🌱', category: 'Nuts & Seeds' },
  { id: 'sunflower-seeds', name: 'Sunflower Seeds', emoji: '🌻', category: 'Nuts & Seeds' },
  { id: 'chia-seeds', name: 'Chia Seeds', emoji: '🌱', category: 'Nuts & Seeds' },
  { id: 'pine-nuts', name: 'Pine Nuts', emoji: '🌰', category: 'Nuts & Seeds' },
];

export function getIngredientsByCategory(category: IngredientCategory): PantryItem[] {
  return INGREDIENTS.filter((i) => i.category === category);
}

export function searchIngredients(query: string): PantryItem[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return INGREDIENTS;
  return INGREDIENTS.filter((i) => i.name.toLowerCase().includes(lower));
}
