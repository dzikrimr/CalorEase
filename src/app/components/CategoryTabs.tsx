import React, { useState } from "react";
import { Input } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

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
  searchValue: controlledSearchValue = "",
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Search...",
  maxVisibleCategories = 7,
}) => {
  // Use local state as fallback if onSearchChange is not provided
  const [localSearchValue, setLocalSearchValue] = useState(controlledSearchValue);
  // State to track if search has been performed
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);

  // Determine the value used for input (controlled or local)
  const searchValue = onSearchChange ? controlledSearchValue : localSearchValue;

  // Handler for input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onSearchChange) {
      onSearchChange(newValue); // Call prop onSearchChange if provided
    } else {
      setLocalSearchValue(newValue); // Use local state if onSearchChange is not provided
    }
  };

  // Handler for search button
  const handleSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit();
      setIsSearchPerformed(true); // Mark that a search has been performed
    }
  };

  // Handler for clear button
  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange(""); // Clear input via onSearchChange
    } else {
      setLocalSearchValue(""); // Clear input via local state
    }
    if (onSearchSubmit) {
      onSearchSubmit(); // Trigger search to reset results
      setIsSearchPerformed(false); // Reset search status
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit();
      setIsSearchPerformed(true); // Mark that a search has been performed
    }
  };

  // Take categories up to maxVisibleCategories
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
                ? "bg-teal-500 text-white font-medium"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border-r border-[#0C4438]`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}

        {/* Search Section */}
        <div className="flex flex-1 relative">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            onPressEnter={handleSearchKeyPress}
            style={{
              height: "45px",
              borderRadius: "0 8px 8px 0",
              paddingRight: "80px",
              border: "none",
              background: "white",
            }}
          />
          {/* Clear Button (appears if search has been performed or input is non-empty) */}
          {(searchValue || isSearchPerformed) && (
            <div className="absolute right-30 top-1/2 transform -translate-y-1/2 flex items-center z-10">
              <CloseCircleOutlined
                onClick={handleClearSearch}
                style={{
                  fontSize: "20px",
                  color: "#aaa",
                  cursor: "pointer",
                }}
              />
            </div>
          )}
          <button
            onClick={handleSearchSubmit}
            className="px-6 py-2 bg-teal-500 text-white hover:bg-teal-600 transition-colors border-l border-[#0C4438]"
          >
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;