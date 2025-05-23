import React from 'react';
import Image from 'next/image';

interface RecipeCardProps {
  title: string;
  description: string;
  categories: string[];
  image?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ title, description, categories, image }) => {
  // Limit categories to 2 and add "..." if more
  const maxCategories = 2;
  const displayedCategories = categories.slice(0, maxCategories);
  const hasMoreCategories = categories.length > maxCategories;

  // Sanitize description to remove HTML tags and handle long words
  const sanitizeDescription = (text: string) => {
    // Remove HTML tags
    let cleanText = text.replace(/<[^>]+>/g, '');
    // Replace multiple spaces with single space
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    return cleanText;
  };

  const cleanDescription = sanitizeDescription(description);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 w-full max-w-[300px] flex flex-col">
      <div className="relative aspect-[3/2]">
        <Image
          src={image || "/recipe-image.jpg"}
          alt={title}
          fill
          className="object-cover"
        />
        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-500"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div className="p-4 bg-[#1FA98D] flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-white line-clamp-1">{title}</h3>
        <p
          className="text-white text-sm mb-4 line-clamp-3"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
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