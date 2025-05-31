'use client';

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RecipeCard from '../components/RecipeCard';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Recipe {
  id: string | number;
  title: string;
  description: string;
  categories: string[];
  image: string;
}

const HomePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const recipesPerPage = 12;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          query: searchText,
          offset: offset.toString(),
        });

        const response = await fetch(`/api/recipes?${queryParams}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gagal mengambil resep');
        }

        const data = await response.json();
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.totalResults / recipesPerPage) || 1);
      } catch (err: any) {
        setError(err.message);
        console.error('Fetch error details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchRecipes();
    }
  }, [searchText, offset, user, authLoading]);

  const handleSearch = () => {
    console.log('Tombol cari diklik dengan nilai:', inputText);
    setSearchText(inputText);
    setOffset(0);
  };

  const handleClearSearch = () => {
    console.log('Hapus pencarian diklik');
    setInputText('');
    setSearchText('');
    setOffset(0);
  };

  const handleFirstPage = () => setOffset(0);
  const handlePrevPage = () => setOffset((prev) => Math.max(0, prev - recipesPerPage));
  const handleNextPage = () =>
    setOffset((prev) => Math.min((totalPages - 1) * recipesPerPage, prev + recipesPerPage));
  const handleLastPage = () => setOffset((totalPages - 1) * recipesPerPage);

  const handleViewPreferences = () => {
    router.push('/profile');
  };

  if (authLoading) {
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
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will handle this
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
                alt="Banner Makanan"
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
            <div className="relative text-white mb-2">Lebih Dari</div>
            <div className="relative text-white text-4xl font-bold mb-2">2850+</div>
            <div className="relative text-white">Resep Sehat</div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-center px-8 z-20">
            <h1 className="text-white text-3xl font-bold mb-1 text-center">
              Halo, {user.displayName || 'Pengguna'}
            </h1>
            <p className="text-white text-xl mb-1 text-center">
              Ayo buat pilihan makanan yang baik hari ini!
            </p>
            <p className="text-white flex justify-center">
              Tetap terjaga dengan{' '}
              <span className="text-[#1FA98D] mx-1 text-center">nutrisi Anda</span>
              <span role="img" aria-label="sehat">
                🥗
              </span>
            </p>
            <div className="flex justify-center w-full mt-4">
              <button
                onClick={handleViewPreferences}
                className="bg-teal-500 text-white px-4 py-2 rounded-full w-60 flex items-center justify-center"
              >
                Lihat Preferensi Anda
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
                  placeholder="Masukkan teks di sini"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
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
                  className="absolute right-0 top-0 h-full bg-teal-500 text-white px-6 rounded-r-lg flex items-center"
                  onClick={handleSearch}
                >
                  <span>Cari</span>
                </button>
              </div>
            </div>
            {loading && <div className="text-center">Memuat resep...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && recipes.length === 0 && (
              <div className="text-center">Tidak ada resep ditemukan.</div>
            )}
            {!loading && !error && recipes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1200px] mx-auto">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id || index}
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    categories={recipe.categories}
                    image={recipe.image}
                  />
                ))}
              </div>
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

export default HomePage;