import React from 'react';
import Image from 'next/image';

interface PaginationSidebarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationSidebar: React.FC<PaginationSidebarProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="w-30 bg-teal-100 p-4 rounded-2xl mt-50 mb-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        {/* Pagination Controls Section */}
        <div className="flex flex-col items-center gap-4">
          {/* First Page Button */}
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
              currentPage === 1 ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
            } transition-colors duration-200`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <Image
              src="/icons/previous_arrow.png"
              alt="First Page"
              width={30}
              height={30}
            />
          </button>

          {/* Previous Page Button */}
          <button 
            className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
              currentPage === 1 ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
            } transition-colors duration-200`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Image
              src="/icons/start_arrow.png"
              alt="Previous Page"
              width={40}
              height={40}
            />
          </button>

          {/* Page Numbers */}
          <div className="text-gray-600 text-sm">
            {currentPage} of {totalPages}
          </div>

          {/* Next Page Button */}
          <button 
            className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
              currentPage === totalPages ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
            } transition-colors duration-200`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Image
              src="/icons/last_arrow.png"
              alt="Next Page"
              width={40}
              height={40}
            />
          </button>

          {/* Last Page Button */}
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 p-0 disabled:opacity-50 ${
              currentPage === totalPages ? "" : "cursor-pointer hover:bg-[#A5DDD1]"
            } transition-colors duration-200`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <Image
              src="/icons/next_arrow.png"
              alt="Last Page"
              width={30}
              height={30}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationSidebar;