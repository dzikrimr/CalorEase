import React from 'react';
import Image from 'next/image';

interface ProductProps {
  id: string;
  title: string;
  thumbnail: string;
  rating: number;
  price: string;
  link: string;
}

const StarIcon = () => (
  <svg className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
  </svg>
);

const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  // Shorten long titles
  const displayTitle = product.title.length > 45 
    ? `${product.title.substring(0, 45)}...` 
    : product.title;

  // Format rating to always show one decimal place
  const formattedRating = Number(product.rating).toFixed(1);

  // Handle button click
  const handleViewToShop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validasi apakah link tersedia
    if (product.link) {
      // Buka link di tab baru
      window.open(product.link, '_blank', 'noopener,noreferrer');
    } else {
      console.error('Product link is not available');
      alert('Link produk tidak tersedia');
    }
  };

  return (
    <div className="w-full max-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Image Section - Height Fixed */}
      <div className="p-4 h-48 flex items-center justify-center bg-white">
        <Image 
          src={product.thumbnail || '/images/placeholder-food.jpg'} 
          alt={product.title} 
          width={200} 
          height={150} 
          className="rounded-lg object-contain max-h-full"
        />
      </div>
      
      {/* Footer Section - Will Always Stick to Bottom */}
      <div className="px-4 pb-4 pt-4 bg-[#A5DDD7] mt-auto">
        <div className="block cursor-pointer" onClick={() => product.link && window.open(product.link, '_blank', 'noopener,noreferrer')}>
          <h3 className="text-sm font-medium text-black mb-2 min-h-[40px] hover:text-teal-700 transition-colors">{displayTitle}</h3>
        </div>
        
        <div className="flex items-center mt-2.5 mb-3">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="bg-white text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-sm ms-3">
            {formattedRating}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{product.price}</span>
          <button 
            onClick={handleViewToShop}
            className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-xs px-3 py-2 text-center transition-colors cursor-pointer"
            type="button"
          >
            View to Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;