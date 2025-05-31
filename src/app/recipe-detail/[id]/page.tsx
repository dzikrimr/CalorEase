"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useFavorites } from "app/context/FavoritesContext";
import Sidebar from "app/components/Sidebar";
import CalorieWaveTracker from "app/components/CalorieWaveTracker";
import { db } from "app/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "app/context/AuthContext";
import { useChatbot } from "app/context/ChatbotContext";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  image?: string;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
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
  nutrition: NutritionInfo;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
}

const RecipeDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteByTitle,
  } = useFavorites();
  const { user, loading: authLoading } = useAuth();
  const { setRecipe } = useChatbot();

  const [recipe, setCurrentRecipe] = useState<Recipe | null>(null); // Renamed setRecipe to setCurrentRecipe
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToDaily, setAddedToDaily] = useState<boolean>(false);
  const [targetCalories, setTargetCalories] = useState<number>(2500);
  const [currentCalories, setCurrentCalories] = useState<number>(0);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(true);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Set recipe in chatbot context
  useEffect(() => {
    setRecipe(recipe);
    // Cleanup on unmount
    return () => setRecipe(null);
  }, [recipe, setRecipe]);

  // Fetch and listen to user's calorie data
  useEffect(() => {
    if (!user || authLoading) return;

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setTargetCalories(userData.dailyCalories || 2500);
          setCurrentCalories(userData.currentCalories || 0);
        } else {
          setTargetCalories(2500);
          setCurrentCalories(0);
        }
      },
      (err) => {
        console.error("Error listening to user data:", err);
        setError("Gagal memuat data pengguna.");
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  // Fetch recipe details
  useEffect(() => {
    if (!id) return;
    const fetchRecipeDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/recipe-detail/${id}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Gagal mengambil resep: ${response.statusText}`
          );
        }
        const recipeData = await response.json();
        setCurrentRecipe(recipeData); // Use renamed setter
      } catch (err: any) {
        setError(
          err.name === "TimeoutError" ? "Permintaan waktu habis" : err.message
        );
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipeDetail();
  }, [id]);

  const isLiked = recipe ? isFavorite(recipe.title) : false;

  const handleLikeClick = () => {
    if (!recipe) return;
    if (isLiked) {
      const favoriteRecipe = getFavoriteByTitle(recipe.title);
      if (favoriteRecipe) removeFromFavorites(favoriteRecipe.id);
    } else {
      addToFavorites({
        recipeId: recipe.id, // Pass the original Spoonacular recipe ID
        title: recipe.title,
        description: recipe.summary,
        categories: recipe.categories,
        image: recipe.image,
      });
    }
  };

  const handleCheckSingleIngredient = (ingredientName: string) => {
    window.open(
      `https://www.tokopedia.com/search?q=${encodeURIComponent(
        ingredientName
      )}`,
      "_blank"
    );
  };

  const handleAddToDaily = async () => {
    if (!recipe || !user) return;
    setAddedToDaily(true);

    try {
      const date = new Date().toISOString().split("T")[0];
      const dailyIntakeRef = collection(db, `users/${user.uid}/dailyIntake`);
      await addDoc(dailyIntakeRef, {
        recipeId: recipe.id,
        name: recipe.title,
        calories: recipe.nutrition.calories,
        timestamp: new Date().toISOString(),
        date,
      });

      // Update currentCalories in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const currentCalories = userDoc.exists()
        ? userDoc.data().currentCalories || 0
        : 0;
      const newCurrentCalories = currentCalories + recipe.nutrition.calories;
      await setDoc(
        userDocRef,
        { currentCalories: newCurrentCalories },
        { merge: true }
      );
    } catch (err: any) {
      console.error("Error adding to daily consumption:", err);
      setError("Gagal menambahkan resep ke konsumsi harian.");
    }

    setTimeout(() => setAddedToDaily(false), 3000);
  };

  const handleSidebarHover = () => {
    setIsSidebarVisible(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      setShowHint(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#EDF8F7] to-[#D2EEE8]">
        <Sidebar />
        <div className="flex-1 ml-70 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FA98D] mx-auto mb-4"></div>
            <p className="text-[#198771] text-lg">Memuat detail resep...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#EDF8F7] to-[#D2EEE8]">
        <Sidebar />
        <div className="flex-1 ml-70 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-red-500 text-xl mb-4">
              ⚠️ Error memuat resep
            </div>
            <p className="text-gray-600 mb-6">
              {error || "Resep tidak ditemukan"}
            </p>
            <button
              onClick={() => router.back()}
              className="bg-[#1FA98D] text-white px-6 py-2 rounded-full hover:bg-[#198771] transition-colors"
            >
              Kembali ke Resep
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EDF8F7] to-[#D2EEE8]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-70 relative">
        <div className="flex flex-1 max-w-full">
          <div className="flex-1">
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#A5DDD1]/20">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#198771] hover:text-[#1FA98D] transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Kembali ke Resep
                  </button>
                  <h1 className="text-2xl font-bold text-[#198771]">
                    Detail Resep
                  </h1>
                  <div className="w-20"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#A5DDD1]/20">
                    <div className="relative h-80">
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <h1 className="text-3xl font-bold text-white mb-2">
                          {recipe.title}
                        </h1>
                        <div className="flex items-center gap-6 text-white/90">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {recipe.cookingTime} menit
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            {recipe.servings} porsi
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p
                        className="text-[#198771] leading-relaxed mb-4"
                        dangerouslySetInnerHTML={{
                          __html: recipe.summary.replace(/<[^>]*>?/gm, ""),
                        }}
                      ></p>
                      <div className="flex flex-wrap gap-2">
                        {recipe.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-[#4CBAA4] to-[#79CBBB] text-white text-sm font-medium rounded-full capitalize"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#A5DDD1]/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#1FA98D] to-[#4CBAA4] rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-[#198771]">
                        Bahan-Bahan
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recipe.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#EDF8F7] to-[#D2EEE8] rounded-xl"
                        >
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <Image
                              src={
                                ingredient.image || "/ingredients/default.jpg"
                              }
                              alt={ingredient.name}
                              width={24}
                              height={24}
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#198771] capitalize text-sm truncate">
                              {ingredient.name}
                            </p>
                            <p className="text-xs text-[#4CBAA4]">
                              {ingredient.amount > 0
                                ? `${ingredient.amount} ${ingredient.unit}`
                                : ingredient.unit}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleCheckSingleIngredient(ingredient.name)
                            }
                            className="bg-gradient-to-r from-[#1FA98D] to-[#4CBAA4] text-white px-2 py-1 rounded-lg hover:from-[#198771] hover:to-[#1FA98D] transition-all flex items-center gap-1 text-xs font-medium flex-shrink-0 cursor-pointer"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H5.4m0 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"
                              />
                            </svg>
                            Cek
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#A5DDD1]/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#1FA98D] to-[#4CBAA4] rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-[#198771]">
                        Instruksi
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {recipe.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#4CBAA4] to-[#79CBBB] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                            {index + 1}
                          </div>
                          <p className="text-[#198771] leading-relaxed flex-1 text-base">
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#A5DDD1]/20">
                    <div className="space-y-4">
                      {/* Replaced Marketplace button with information section */}
                      <div className="bg-transparent border border-[#1FA98D] rounded-2xl p-4 text-[#198771] text-sm leading-relaxed">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-left">
                            Untuk cek bahan di marketplace, klik tombol{" "}
                            <strong>Cek</strong> di section Bahan-Bahan. Tombol
                            ini akan membuka pencarian melalui Tokopedia untuk
                            menemukan bahan yang Anda butuhkan.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleLikeClick}
                        className={`w-full font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 cursor-pointer ${
                          isLiked
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                            : "bg-gradient-to-r from-[#79CBBB] to-[#A5DDD1] text-[#198771] hover:from-[#4CBAA4] hover:to-[#79CBBB] hover:text-white"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        {isLiked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                      </button>

                      <button
                        onClick={handleAddToDaily}
                        className={`w-full font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 cursor-pointer ${
                          addedToDaily
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            : "bg-gradient-to-r from-[#A5DDD7] to-[#D2EEE8] text-[#198771] hover:from-[#79CBBB] hover:to-[#A5DDD1] hover:text-white"
                        }`}
                        disabled={addedToDaily}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              addedToDaily
                                ? "M5 13l4 4L19 7"
                                : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                            }
                          />
                        </svg>
                        {addedToDaily
                          ? "Ditambahkan ke Harian!"
                          : "Tambah ke Konsumsi Harian"}
                      </button>

                      {recipe.sourceUrl && (
                        <a
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-[#D2EEE8] to-[#EDF8F7] text-[#198771] font-medium py-3 px-6 rounded-2xl hover:from-[#A5DDD1] hover:to-[#D2EEE8] transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-3 border border-[#A5DDD1]/30 text-center"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Lihat Resep Asli
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden md:block">
            {showHint && !hasInteracted && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[#1FA98D] text-sm font-medium animate-pulse [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap">
                  Hover for Calorie Tracker
                </span>
                <div className="w-0 h-0 border-l-8 border-l-[#1FA98D] border-t-4 border-t-transparent border-b-4 border-b-transparent animate-bounce-horizontal"></div>
              </div>
            )}
            <div
              className={`bg-gradient-to-b from-[#1FA98D] to-[#4CBAA4] w-2 h-35 rounded-l-full shadow-lg cursor-pointer transition-all hover:w-3 hover:shadow-xl ${
                isSidebarVisible ? "opacity-0" : "opacity-100"
              }`}
              onMouseEnter={handleSidebarHover}
            ></div>
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                isSidebarVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0"
              }`}
              onMouseEnter={() => setIsSidebarVisible(true)}
              onMouseLeave={() => setIsSidebarVisible(false)}
            >
              <div className="w-30 bg-white/95 backdrop-blur-sm p-6 rounded-l-3xl shadow-2xl border-l border-t border-b border-[#A5DDD1]/30">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-[#198771] mb-4">
                      Calorie Tracker
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <CalorieWaveTracker
                        current={targetCalories}
                        target={targetCalories}
                        size={64}
                        label="Calorie Target"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <CalorieWaveTracker
                        current={currentCalories}
                        target={targetCalories}
                        size={64}
                        label="Calorie's Today"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <CalorieWaveTracker
                        current={Math.max(0, targetCalories - currentCalories)}
                        target={targetCalories}
                        size={64}
                        label="Calorie Left"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#A5DDD1]/30">
                    <div className="text-center text-sm text-[#198771]/70">
                      <p>
                        Progress:{" "}
                        {Math.round((currentCalories / targetCalories) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
