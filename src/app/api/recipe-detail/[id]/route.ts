import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  image: string;
}

interface Nutrient {
  name: string;
  amount: number;
}

interface Recipe {
  id: string;
  title: string;
  image: string;
  summary: string;
  cookingTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  categories: string[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const cacheKey = `recipe-${id}`;

  // Check cache
  const cachedRecipe = cache.get(cacheKey);
  if (cachedRecipe) {
    console.log(`Serving cached recipe for ID: ${id}`);
    return NextResponse.json(cachedRecipe);
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    console.error('SPOONACULAR_API_KEY is not configured');
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  if (!id) {
    return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      apiKey,
      includeNutrition: 'true',
    });

    const url = `https://api.spoonacular.com/recipes/${id}/information?${params}`;
    console.log('Fetching recipe details from:', url);

    const response = await fetch(url, { next: { revalidate: 3600 } }); // ISR cache for 1 hour

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spoonacular API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch recipe details', details: errorData },
        { status: response.status }
      );
    }

    const data: {
      id: number;
      title?: string;
      image?: string;
      summary?: string;
      readyInMinutes?: number;
      servings?: number;
      extendedIngredients?: Array<{
        name?: string;
        amount?: number;
        unit?: string;
        image?: string;
      }>;
      analyzedInstructions?: Array<{ steps?: Array<{ step: string }> }>;
      diets?: string[];
      dishTypes?: string[];
      nutrition?: { nutrients?: Array<{ name: string; amount: number }> };
      sourceUrl?: string;
      spoonacularSourceUrl?: string;
    } = await response.json();

    const recipe: Recipe = {
      id: data.id.toString(),
      title: data.title || 'Untitled Recipe',
      image: data.image || '/recipe-image.jpg',
      summary: data.summary || 'No summary available',
      cookingTime: data.readyInMinutes || 0,
      servings: data.servings || 1,
      ingredients: data.extendedIngredients?.map((ing): Ingredient => ({
        name: ing.name || 'Unknown ingredient',
        amount: ing.amount || 0,
        unit: ing.unit || '',
        image: ing.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ing.image}` : '/ingredients/default.jpg',
      })) || [],
      instructions: data.analyzedInstructions?.[0]?.steps?.map((step): string => step.step) || ['No instructions provided'],
      categories: [...(data.diets || []), ...(data.dishTypes || [])].filter(Boolean) || ['healthy'],
      nutrition: {
        calories: data.nutrition?.nutrients?.find((n: Nutrient) => n.name === 'Calories')?.amount || 0,
        protein: data.nutrition?.nutrients?.find((n: Nutrient) => n.name === 'Protein')?.amount || 0,
        fat: data.nutrition?.nutrients?.find((n: Nutrient) => n.name === 'Fat')?.amount || 0,
        carbohydrates: data.nutrition?.nutrients?.find((n: Nutrient) => n.name === 'Carbohydrates')?.amount || 0,
      },
      sourceUrl: data.sourceUrl,
      spoonacularSourceUrl: data.spoonacularSourceUrl,
    };

    // Store in cache
    cache.set(cacheKey, recipe);

    return NextResponse.json(recipe);
  } catch (error: unknown) {
    console.error('Error in API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}