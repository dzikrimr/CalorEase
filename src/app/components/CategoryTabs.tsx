import React, { useState } from 'react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceholder?: string;
  maxVisibleCategories?: number;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  searchValue: controlledSearchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search...',
  maxVisibleCategories = 7,
}) => {
  // Gunakan state lokal sebagai fallback jika onSearchChange tidak diberikan
  const [localSearchValue, setLocalSearchValue] = useState(controlledSearchValue);
  // State untuk melacak apakah pencarian telah dilakukan
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);

  // Tentukan nilai yang digunakan untuk input (controlled atau lokal)
  const searchValue = onSearchChange ? controlledSearchValue : localSearchValue;

  // Handler untuk perubahan input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onSearchChange) {
      onSearchChange(newValue); // Panggil prop onSearchChange jika ada
    } else {
      setLocalSearchValue(newValue); // Gunakan state lokal jika onSearchChange tidak ada
    }
  };

  // Handler untuk tombol search
  const handleSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit();
      setIsSearchPerformed(true); // Tandai bahwa pencarian telah dilakukan
    }
  };

  // Handler untuk tombol remove
  const handleRemove = () => {
    if (onSearchChange) {
      onSearchChange(''); // Kosongkan input melalui onSearchChange
    } else {
      setLocalSearchValue(''); // Kosongkan input melalui state lokal
    }
    if (onSearchSubmit) {
      onSearchSubmit(); // Lakukan pencarian ulang untuk mengembalikan hasil default
      setIsSearchPerformed(false); // Reset status pencarian
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
      setIsSearchPerformed(true); // Tandai bahwa pencarian telah dilakukan
    }
  };

  // Ambil kategori sesuai batas maksimal
  const visibleCategories = categories.slice(0, maxVisibleCategories);

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex border-1 border-[#0C4438] rounded-lg overflow-hidden">
        {/* Category Tabs */}
        {visibleCategories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 text-center whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-teal-500 text-white font-medium'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-r border-[#0C4438]`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}

        {/* Search Section */}
        <div className="flex flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              className={`w-full px-4 py-2 text-gray-700 bg-white focus:outline-none focus:bg-gray-50 ${
                isSearchPerformed ? 'pr-10' : ''
              }`}
            />
            {/* Remove Button (muncul hanya jika pencarian telah dilakukan) */}
            {isSearchPerformed && (
              <button
                onClick={handleRemove}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200/50 rounded-full text-gray-700 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearchSubmit}
            className="px-4 py-2 bg-teal-500 text-white hover:bg-teal-600 transition-colors border-l border-[#0C4438]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;