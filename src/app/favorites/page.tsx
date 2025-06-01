'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import { useFavorites, FavoriteRecipe } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const FavoritesPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [filteredRecipes, setFilteredRecipes] = useState<FavoriteRecipe[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const recipesPerPage = 12;

  const { favoriteRecipes, removeFromFavorites } = useFavorites();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    // Filter recipes based on search
    let filtered = favoriteRecipes;
    if (searchText.trim() !== '') {
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
    console.log('Search button clicked with value:', inputText);
    setSearchText(inputText);
    setOffset(0);
  };

  const handleClearSearch = () => {
    console.log('Clear search clicked');
    setInputText('');
    setSearchText('');
    setOffset(0);
  };

  const handleRemoveFavorite = (recipeId: string) => {
    removeFromFavorites(recipeId);
    console.log('Removing recipe from favorites:', recipeId);
  };

  const handleFirstPage = () => setOffset(0);
  const handlePrevPage = () =>
    setOffset((prev) => Math.max(0, prev - recipesPerPage));
  const handleNextPage = () =>
    setOffset((prev) =>
      Math.min((totalPages - 1) * recipesPerPage, prev + recipesPerPage)
    );
  const handleLastPage = () => setOffset((totalPages - 1) * recipesPerPage);

  const FavoriteRecipeCard: React.FC<{ recipe: FavoriteRecipe }> = ({ recipe }) => {
    const truncateCategory = (category: string, maxLength: number = 12) => {
      if (category.length > maxLength) {
        return category.substring(0, maxLength) + '...';
      }
      return category;
    };

    const getDisplayCategories = () => {
      const maxWidth = 250;
      const baseWidth = 40;
      const charWidth = 6;
      const dotsBadgeWidth = 50;

      let totalWidth = 0;
      let displayCategories = [];

      for (let i = 0; i < recipe.categories.length; i++) {
        const category = recipe.categories[i];
        const truncatedCategory = truncateCategory(category);
        const categoryWidth = baseWidth + truncatedCategory.length * charWidth;

        const wouldExceed =
          totalWidth +
            categoryWidth +
            (i < recipe.categories.length - 1 ? dotsBadgeWidth : 0) >
          maxWidth;

        if (wouldExceed && displayCategories.length > 0) {
          break;
        }

        displayCategories.push(truncatedCategory);
        totalWidth += categoryWidth + 8;

        if (displayCategories.length >= 2) break;
      }

      return displayCategories;
    };

    const smartDisplayCategories = getDisplayCategories();
    const hasMoreSmartCategories = smartDisplayCategories.length < recipe.categories.length;

    const sanitizeDescription = (text: string) => {
      let cleanText = text.replace(/<[^>]+>/g, '');
      cleanText = cleanText.replace(/\s+/g, ' ').trim();
      return cleanText;
    };

    const cleanDescription = sanitizeDescription(recipe.description);

    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl border border-[#A5DDD1]/20 w-full max-w-[300px] flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[3/2]">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/bg/header_banner.png';
            }}
          />
          <button
            className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer border border-[#A5DDD1]/20 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFavorite(recipe.id);
            }}
            title="Remove from favorites"
          >
            <DeleteOutlined className="text-red-500 text-base" />
          </button>
        </div>
        <div className="p-5 bg-gradient-to-br from-[#4CBAA4] to-[#79CBBB] flex-1 flex flex-col hover:from-[#1FA98D] hover:to-[#4CBAA4] transition-all duration-300">
          <h3 className="font-bold text-lg text-white line-clamp-1 mb-3">
            {recipe.title}
          </h3>
          <p
            className="text-white/90 text-sm mb-4 line-clamp-3 leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {cleanDescription}
          </p>
          <div className="flex gap-2 mb-4">
            {smartDisplayCategories.map((category, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-white/30 whitespace-nowrap capitalize"
                title={recipe.categories[i]}
              >
                {category}
              </span>
            ))}
            {hasMoreSmartCategories && (
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-white/30 whitespace-nowrap">
                ...
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-white/80 mt-auto">
            <span>Added: {new Date(recipe.dateAdded).toLocaleDateString()}</span>
            <button
              className="text-white hover:text-white/70 font-medium cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/recipe-detail/${recipe.recipeId}`);
              }}
            >
              View Recipe
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              style={{ top: '-40px', right: '-40px' }}
            ></div>
            <div className="relative text-white mb-2">You Have</div>
            <div className="relative text-white text-4xl font-bold mb-2">
              {favoriteRecipes.length}
            </div>
            <div className="relative text-white">
              Favorite Recipe{favoriteRecipes.length !== 1 ? 's' : ''}
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
              Keep track of your{' '}
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
                onClick={() => router.push('/dashboard')}
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
                    height: '45px',
                    borderRadius: '8px',
                    paddingRight: '80px',
                  }}
                />
                {(inputText || searchText) && (
                  <div className="absolute right-30 top-1/2 transform -translate-y-1/2 flex items-center z-10">
                    <CloseCircleOutlined
                      onClick={handleClearSearch}
                      style={{
                        fontSize: '20px',
                        color: '#aaa',
                        cursor: 'pointer',
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
                    onClick={() => router.push('/dashboard')}
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
                  Showing {filteredRecipes.length} of {favoriteRecipes.length}{' '}
                  favorite recipe
                  {favoriteRecipes.length !== 1 ? 's' : ''}
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