export const CUISINES = [
  { id: 'american', label: 'American', emoji: '🍔' },
  { id: 'mexican', label: 'Mexican', emoji: '🌮' },
  { id: 'italian', label: 'Italian', emoji: '🍝' },
  { id: 'chinese', label: 'Chinese', emoji: '🥡' },
  { id: 'japanese', label: 'Japanese', emoji: '🍱' },
  { id: 'indian', label: 'Indian', emoji: '🍛' },
  { id: 'thai', label: 'Thai', emoji: '🍜' },
  { id: 'french', label: 'French', emoji: '🥐' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'korean', label: 'Korean', emoji: '🥢' },
  { id: 'vietnamese', label: 'Vietnamese', emoji: '🍲' },
  { id: 'middle-eastern', label: 'Middle Eastern', emoji: '🥙' },
  { id: 'greek', label: 'Greek', emoji: '🫙' },
  { id: 'spanish', label: 'Spanish', emoji: '🥘' },
] as const;

export type CuisineId = (typeof CUISINES)[number]['id'];
