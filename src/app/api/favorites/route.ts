import { NextResponse } from 'next/server';

// Define the Favorite interface
interface Favorite {
  id: string;
  title: string;
  dateAdded: string;
  [key: string]: unknown; // Allow additional properties from the recipe
}

// In-memory storage for demo - in production, use a database
let favorites: Favorite[] = [];

export async function GET() {
  try {
    return NextResponse.json({
      favorites,
      total: favorites.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching favorites:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch favorites', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const recipe: Favorite = await request.json();
    
    // Check if recipe already exists in favorites
    const existingIndex = favorites.findIndex(fav => fav.title === recipe.title);
    
    if (existingIndex === -1) {
      // Add to favorites
      const favoriteRecipe: Favorite = {
        id: Date.now().toString(), // Simple ID generation
        ...recipe,
        dateAdded: new Date().toISOString(),
      };
      
      favorites.push(favoriteRecipe);
      
      return NextResponse.json({
        message: 'Recipe added to favorites',
        recipe: favoriteRecipe,
        isFavorite: true,
      });
    } else {
      return NextResponse.json({
        message: 'Recipe already in favorites',
        recipe: favorites[existingIndex],
        isFavorite: true,
      });
    }
  } catch (error: unknown) {
    console.error('Error adding to favorites:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to add to favorites', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');
    const recipeTitle = searchParams.get('title');
    
    if (!recipeId && !recipeTitle) {
      return NextResponse.json(
        { error: 'Recipe ID or title is required' },
        { status: 400 }
      );
    }
    
    // Find and remove recipe from favorites
    const initialLength = favorites.length;
    favorites = favorites.filter(fav => 
      fav.id !== recipeId && fav.title !== recipeTitle
    );
    
    if (favorites.length < initialLength) {
      return NextResponse.json({
        message: 'Recipe removed from favorites',
        isFavorite: false,
      });
    } else {
      return NextResponse.json({
        message: 'Recipe not found in favorites',
        isFavorite: false,
      });
    }
  } catch (error: unknown) {
    console.error('Error removing from favorites:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to remove from favorites', details: errorMessage },
      { status: 500 }
    );
  }
}