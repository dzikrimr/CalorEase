// components/CalorieTracker.tsx
import React from 'react';

interface CalorieTrackerProps {
  targetCalories: number;
  currentCalories: number;
}

const CalorieTracker: React.FC<CalorieTrackerProps> = ({ targetCalories, currentCalories }) => {
  const remainingCalories = targetCalories - currentCalories;
  
  return (
    <div className="w-64 p-6 bg-teal-50">
      <div className="mb-8">
        <h3 className="text-gray-700 mb-2">Target Kalori</h3>
        <div className="bg-white rounded-full p-2 flex justify-center items-center">
          <span className="text-teal-500 font-semibold">{targetCalories}</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-gray-700 mb-2">Kalori Hari Ini</h3>
        <div className="bg-white rounded-full p-2 flex justify-center items-center">
          <span className="text-teal-500 font-semibold">{currentCalories}</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-gray-700 mb-2">Sisa Kalori</h3>
        <div className="bg-white rounded-full p-2 flex justify-center items-center">
          <span className="text-teal-500 font-semibold">{remainingCalories}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CalorieTracker;