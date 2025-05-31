"use client";

import React, { useState, useEffect } from "react";
import { Input } from "antd";
import { CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import { useFavorites, FavoriteRecipe } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

const FavoritesPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [filteredRecipes, setFilteredRecipes] = useState<FavoriteRecipe[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const recipesPerPage = 12;

  const { favoriteRecipes, removeFromFavorites } = useFavorites();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // Filter recipes based on search
    let filtered = favoriteRecipes;
    if (searchText.trim() !== "") {
      filtered = favoriteRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchText.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchText.toLowerCase()) ||
          recipe.categories.some((category) =>
            category.toLowerCase().includes(searchText.toLowerCase())
          )
      );
    }

    // Apply pagination
    const startIndex = offset;
    const endIndex = startIndex + recipesPerPage;
    setFilteredRecipes(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / recipesPerPage) || 1);
  }, [searchText, favoriteRecipes, user, offset]);

  const handleSearch = () => {
    console.log("Search button clicked with value:", inputText);
    setSearchText(inputText);
    setOffset(0);
  };

  const handleClearSearch = () => {
    console.log("Clear search clicked");
    setInputText("");
    setSearchText("");
    setOffset(0);
  };

  const handleRemoveFavorite = (recipeId: string) => {
    removeFromFavorites(recipeId);
    console.log("Removing recipe from favorites:", recipeId);
  };

  const handleFirstPage = () => setOffset(0);
  const handlePrevPage = () =>
    setOffset((prev) => Math.max(0, prev - recipesPerPage));
  const handleNextPage = () =>
    setOffset((prev) =>
      Math.min((totalPages - 1) * recipesPerPage, prev + recipesPerPage)
    );
  const handleLastPage = () => setOffset((totalPages - 1) * recipesPerPage);

  const FavoriteRecipeCard: React.FC<{ recipe: FavoriteRecipe }> = ({
    recipe,
  }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 relative group">
      <button
        onClick={() => handleRemoveFavorite(recipe.id)}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        title="Remove from favorites"
      >
        <DeleteOutlined className="text-sm" />
      </button>
      <div className="absolute top-3 left-3 z-10">
        <Image
          src="/icons/love-filled.png"
          alt="Favorite"
          width={24}
          height={24}
          className="text-red-500"
        />
      </div>
      <div className="relative h-48 bg-gray-200">
        <Image
          src={recipe.image}
          alt={recipe.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/bg/header_banner.png";
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Added: {new Date(recipe.dateAdded).toLocaleDateString()}</span>
          <button
            className="text-teal-600 hover:text-teal-700 font-medium"
            onClick={() => router.push(`/recipe-detail/${recipe.recipeId}`)} // Use recipeId instead of id
          >
            View Recipe
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-teal-500 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-70">
        <div className="relative w-full h-48">
          <div className="absolute inset-0">
            <div className="relative w-full h-full overflow-hidden rounded-bl-3xl rounded-br-3xl">
              <Image
                src="/bg/header_banner.png"
                alt="Food Banner"
                layout="fill"
                objectFit="cover"
                className="z-0"
              />
              <div className="absolute inset-0 bg-opacity-20 z-10"></div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-6 text-center z-20 w-40">
            <div
              className="absolute w-55 h-55 bg-[#1FA98D] opacity-50 rounded-full z-0"
              style={{ top: "-40px", right: "-40px" }}
            ></div>
            <div className="relative text-white mb-2">You Have</div>
            <div className="relative text-white text-4xl font-bold mb-2">
              {favoriteRecipes.length}
            </div>
            <div className="relative text-white">
              Favorite Recipe{favoriteRecipes.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-center px-8 z-20">
            <h1 className="text-white text-3xl font-bold mb-1 text-center">
              Your Favorite Recipes
            </h1>
            <p className="text-white text-xl mb-1 text-center">
              All your saved recipes in one place!
            </p>
            <p className="text-white flex justify-center">
              Keep track of your{" "}
              <span className="text-[#1FA98D] mx-1 text-center">
                favorite dishes
              </span>
              <span role="img" aria-label="heart">
                ❤️
              </span>
            </p>
            <div className="flex justify-center w-full mt-4">
              <button
                className="bg-teal-500 text-white px-4 py-2 rounded-full w-60 flex items-center justify-center hover:bg-teal-600 transition-colors cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                Explore More Recipes
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-1 max-w-full">
          <div className="flex-1 p-4 overflow-hidden">
            <div className="mb-8">
              <div className="relative">
                <Input
                  placeholder="Search your favorite recipes..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPressEnter={handleSearch}
                  style={{
                    height: "45px",
                    borderRadius: "8px",
                    paddingRight: "80px",
                  }}
                />
                {(inputText || searchText) && (
                  <div className="absolute right-30 top-1/2 transform -translate-y-1/2 flex items-center z-10">
                    <CloseCircleOutlined
                      onClick={handleClearSearch}
                      style={{
                        fontSize: "20px",
                        color: "#aaa",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                )}
                <button
                  className="absolute right-0 top-0 h-full bg-teal-500 text-white px-6 rounded-r-lg flex items-center hover:bg-teal-600 transition-colors"
                  onClick={handleSearch}
                >
                  <span>Search</span>
                </button>
              </div>
            </div>
            {filteredRecipes.length === 0 && favoriteRecipes.length === 0 && (
              <div className="py-16 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                  <Image
                    src="/icons/love-filled.png"
                    alt="No Favorites"
                    width={48}
                    height={48}
                    className="mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Favorite Recipes Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start exploring and save your favorite recipes!
                  </p>
                  <button
                    className="bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition-colors"
                    onClick={() => router.push("/dashboard")}
                  >
                    Explore Recipes
                  </button>
                </div>
              </div>
            )}
            {filteredRecipes.length === 0 &&
              favoriteRecipes.length > 0 &&
              searchText && (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No recipes found
                  </h3>
                  <p className="text-gray-500">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            {filteredRecipes.length > 0 && (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredRecipes.length} of {favoriteRecipes.length}{" "}
                  favorite recipe
                  {favoriteRecipes.length !== 1 ? "s" : ""}
                  {searchText && ` for "${searchText}"`}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1200px] mx-auto">
                  {filteredRecipes.map((recipe) => (
                    <FavoriteRecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </>
            )}
          </div>
          <RightSidebar
            offset={offset}
            totalPages={totalPages}
            recipesPerPage={recipesPerPage}
            onFirstPage={handleFirstPage}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onLastPage={handleLastPage}
          />
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
