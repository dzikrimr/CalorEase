import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const number = 12;
  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  const endpoint = 'https://api.spoonacular.com/recipes/complexSearch';

  try {
    const response = await fetch(
      `${endpoint}?apiKey=${apiKey}&query=${encodeURIComponent(query)}&number=${number}&offset=${offset}&addRecipeInformation=true&fillIngredients=true`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API error! status: ${response.status}`);
    }

    const data = await response.json();
    const recipes = data.results.map((recipe) => ({
      title: recipe.title,
      description: recipe.summary ? recipe.summary.split('.')[0] + '.' : 'No description available.',
      categories: recipe.diets || ['General'],
      image: recipe.image || '/recipe-image.jpg',
    }));

    return NextResponse.json({
      recipes,
      totalResults: data.totalResults,
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes from Spoonacular' }, { status: 500 });
  }
}