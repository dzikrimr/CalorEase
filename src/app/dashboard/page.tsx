"use client";
import React, { useState, useEffect } from "react";
import { Input } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import RecipeCard from "../components/RecipeCard";
import Sidebar from "../components/Sidebar";

interface Recipe {
  title: string;
  description: string;
  categories: string[];
  image: string;
}

const HomePage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [targetCalories, setTargetCalories] = useState<number>(3000);
  const [currentCalories, setCurrentCalories] = useState<number>(2900);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [recipeCount, setRecipeCount] = useState<number>(0); // State untuk animasi counting
  const recipesPerPage = 12;
  const targetRecipeCount = 2850; // Target angka untuk animasi

  // Efek untuk animasi counting yang smooth menggunakan requestAnimationFrame
  useEffect(() => {
    let start = 0;
    const end = targetRecipeCount;
    const duration = 1000; // Durasi animasi dalam milidetik (2 detik)
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1); // Progress dari 0 ke 1
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic untuk animasi lebih halus
      const currentCount = Math.round(easedProgress * end);

      setRecipeCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate); // Lanjutkan animasi hingga selesai
      }
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId); // Cleanup saat komponen unmount
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      const query = searchText || "";
      console.log("Fetching recipes with searchText:", query, "offset:", offset);
      console.log("Fetch URL:", `/api/recipes?query=${encodeURIComponent(query)}&offset=${offset}`);
      try {
        const response = await fetch(`/api/recipes?query=${encodeURIComponent(query)}&offset=${offset}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch recipes: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.totalResults / recipesPerPage) || 1);
      } catch (err: any) {
        setError(err.message || "Could not load recipes. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchText, offset]);

  const handleSearch = () => {
    console.log("Search button clicked with value:", inputText);
    setSearchText(inputText);
    setOffset(0); // Reset to first page on new search
  };

  const handleClearSearch = () => {
    console.log("Clear search clicked");
    setInputText("");
    setSearchText("");
    setOffset(0); // Reset to first page
  };

  const handleFirstPage = () => setOffset(0);
  const handlePrevPage = () => setOffset((prev) => Math.max(0, prev - recipesPerPage));
  const handleNextPage = () => setOffset((prev) => Math.min((totalPages - 1) * recipesPerPage, prev + recipesPerPage));
  const handleLastPage = () => setOffset((totalPages - 1) * recipesPerPage);

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
            <div className="relative text-white mb-2">Lebih Dari</div>
            <div className="relative text-white text-4xl font-bold mb-2 transition-all duration-100 ease-out">
              {recipeCount}+
            </div>
            <div className="relative text-white">Resep Sehat</div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-center px-8 z-20">
            <h1 className="text-white text-3xl font-bold mb-1 text-center">
              Hello, John Doe
            </h1>
            <p className="text-white text-xl mb-1 text-center">
              Let's make good food choices today!
            </p>
            <p className="text-white flex justify-center">
              Stay on track with{" "}
              <span className="text-[#1FA98D] mx-1 text-center">
                your nutrition
              </span>
              <span role="img" aria-label="healthy">
                🥗
              </span>
            </p>
            <div className="flex justify-center w-full mt-4">
              <button className="bg-teal-500 text-white px-4 py-2 rounded-full w-60 flex items-center justify-center">
                View Your Preferences
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
                  placeholder="Input text here"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ height: "45px", borderRadius: "8px", paddingRight: "80px" }}
                />
                {(inputText || searchText) && (
                  <div className="absolute right-30 top-1/2 transform -translate-y-1/2 flex items-center z-10">
                    <CloseCircleOutlined
                      onClick={handleClearSearch}
                      style={{ fontSize: "20px", color: "#aaa", cursor: "pointer" }}
                    />
                  </div>
                )}
                <button
                  className="absolute right-0 top-0 h-full bg-teal-500 text-white px-6 rounded-r-lg flex items-center"
                  onClick={handleSearch}
                >
                  <span>Search</span>
                </button>
              </div>
            </div>
            {loading && <div className="text-center">Loading recipes...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && recipes.length === 0 && (
              <div className="text-center">No recipes found.</div>
            )}
            {!loading && !error && recipes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1200px] mx-auto">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={index}
                    title={recipe.title}
                    description={recipe.description}
                    categories={recipe.categories}
                    image={recipe.image}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="w-30 bg-teal-100 p-4 rounded-3xl mt-4 mb-4 flex flex-col">
            <div className="flex-grow">
              <div className="mb-6">
                <div className="text-center mb-6 mt-10">
                  <div className="text-teal-800 text-sm">Target Kalori</div>
                  <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mt-2">
                    <div className="font-bold text-teal-600">
                      {targetCalories}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-center mb-2 text-teal-800 text-sm">
                    Kalori Hari Ini
                  </div>
                  <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mt-2">
                    <div className="font-bold text-teal-600">
                      {currentCalories}
                    </div>
                  </div>
                </div>
                <div className="mb-0">
                  <div className="text-center mb-2 text-teal-800 text-sm">
                    Sisa Kalori
                  </div>
                  <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mt-2">
                    <div className="font-bold text-teal-600">
                      {targetCalories - currentCalories}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-32">
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handleFirstPage}
                    disabled={offset === 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                      offset === 0 ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
                    } transition-colors duration-200`}
                  >
                    <Image
                      src="/icons/previous_arrow.png"
                      alt="First Page"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </button>
                  <button
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                      offset === 0 ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
                    } transition-colors duration-200`}
                  >
                    <Image
                      src="/icons/start_arrow.png"
                      alt="Previous Page"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </button>
                  <div className="text-gray-600 text-sm">
                    Page {Math.floor(offset / recipesPerPage) + 1} of {totalPages}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={offset >= (totalPages - 1) * recipesPerPage}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                      offset >= (totalPages - 1) * recipesPerPage ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
                    } transition-colors duration-200`}
                  >
                    <Image
                      src="/icons/last_arrow.png"
                      alt="Next Page"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </button>
                  <button
                    onClick={handleLastPage}
                    disabled={offset >= (totalPages - 1) * recipesPerPage}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                      offset >= (totalPages - 1) * recipesPerPage ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
                    } transition-colors duration-200`}
                  >
                    <Image
                      src="/icons/next_arrow.png"
                      alt="Last Page"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;