"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FavoriteRecipe {
  id: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  dateAdded: string;
}

interface FavoritesContextType {
  favoriteRecipes: FavoriteRecipe[];
  addToFavorites: (recipe: Omit<FavoriteRecipe, 'id' | 'dateAdded'>) => void;
  removeFromFavorites: (recipeId: string) => void;
  isFavorite: (title: string) => boolean;
  getFavoriteByTitle: (title: string) => FavoriteRecipe | undefined;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteRecipes');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavoriteRecipes(parsedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage whenever favoriteRecipes changes
  useEffect(() => {
    try {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favoriteRecipes]);

  const addToFavorites = (recipe: Omit<FavoriteRecipe, 'id' | 'dateAdded'>) => {
    const newFavorite: FavoriteRecipe = {
      ...recipe,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    setFavoriteRecipes(prev => {
      // Check if recipe already exists (by title)
      const exists = prev.some(fav => fav.title.toLowerCase() === recipe.title.toLowerCase());
      if (!exists) {
        return [...prev, newFavorite];
      }
      return prev;
    });
  };

  const removeFromFavorites = (recipeId: string) => {
    setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
  };

  const isFavorite = (title: string): boolean => {
    return favoriteRecipes.some(recipe => recipe.title.toLowerCase() === title.toLowerCase());
  };

  const getFavoriteByTitle = (title: string): FavoriteRecipe | undefined => {
    return favoriteRecipes.find(recipe => recipe.title.toLowerCase() === title.toLowerCase());
  };

  const value: FavoritesContextType = {
    favoriteRecipes,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteByTitle,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};