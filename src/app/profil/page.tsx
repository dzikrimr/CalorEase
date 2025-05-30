'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import CustomDropdown from '../components/CustomDropdown';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

const initialRecipes: Recipe[] = [
  { id: 1, name: "Nama Resep", calories: 300 },
  { id: 2, name: "Nama Resep", calories: 300 },
  { id: 3, name: "Nama Resep", calories: 300 },
  { id: 4, name: "Nama Resep", calories: 300 },
  { id: 5, name: "Nama Resep", calories: 300 },
];

const genderOptions = [
  { value: 'pria', label: 'Pria' },
  { value: 'wanita', label: 'Wanita' },
];

const activityOptions = [
  { value: 'rendah', label: 'Rendah - Jarang berolahraga, kerja kantoran' },
  { value: 'sedang', label: 'Sedang - Olahraga ringan 1-3x/minggu' },
  { value: 'tinggi', label: 'Tinggi - Olahraga intensif 4-6x/minggu' },
  { value: 'sangat_tinggi', label: 'Sangat Tinggi - Olahraga setiap hari atau 2x/hari' },
];

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('account');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
  });
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError('User tidak ditemukan. Silakan login kembali.');
        router.push('/login');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('Fetched Firestore data:', data); // Debugging
          setProfileData({
            name: data.nama || '',
            age: data.umur ? data.umur.toString() : '',
            weight: data.berat ? data.berat.toString() : '',
            height: data.tinggi ? data.tinggi.toString() : '',
            gender: data.jenisKelamin || '',
            activityLevel: data.aktivitas || '',
          });
          console.log('Updated profileData:', {
            name: data.nama || '',
            age: data.umur ? data.umur.toString() : '',
            weight: data.berat ? data.berat.toString() : '',
            height: data.tinggi ? data.tinggi.toString() : '',
            gender: data.jenisKelamin || '',
            activityLevel: data.aktivitas || '',
          }); // Debugging
        } else {
          setError('Data profil belum tersedia. Silakan lengkapi profil Anda.');
        }
      } catch (err: any) {
        setError('Gagal memuat data profil: ' + (err.message || 'Terjadi kesalahan.'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    const user = auth.currentUser;

    if (!user) {
      setError('User tidak ditemukan. Silakan login kembali.');
      router.push('/login');
      return;
    }

    if (
      !profileData.name ||
      !profileData.age ||
      !profileData.weight ||
      !profileData.height ||
      !profileData.gender ||
      !profileData.activityLevel
    ) {
      setError('Harap lengkapi semua kolom yang diperlukan.');
      return;
    }

    try {
      const userData = {
        nama: profileData.name,
        umur: parseInt(profileData.age) || 0,
        berat: parseFloat(profileData.weight) || 0,
        tinggi: parseInt(profileData.height) || 0,
        jenisKelamin: profileData.gender,
        aktivitas: profileData.activityLevel,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      setSuccess('Data profil berhasil disimpan!');
    } catch (err: any) {
      setError('Gagal menyimpan data profil: ' + (err.message || 'Terjadi kesalahan.'));
    }
  };

  const handleCancel = async () => {
    setError(null);
    setSuccess(null);
    const user = auth.currentUser;

    if (!user) {
      setError('User tidak ditemukan. Silakan login kembali.');
      router.push('/login');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData({
          name: data.nama || '',
          age: data.umur ? data.umur.toString() : '',
          weight: data.berat ? data.berat.toString() : '',
          height: data.tinggi ? data.tinggi.toString() : '',
          gender: data.jenisKelamin || '',
          activityLevel: data.aktivitas || '',
        });
      } else {
        setProfileData({
          name: '',
          age: '',
          weight: '',
          height: '',
          gender: '',
          activityLevel: '',
        });
        setError('Data profil belum tersedia. Silakan lengkapi profil Anda.');
      }
    } catch (err: any) {
      setError('Gagal memuat data profil: ' + (err.message || 'Terjadi kesalahan.'));
    }
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
      <Sidebar />
      <div className="ml-80 p-8 flex-1">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>
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
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm text-center">
            {success}
          </div>
        )}
        {activeTab === 'account' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Akun Saya</h2>
              <p className="text-gray-600">
                Kelola informasi akun Anda, seperti nama pengguna, usia, berat, tinggi, dan detail pribadi lainnya
              </p>
              <hr className="border-t-2 border-teal-400 my-4" />
            </div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Memuat data profil...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-2">Nama Anda</label>
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
                  <label className="block text-md font-medium text-gray-700 mb-2">Usia</label>
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
                  <label className="block text-md font-medium text-gray-700 mb-2">Berat (kg)</label>
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
                  <label className="block text-md font-medium text-gray-700 mb-2">Tinggi (cm)</label>
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
                  <label
                    id="gender-label"
                    className="block text-md font-medium text-gray-700 mb-2"
                  >
                    Jenis Kelamin
                  </label>
                  <CustomDropdown
                    options={genderOptions}
                    value={profileData.gender}
                    onChange={handleInputChange}
                    placeholder="Pilih jenis kelamin"
                    name="gender"
                  />
                </div>
                <div>
                  <label
                    id="activityLevel-label"
                    className="block text-md font-medium text-gray-700 mb-2"
                  >
                    Tingkat Aktivitas
                  </label>
                  <CustomDropdown
                    options={activityOptions}
                    value={profileData.activityLevel}
                    onChange={handleInputChange}
                    placeholder="Pilih tingkat aktivitas"
                    name="activityLevel"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-20">
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 transition-colors font-medium"
                disabled={loading}
              >
                Simpan
              </button>
              <button
                onClick={handleCancel}
                className="px-8 py-3 border border-teal-500 text-teal-500 rounded-md hover:bg-teal-50 transition-colors font-medium"
                disabled={loading}
              >
                Batal
              </button>
            </div>
          </div>
        )}
        {activeTab === 'consumption' && (
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Resep Terkonsumsi</h2>
              <p className="text-gray-600">
                Pantau konsumsi harian Anda, termasuk daftar resep yang telah dikonsumsi, jumlah kalori per resep, dan total kalori hari ini.
                Data akan direset otomatis setiap hari.
              </p>
              <hr className="border-t-2 border-teal-400 my-4" />
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
            <p className="text-md text-gray-700 mb-4">Daftar resep yang sudah dikonsumsi hari ini</p>
            <div className="space-y-3">
              {recipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">Belum ada resep yang dikonsumsi hari ini</p>
                  <p className="text-sm">Mulai tambahkan resep untuk melacak kalori harian Anda</p>
                </div>
              ) : (
                recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-4 border border-teal-500 bg-white rounded-md shadow-sm hover:bg-[#A5DDD7] transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg text-gray-800 font-medium">{recipe.name}</h3>
                        <p className="text-gray-600 text-md">{recipe.calories} kkal</p>
                      </div>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                        aria-label="Delete recipe"
                        title="Hapus resep"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-4 mt-20">
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