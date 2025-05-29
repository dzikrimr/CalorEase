"use client";

import React, { useState, FormEvent } from 'react';

interface FormData {
  nama: string;
  umur: number;
  tinggi: number;
  berat: number;
  jenisKelamin: 'pria' | 'wanita' | '';
  aktivitas: 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi' | '';
}

const ProfileSetup: React.FC = () => {
  const [nama, setNama] = useState('');
  const [umur, setUmur] = useState<number>(25);
  const [tinggi, setTinggi] = useState<number>(170);
  const [berat, setBerat] = useState<number>(65);
  const [jenisKelamin, setJenisKelamin] = useState<'pria' | 'wanita' | ''>('');
  const [aktivitas, setAktivitas] = useState<'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi' | ''>('');
  const [calories, setCalories] = useState<number>(0);
  const [bmr, setBMR] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Calculate BMR
  const calculateBMR = (gender: 'pria' | 'wanita', weight: number, height: number, age: number): number => {
    if (gender === 'pria') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  // Calculate daily calories
  const calculateDailyCalories = (bmr: number, activityLevel: 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi'): number => {
    const multipliers = {
      'rendah': 1.2,
      'sedang': 1.375,
      'tinggi': 1.55,
      'sangat_tinggi': 1.725,
    };
    return Math.round(bmr * multipliers[activityLevel]);
  };

  // Form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setShowResult(false);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const data: FormData = {
      nama,
      umur,
      tinggi,
      berat,
      jenisKelamin,
      aktivitas,
    };

    if (!data.jenisKelamin || !data.aktivitas) {
      setLoading(false);
      return; // Prevent calculation if required fields are missing
    }

    const calculatedBMR = calculateBMR(data.jenisKelamin, data.berat, data.tinggi, data.umur);
    const dailyCalories = calculateDailyCalories(calculatedBMR, data.aktivitas);

    setCalories(dailyCalories);
    setBMR(Math.round(calculatedBMR));
    setShowResult(true);
    setLoading(false);
  };

  // Update step indicator
  const totalFields = 5; // nama, umur, jenisKelamin, tinggi, berat, aktivitas
  const filledFields = [nama, umur.toString(), jenisKelamin, tinggi.toString(), berat.toString(), aktivitas].filter(
    (value) => value !== ''
  ).length;
  const activeSteps = Math.ceil((filledFields / totalFields) * 5);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[var(--primary-50)] via-[var(--primary-100)] to-[var(--primary-200)] p-4 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="fixed rounded-full bg-[var(--primary-100)] opacity-30 w-24 h-24 top-[15%] left-[10%] animate-[float_6s_ease-in-out_infinite] z-[-1]" />
      <div className="fixed rounded-full bg-[var(--primary-100)] opacity-30 w-36 h-36 bottom-[20%] right-[15%] animate-[float_6s_ease-in-out_infinite_2s] z-[-1]" />
      <div className="fixed rounded-full bg-[var(--primary-100)] opacity-30 w-20 h-20 top-[50%] left-[20%] animate-[float_6s_ease-in-out_infinite_4s] z-[-1]" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full items-center">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--primary-800)] leading-tight">
            Hitung <span className="relative text-[var(--primary-500)] after:content-[''] after:absolute after:bottom-1 after:left-0 after:right-0 after:h-2 after:bg-[var(--primary-200)] after:rounded after:z-[-1]">Kalori</span> Harian Anda
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            Dapatkan rekomendasi kalori yang tepat berdasarkan profil dan aktivitas harian Anda untuk mencapai target kesehatan yang optimal.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary-100)] rounded-xl flex items-center justify-center text-2xl">🎯</div>
              <p className="text-[var(--primary-700)] font-medium">Perhitungan akurat berdasarkan BMR</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary-100)] rounded-xl flex items-center justify-center text-2xl">⚡</div>
              <p className="text-[var(--primary-700)] font-medium">Disesuaikan dengan tingkat aktivitas</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary-100)] rounded-xl flex items-center justify-center text-2xl">📊</div>
              <p className="text-[var(--primary-700)] font-medium">Rekomendasi personal untuk Anda</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--primary-800)] mb-2">Setup Profil</h2>
            <p className="text-gray-600 text-sm">Isi data diri Anda untuk mendapatkan hasil yang akurat</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`w-8 h-1 rounded-sm transition-all duration-300 ${
                  index < activeSteps ? 'bg-[var(--primary-500)]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nama" className="block mb-2 text-sm font-semibold text-[var(--primary-800)]">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                placeholder="Masukkan nama lengkap"
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-[var(--primary-800)] focus:border-[var(--primary-400)] focus:ring-2 focus:ring-[var(--primary-400)]/20 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="umur" className="block mb-2 text-sm font-semibold text-[var(--primary-800)]">
                  Umur
                </label>
                <input
                  type="number"
                  id="umur"
                  value={umur}
                  onChange={(e) => setUmur(parseInt(e.target.value) || 0)}
                  required
                  min="15"
                  max="100"
                  placeholder="25"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-[var(--primary-800)] focus:border-[var(--primary-400)] focus:ring-2 focus:ring-[var(--primary-400)]/20 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="jenisKelamin" className="block mb-2 text-sm font-semibold text-[var(--primary-800)]">
                  Jenis Kelamin
                </label>
                <select
                  id="jenisKelamin"
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value as 'pria' | 'wanita' | '')}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-[var(--primary-800)] focus:border-[var(--primary-400)] focus:ring-2 focus:ring-[var(--primary-400)]/20 focus:outline-none"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="pria">Pria</option>
                  <option value="wanita">Wanita</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="tinggi" className="block mb-2 text-sm font-semibold text-[var(--primary-800)]">
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  id="tinggi"
                  value={tinggi}
                  onChange={(e) => setTinggi(parseInt(e.target.value) || 0)}
                  required
                  min="100"
                  max="250"
                  placeholder="170"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-[var(--primary-800)] focus:border-[var(--primary-400)] focus:ring-2 focus:ring-[var(--primary-400)]/20 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="berat" className="block mb-2 text-sm font-semibold text-[var(--primary-800)]">
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  id="berat"
                  value={berat}
                  onChange={(e) => setBerat(parseFloat(e.target.value) || 0)}
                  required
                  min="30"
                  max="200"
                  step="0.1"
                  placeholder="65"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-[var(--primary-800)] focus:border-[var(--primary-400)] focus:ring-2 focus:ring-[var(--primary-400)]/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="aktivitas" className="block mb-2 text-sm font-semibold text-[var(--primary-800)]">
                Tingkat Aktivitas
              </label>
              <select
                id="aktivitas"
                value={aktivitas}
                onChange={(e) => setAktivitas(e.target.value as 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi' | '')}
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-[var(--primary-800)] focus:border-[var(--primary-400)] focus:ring-2 focus:ring-[var(--primary-400)]/20 focus:outline-none"
              >
                <option value="">Pilih tingkat aktivitas</option>
                <option value="rendah">Rendah - Jarang berolahraga, kerja kantoran</option>
                <option value="sedang">Sedang - Olahraga ringan 1-3x/minggu</option>
                <option value="tinggi">Tinggi - Olahraga intensif 4-6x/minggu</option>
                <option value="sangat_tinggi">Sangat Tinggi - Olahraga setiap hari atau 2x/hari</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-4 bg-[var(--primary-500)] text-white rounded-xl font-semibold text-lg transition-all duration-200 ${
                loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--primary-600)] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
              } flex items-center justify-center`}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Menghitung...' : 'Hitung Kalori Harian Saya'}
            </button>
          </form>

          <div className={`mt-6 ${showResult ? 'animate-slideInUp block' : 'hidden'}`}>
            <div className="bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] border-2 border-[var(--primary-200)] rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold text-[var(--primary-800)] mb-3">Kebutuhan Kalori Harian Anda</h3>
              <div className="text-4xl md:text-5xl font-extrabold text-[var(--primary-600)] mb-3">{calories.toLocaleString()}</div>
              <div className="text-lg text-[var(--primary-500)] font-medium">kalori per hari</div>
              <div className="bg-white p-4 rounded-xl mt-4 text-[var(--primary-700)]">
                <strong>BMR (Basal Metabolic Rate):</strong> <span>{bmr.toLocaleString()}</span> kalori
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;