import React, { useState } from "react";
import Image from "next/image";

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
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const truncateCategory = (category: string, maxLength: number = 12) => {
    if (category.length > maxLength) {
      return category.substring(0, maxLength) + "...";
    }
    return category;
  };

  const getDisplayCategories = () => {
    const maxWidth = 250; // Approximate container width minus padding
    const baseWidth = 40; // Base width for padding, border, etc per badge
    const charWidth = 6; // Approximate character width
    const dotsBadgeWidth = 50; // Width for "..." badge
    
    let totalWidth = 0;
    let displayCategories = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const truncatedCategory = truncateCategory(category);
      const categoryWidth = baseWidth + (truncatedCategory.length * charWidth);
      
      const wouldExceed = totalWidth + categoryWidth + (i < categories.length - 1 ? dotsBadgeWidth : 0) > maxWidth;
      
      if (wouldExceed && displayCategories.length > 0) {
        break;
      }
      
      displayCategories.push(truncatedCategory);
      totalWidth += categoryWidth + 8;
      
      if (displayCategories.length >= 2) break; 
    }
    
    return displayCategories;
  };

  const smartDisplayCategories = getDisplayCategories();
  const hasMoreSmartCategories = smartDisplayCategories.length < categories.length;

  const sanitizeDescription = (text: string) => {
    let cleanText = text.replace(/<[^>]+>/g, "");
    cleanText = cleanText.replace(/\s+/g, " ").trim();
    return cleanText;
  };

  const cleanDescription = sanitizeDescription(description);

  const handleLikeClick = () => {
    setIsLiked((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl border border-[#A5DDD1]/20 w-full max-w-[300px] flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[3/2]">
        <Image
          src={image || "/recipe-image.jpg"}
          alt={title}
          fill
          className="object-cover"
        />
        <button
          className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer border border-[#A5DDD1]/20"
          onClick={handleLikeClick}
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
      <div className="p-5 bg-gradient-to-br from-[#4CBAA4] to-[#79CBBB] flex-1 flex flex-col hover:from-[#1FA98D] hover:to-[#4CBAA4] transition-all duration-300">
        <h3 className="font-bold text-lg text-white line-clamp-1 mb-3">
          {title}
        </h3>
        <p
          className="text-white/90 text-sm mb-4 line-clamp-3 leading-relaxed"
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
        <div className="flex gap-2">
          {smartDisplayCategories.map((category, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-white/30 whitespace-nowrap"
              title={categories[i]} 
            >
              {category}
            </span>
          ))}
          {hasMoreSmartCategories && (
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white text-xs font-medium rounded-full transition-all duration-200 hover:bg-white/30 whitespace-nowrap">
              ...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
