import React from "react";
import Image from "next/image";
import { useFavorites } from "../context/FavoritesContext";

interface RecipeCardProps {
  title: string;
  description: string;
  categories: string[];
  image?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  description,
  categories,
  image,
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite, getFavoriteByTitle } = useFavorites();
  const isLiked = isFavorite(title);

  // Limit categories to 2 and add "..." if more
  const maxCategories = 2;
  const displayedCategories = categories.slice(0, maxCategories);
  const hasMoreCategories = categories.length > maxCategories;

  // Sanitize description to remove HTML tags and handle long words
  const sanitizeDescription = (text: string) => {
    // Remove HTML tags
    let cleanText = text.replace(/<[^>]+>/g, "");
    // Replace multiple spaces with single space
    cleanText = cleanText.replace(/\s+/g, " ").trim();
    return cleanText;
  };

  const cleanDescription = sanitizeDescription(description);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event if you have one
    
    if (isLiked) {
      // Remove from favorites
      const favoriteRecipe = getFavoriteByTitle(title);
      if (favoriteRecipe) {
        removeFromFavorites(favoriteRecipe.id);
      }
    } else {
      // Add to favorites
      addToFavorites({
        title,
        description: cleanDescription,
        categories,
        image: image || "/recipe-image.jpg",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 w-full max-w-[300px] flex flex-col cursor-pointer">
      <div className="relative aspect-[3/2]">
        <Image
          src={image || "/recipe-image.jpg"}
          alt={title}
          fill
          className="object-cover"
        />
        <button
          className={`absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-all duration-200 cursor-pointer ${
            isLiked ? 'bg-red-50 shadow-red-200' : ''
          }`}
          onClick={handleLikeClick}
          title={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          <Image
            src={isLiked ? "/icons/love-filled.png" : "/icons/love.png"}
            alt={isLiked ? "Unlike" : "Like"}
            width={20}
            height={20}
            className="object-contain"
          />
        </button>
      </div>
      <div className="p-4 bg-[#1FA98D] flex-1 flex flex-col hover:bg-[#1FA98D]/80 transition-colors duration-200">
        <h3 className="font-semibold text-lg text-white line-clamp-1">
          {title}
        </h3>
        <p
          className="text-white text-sm mb-4 line-clamp-3"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
          }}
        >
          {cleanDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {displayedCategories.map((category, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-transparent border border-white text-white text-xs rounded-lg"
            >
              {category}
            </span>
          ))}
          {hasMoreCategories && (
            <span className="px-3 py-1 bg-transparent border border-white text-white text-xs rounded-lg">
              ...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;