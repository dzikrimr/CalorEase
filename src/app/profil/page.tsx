'use client';

import React, { useState, ChangeEvent } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import Sidebar from '../components/Sidebar'; // Adjust the path as needed based on your project structure

// Define interfaces for type safety
interface ProfileData {
  name: string;
  age: string;
  weight: string;
  height: string;
  gender: string;
  activityLevel: string;
}

interface Recipe {
  id: number;
  name: string;
  calories: number;
}

// Mock data for consumed recipes
const initialRecipes: Recipe[] = [
  { id: 1, name: "Nama Resep", calories: 300 },
  { id: 2, name: "Nama Resep", calories: 300 },
  { id: 3, name: "Nama Resep", calories: 300 },
  { id: 4, name: "Nama Resep", calories: 300 },
  { id: 5, name: "Nama Resep", calories: 300 },
];

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('account');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: 'Laki-Laki',
    activityLevel: 'Rendah',
  });
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', profileData);
    // Add save logic here
  };

  const handleCancel = () => {
    console.log('Cancelling changes');
    // Add cancel logic here
  };

  const handleDeleteRecipe = (id: number) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
  };

  const handleClearAll = () => {
    setRecipes([]);
  };

  const totalCalories = recipes.reduce((sum, recipe) => sum + recipe.calories, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-80 p-8 flex-1">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>

        {/* Custom Tabs */}
        <div className="mb-8">
          <div className="border-b-2 border-gray-200 flex">
            <button
              className={`px-6 py-4 text-lg font-medium border-b-2 transition-colors ${
                activeTab === 'account'
                  ? 'border-teal-400 text-teal-500'
                  : 'border-transparent text-gray-600 hover:text-teal-500'
              }`}
              onClick={() => setActiveTab('account')}
            >
              Akun Saya
            </button>
            <button
              className={`px-6 py-4 text-lg font-medium border-b-2 transition-colors ${
                activeTab === 'consumption'
                  ? 'border-teal-400 text-teal-500'
                  : 'border-transparent text-gray-600 hover:text-teal-500'
              }`}
              onClick={() => setActiveTab('consumption')}
            >
              Resep Terkonsumsi
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Akun Saya
              </h2>
              <p className="text-gray-600">
                Kelola informasi akun Anda, seperti nama pengguna, usia,
                berat, tinggi, dan detail pribadi lainnya
              </p>
              <hr className="border-t-2 border-[#1FA98D] my-4" /> {/* Teal divider */}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Nama Anda
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-400 focus:border-teal-400 outline-none transition-colors text-gray-800 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Usia
                </label>
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleInputChange}
                  placeholder="Masukkan usia Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-400 focus:border-teal-400 outline-none transition-colors text-gray-800 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={profileData.weight}
                  onChange={handleInputChange}
                  placeholder="Masukkan berat badan Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-400 focus:border-teal-400 outline-none transition-colors text-gray-800 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Tinggi (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={profileData.height}
                  onChange={handleInputChange}
                  placeholder="Masukkan tinggi badan Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-400 focus:border-teal-400 outline-none transition-colors text-gray-800 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-400 focus:border-teal-400 outline-none transition-colors bg-white text-gray-800"
                >
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Tingkat Aktivitas
                </label>
                <select
                  name="activityLevel"
                  value={profileData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-400 focus:border-teal-400 outline-none transition-colors bg-white text-gray-800"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 transition-colors font-medium"
              >
                Simpan
              </button>
              <button
                onClick={handleCancel}
                className="px-8 py-3 border border-teal-500 text-teal-500 rounded-md hover:bg-teal-50 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {activeTab === 'consumption' && (
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Resep Terkonsumsi
              </h2>
              <p className="text-gray-600">
                Pantau konsumsi harian Anda, termasuk daftar resep yang telah
                dikonsumsi, jumlah kalori per resep, dan total kalori hari ini.
                Data akan direset otomatis setiap hari.
              </p>
              <hr className="border-t-2 border-[#1FA98D] my-4" /> {/* Teal divider */}
            </div>

            <div className="flex justify-between items-center mb-6">
              <p className="text-lg text-gray-700">
                Total Kalori Hari Ini:{' '}
                <span className="font-bold">{totalCalories} kkal</span>
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-2 bg-[#A5DDD1] text-[#F63838] rounded-md hover:bg-red-50 transition-colors font-medium cursor-pointer"
              >
                Hapus Semua
              </button>
            </div>

            <p className="text-md text-gray-700 mb-4">
              Daftar resep yang sudah dikonsumsi hari ini
            </p>

            <div className="space-y-3">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="p-4 border border-teal-500 text-white rounded-md shadow-sm hover:bg-[#A5DDD7]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg text-gray-800 font-medium">{recipe.name}</h3>
                      <p className="text-gray-800 text-md">{recipe.calories} kkal</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="p-2 text-red-400 hover:bg-gray-100 hover:bg-opacity-10 rounded-md transition-colors"
                      aria-label="Delete recipe"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium"
              >
                Simpan
              </button>
              <button
                onClick={handleCancel}
                className="px-8 py-3 border border-teal-500 text-teal-500 rounded-md hover:bg-teal-50 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;