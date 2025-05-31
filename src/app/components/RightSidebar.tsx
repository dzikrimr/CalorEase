'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CalorieWaveTracker from './CalorieWaveTracker';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface RightSidebarProps {
  offset?: number;
  totalPages?: number;
  recipesPerPage?: number;
  onFirstPage?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onLastPage?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  offset = 0,
  totalPages = 1,
  recipesPerPage = 12,
  onFirstPage,
  onPrevPage,
  onNextPage,
  onLastPage,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [targetCalories, setTargetCalories] = useState<number>(2500);
  const [currentCalories, setCurrentCalories] = useState<number>(0);

  // Fetch and listen to user's calorie data from Firestore
  useEffect(() => {
    if (!user || authLoading) return;

    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setTargetCalories(userData.dailyCalories || 2500);
        setCurrentCalories(userData.currentCalories || 0);
      } else {
        console.log('No user data found in Firestore');
        setTargetCalories(2500);
        setCurrentCalories(0);
      }
    }, (err) => {
      console.error('Error listening to user data:', err);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  return (
    <div className="w-30 bg-teal-100 p-6 rounded-3xl mt-4 mb-4 flex flex-col">
      <div className="flex-grow">
        <div className="mt-6 mb-6">
          <CalorieWaveTracker
            current={targetCalories}
            target={targetCalories}
            size={64}
            label="Target Kalori"
          />
        </div>
        <div className="mb-6">
          <CalorieWaveTracker
            current={currentCalories}
            target={targetCalories}
            size={64}
            label="Kalori Hari Ini"
          />
        </div>
        <div className="mb-0">
          <CalorieWaveTracker
            current={Math.max(0, targetCalories - currentCalories)}
            target={targetCalories}
            size={64}
            label="Kalori Tersisa"
          />
        </div>
        {(onFirstPage || onPrevPage || onNextPage || onLastPage) && (
          <div className="mt-32">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={onFirstPage}
                disabled={offset === 0}
                className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                  offset === 0 ? '' : 'cursor-pointer hover:bg-[#A5DDD1]'
                } transition-colors duration-200`}
              >
                <Image
                  src="/icons/previous_arrow.png"
                  alt="Halaman Pertama"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </button>
              <button
                onClick={onPrevPage}
                disabled={offset === 0}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                  offset === 0 ? '' : 'cursor-pointer hover:bg-[#A5DDD1]'
                } transition-colors duration-200`}
              >
                <Image
                  src="/icons/start_arrow.png"
                  alt="Halaman Sebelumnya"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </button>
              <div className="text-gray-600 text-sm">
                {Math.floor(offset / recipesPerPage) + 1} dari {totalPages}
              </div>
              <button
                onClick={onNextPage}
                disabled={offset >= (totalPages - 1) * recipesPerPage}
                className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                  offset >= (totalPages - 1) * recipesPerPage
                    ? ''
                    : 'cursor-pointer hover:bg-[#A5DDD1]'
                } transition-colors duration-200`}
              >
                <Image
                  src="/icons/last_arrow.png"
                  alt="Halaman Berikutnya"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </button>
              <button
                onClick={onLastPage}
                disabled={offset >= (totalPages - 1) * recipesPerPage}
                className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
                  offset >= (totalPages - 1) * recipesPerPage
                    ? ''
                    : 'cursor-pointer hover:bg-[#A5DDD1]'
                } transition-colors duration-200`}
              >
                <Image
                  src="/icons/next_arrow.png"
                  alt="Halaman Terakhir"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;