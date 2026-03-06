export const BACKGROUND_IMAGES = {
  home: require('../../assets/images/bg/home.jpg'),
  pantry: require('../../assets/images/bg/pantry.jpg'),
  recipes: require('../../assets/images/bg/recipes.jpg'),
  saved: require('../../assets/images/bg/saved.jpg'),
  profile: require('../../assets/images/bg/profile.jpg'),
  chat: require('../../assets/images/bg/chat.jpg'),
  recipeSearch: require('../../assets/images/bg/recipe-search.jpg'),
  community: require('../../assets/images/bg/community.jpg'),
} as const;

export type BackgroundImageKey = keyof typeof BACKGROUND_IMAGES;
