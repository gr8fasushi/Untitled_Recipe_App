/**
 * Server-side TheMealDB API service (Node 20 built-in fetch).
 * TheMealDB is a public, CORS-safe, key-free API.
 * All functions return [] on any error so callers degrade gracefully.
 */

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strTags: string | null;
  [key: string]: string | null | undefined;
}

interface MealDbResponse {
  meals: MealDbMeal[] | null;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function filterMealsByArea(area: string): Promise<MealDbMeal[]> {
  const data = await fetchJson<MealDbResponse>(
    `${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`
  );
  return data?.meals ?? [];
}

async function filterMealsByIngredient(ingredient: string): Promise<MealDbMeal[]> {
  const data = await fetchJson<MealDbResponse>(
    `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`
  );
  return data?.meals ?? [];
}

async function fetchMealById(id: string): Promise<MealDbMeal | null> {
  const data = await fetchJson<MealDbResponse>(
    `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`
  );
  return data?.meals?.[0] ?? null;
}

/**
 * Orchestrate a search for the recipe generation flow:
 * try area (cuisine) first, then ingredient fallback.
 * Returns up to maxResults full meal objects.
 */
export async function fetchMealsForRecipeGeneration(
  ingredientNames: string[],
  cuisines: string[],
  maxResults: number = 5
): Promise<MealDbMeal[]> {
  const seen = new Set<string>();
  const summaries: MealDbMeal[] = [];

  // Try cuisine (area) filter first
  for (const cuisine of cuisines) {
    if (summaries.length >= maxResults * 2) break;
    const results = await filterMealsByArea(cuisine);
    for (const m of results) {
      if (!seen.has(m.idMeal)) {
        seen.add(m.idMeal);
        summaries.push(m);
      }
    }
  }

  // Supplement with ingredient filter — parallel calls for up to 3 ingredients
  if (summaries.length < maxResults && ingredientNames.length > 0) {
    const topIngredients = ingredientNames.slice(0, 3);
    const ingredientResults = await Promise.all(
      topIngredients.map((ing) => filterMealsByIngredient(ing))
    );

    let candidateMeals: MealDbMeal[];
    if (topIngredients.length <= 1) {
      candidateMeals = ingredientResults[0] ?? [];
    } else {
      // Intersection: meals that match every ingredient filter
      const allSets = ingredientResults.map((res) => new Set(res.map((m) => m.idMeal)));
      const [firstResults = []] = ingredientResults;
      const intersection = firstResults.filter((m) =>
        allSets.slice(1).every((set) => set.has(m.idMeal))
      );
      if (intersection.length > 0) {
        candidateMeals = intersection;
      } else {
        // Fall back to union when no meals match all ingredients
        const unionIds = new Set<string>();
        candidateMeals = ingredientResults.flat().filter((m) => {
          if (unionIds.has(m.idMeal)) return false;
          unionIds.add(m.idMeal);
          return true;
        });
      }
    }

    for (const m of candidateMeals) {
      if (!seen.has(m.idMeal)) {
        seen.add(m.idMeal);
        summaries.push(m);
      }
    }
  }

  // Fetch full details for the top candidates only
  const topIds = summaries.slice(0, maxResults).map((m) => m.idMeal);
  const fullMeals = await Promise.all(topIds.map((id) => fetchMealById(id)));
  return fullMeals.filter((m): m is MealDbMeal => m !== null);
}
