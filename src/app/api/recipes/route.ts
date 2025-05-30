// app/api/recipes/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const number = 12;
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    console.error('SPOONACULAR_API_KEY is not configured');
    return NextResponse.json(
      { error: 'API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      apiKey,
      query,
      number: number.toString(),
      offset: offset.toString(),
      addRecipeInformation: 'true',
      fillIngredients: 'true'
    });

    const url = `https://api.spoonacular.com/recipes/complexSearch?${params}`;
    console.log('Fetching recipes from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spoonacular API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch recipes', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    const recipes = data.results.map((recipe: any) => ({
      id: recipe.id, // Include the recipe ID
      title: recipe.title || 'Untitled Recipe',
      description: recipe.summary 
        ? recipe.summary.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...'
        : 'No description available',
      categories: recipe.diets && recipe.diets.length > 0 
        ? recipe.diets 
        : recipe.dishTypes && recipe.dishTypes.length > 0 
          ? recipe.dishTypes 
          : ['healthy'],
      image: recipe.image || '/recipe-image.jpg',
    }));

    return NextResponse.json({
      recipes,
      totalResults: data.totalResults || 0,
    });

  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}