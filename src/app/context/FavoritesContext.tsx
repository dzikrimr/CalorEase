"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

export interface FavoriteRecipe {
  id: string; // Unique ID for the favorite entry
  recipeId: string; // Original Spoonacular recipe ID
  title: string;
  description: string;
  image: string;
  categories: string[];
  dateAdded: string;
  userId: string;
}

interface FavoritesContextType {
  favoriteRecipes: FavoriteRecipe[];
  addToFavorites: (
    recipe: Omit<FavoriteRecipe, "id" | "dateAdded" | "userId"> & {
      recipeId: string;
    }
  ) => Promise<void>;
  removeFromFavorites: (recipeId: string) => Promise<string | void>;
  isFavorite: (title: string) => boolean;
  getFavoriteByTitle: (title: string) => FavoriteRecipe | undefined;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteRecipes: [],
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
  isFavorite: () => false,
  getFavoriteByTitle: () => undefined,
});

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);

  useEffect(() => {
    console.log("FavoritesContext user:", user);
    if (!user) {
      setFavoriteRecipes([]);
      return;
    }

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recipes: FavoriteRecipe[] = [];
        snapshot.forEach((doc) => {
          recipes.push({ id: doc.id, ...doc.data() } as FavoriteRecipe);
        });
        setFavoriteRecipes(recipes);
      },
      (error) => {
        console.error("Error fetching favorites:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addToFavorites = async (
    recipe: Omit<FavoriteRecipe, "id" | "dateAdded" | "userId"> & {
      recipeId: string;
    }
  ) => {
    console.log("Adding to favorites, user:", user);
    if (!user) {
      console.error("No user authenticated");
      throw new Error("User not authenticated");
    }

    const newFavorite = {
      ...recipe,
      id: `${user.uid}-${recipe.title
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}`, // Unique ID for favorite entry
      userId: user.uid,
      dateAdded: new Date().toISOString(),
    };

    console.log("New favorite document:", newFavorite);

    try {
      const favoriteRef = doc(db, "favorites", newFavorite.id);
      await setDoc(favoriteRef, newFavorite, { merge: true });
      console.log("Favorite added successfully");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  };

  const removeFromFavorites = async (recipeId: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await deleteDoc(doc(db, "favorites", recipeId));
      console.log("Favorite removed successfully:", recipeId);
    } catch (error: any) {
      console.error("Error removing from favorites:", error);
      if (error.code === "permission-denied") {
        throw new Error(
          "Anda tidak memiliki izin untuk menghapus favorit ini."
        );
      } else if (error.code === "not-found") {
        throw new Error("Resep favorit tidak ditemukan.");
      } else {
        throw new Error("Gagal menghapus favorit. Silakan coba lagi.");
      }
    }
  };

  const isFavorite = (title: string) => {
    return favoriteRecipes.some((recipe) => recipe.title === title);
  };

  const getFavoriteByTitle = (title: string) => {
    return favoriteRecipes.find((recipe) => recipe.title === title);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteRecipes,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        getFavoriteByTitle,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
