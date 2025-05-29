'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Email atau password salah');
      } else {
        setError(err.message || 'Login gagal. Periksa email dan password Anda.');
      }
      setIsSubmitting(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Email atau password salah');
      } else {
        setError(err.message || 'Login dengan Google gagal.');
      }
      setIsSubmitting(false);
    }
  };

  // Toggle password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[var(--primary-50)] via-[var(--primary-100)] to-[var(--primary-200)] relative overflow-hidden">
      <div className="flex max-w-6xl w-[85%] gap-10 items-center justify-center relative z-10">
        {/* Left Content Area */}
        <div className="flex-1 max-w-[550px] text-[var(--primary-800)] flex flex-col items-center text-center relative">
          <div className="mb-5">
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/icons/CalorEase.png"
                alt="CalorEase Logo"
                width={250}
                height={250}
                className="object-contain animate-logo-float-scale hover:[animation:logo-float-scale_0.8s_ease-in-out] transition-all duration-300"
              />
            </div>
            <p className="text-[var(--primary-700)] text-base font-medium mb-9 max-w-[450px] animate-slideInUp animation-delay-200">
              Platform Terdepan untuk Resep Makanan Sehat & Kalkulasi Kebutuhan Kalori Harian Anda
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 w-full max-w-[500px] mt-1">
            {[
              { icon: '📊', title: 'Kalkulasi Kalori', desc: 'Hitung kebutuhan kalori harian sesuai aktivitas Anda' },
              { icon: '🍽️', title: 'Resep Sehat', desc: 'Ribuan resep makanan bergizi dengan info kalori' },
              { icon: '📈', title: 'Track Progress', desc: 'Pantau perkembangan dan pencapaian target' },
              { icon: '💪', title: 'Goal Setting', desc: 'Tetapkan dan capai target kesehatan Anda' },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[rgba(255,255,255,0.7)] p-5 rounded-2xl backdrop-blur-lg border-2 border-[rgba(31,169,141,0.1)] hover:border-[var(--primary-500)] hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(31,169,141,0.1)] to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-600"></div>
                <span className="text-3xl block mb-2">{feature.icon}</span>
                <h3 className="text-base font-bold text-[var(--primary-800)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--primary-700)] leading-tight">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Login Container */}
        <div className="flex-1 max-w-[450px] bg-[rgba(255,255,255,0.95)] p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-2xl border border-[rgba(255,255,255,0.8)]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--primary-800)] mb-2">Selamat Datang</h2>
            <p className="text-[var(--primary-700)] text-base">Masuk ke akun CalorEase Anda</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-2xl text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6 relative group">
              <label htmlFor="email" className="block mb-2 text-[var(--primary-700)] font-semibold text-base">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-4 border-2 border-[var(--primary-200)] rounded-2xl bg-[var(--primary-50)] text-base focus:border-[var(--primary-500)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,169,141,0.1)] focus:-translate-y-0.5 focus:scale-[1.02] transition-all duration-300 outline-none placeholder-[var(--primary-600)]"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6 relative group">
              <label htmlFor="password" className="block mb-2 text-[var(--primary-700)] font-semibold text-base">
                Password
              </label>
              <div className="relative w-full border-2 border-[var(--primary-200)] rounded-2xl bg-[var(--primary-50)] focus-within:border-[var(--primary-500)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(31,169,141,0.1)] focus-within:-translate-y-0.5 focus-within:scale-[1.02] transition-all duration-300">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full p-4 pr-12 bg-transparent text-base outline-none placeholder-[var(--primary-600)]"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[rgba(31,169,141,0.1)] hover:scale-110 transition-all duration-300"
                  onClick={togglePassword}
                >
                  <Image
                    src={showPassword ? '/icons/eye-closed.png' : '/icons/eye-open.png'}
                    alt={showPassword ? 'Hide password' : 'Show password'}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-4 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-400)] text-white border-none rounded-2xl text-base font-semibold hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden group disabled:bg-[var(--primary-700)]"
              disabled={isSubmitting}
            >
              <span className="relative z-10">{isSubmitting ? 'Masuk...' : 'Masuk ke CalorEase'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-600"></div>
            </button>
          </form>

          <div className="text-center my-8 relative text-[var(--primary-700)]">
            <span className="relative bg-[rgba(255,255,255,0.95)] px-5 z-10">atau</span>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary-200)] to-transparent"></div>
          </div>

          <button
            type="button"
            className="w-full max-w-[400px] mx-auto p-4 bg-white border-2 border-[var(--primary-200)] rounded-full text-[var(--primary-700)] flex items-center justify-center text-base font-semibold hover:bg-gradient-to-r hover:from-[var(--primary-50)] hover:to-[var(--primary-100)] hover:border-[var(--primary-500)] hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 ease-in-out group disabled:opacity-80"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <Image
              src="/icons/google.png"
              alt="Google logo"
              width={24}
              height={24}
              className="mr-3 object-contain"
            />
            <span className="flex-1 text-center">Masuk dengan Google</span>
          </button>

          <p className="text-center text-[var(--primary-700)] text-base mt-4">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-[var(--primary-500)] font-semibold relative hover:text-[var(--primary-700)] transition-colors duration-300 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-[var(--primary-500)] after:transition-width duration-300 hover:after:w-full"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-around {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(90deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
          75% {
            transform: translateY(-15px) rotate(270deg);
          }
        }

        @keyframes logo-float-scale {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
        }

        .animate-float-around {
          animation: float-around 15s infinite ease-in-out;
        }

        .animate-logo-float-scale {
          animation: logo-float-scale 2.5s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;