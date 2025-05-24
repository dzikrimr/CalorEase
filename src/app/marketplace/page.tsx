"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";
import PaginationSidebar from "../components/PaginationSidebar";

interface Product {
  id: string;
  title: string;
  thumbnail: string;
  rating: number;
  price: string;
  source: string;
  link: string;
  category?: string;
}

const Marketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const categories = ["All", "Vegetable", "Fruit", "Meat", "Spices", "Others"];

  // Fetch products from API
  const fetchProducts = async (query = "", page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/marketplace?query=${encodeURIComponent(
          query
        )}&page=${page}&limit=${itemsPerPage}`
      );
      const data = await response.json();

      console.log("Raw API Response:", data);

      if (data.shopping_results) {
        const formattedProducts = data.shopping_results.map(
          (item: any, index: number) => {
            console.log(`Product ${index}:`, item);
            const product = {
              id: item.product_id || `prod-${index}-${Date.now()}`,
              title: item.title,
              thumbnail: item.thumbnail,
              rating: item.rating || 5.0,
              price: item.price,
              source: item.source,
              link: item.link || item.product_link || item.url || "",
              category: determineCategory(item.title),
            };
            console.log("Formatted product:", product);
            return product;
          }
        );

        console.log("All formatted products:", formattedProducts);
        setProducts(formattedProducts);
        setTotalPages(Math.ceil(formattedProducts.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple category determination based on product title
  const determineCategory = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("sayur") || lowerTitle.includes("vegetable"))
      return "Vegetable";
    if (lowerTitle.includes("buah") || lowerTitle.includes("fruit"))
      return "Fruit";
    if (lowerTitle.includes("daging") || lowerTitle.includes("meat"))
      return "Meat";
    if (lowerTitle.includes("bumbu") || lowerTitle.includes("spice"))
      return "Spices";
    return "Others";
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch when page changes
  useEffect(() => {
    fetchProducts(searchTerm, currentPage);
  }, [currentPage]); // Removed searchTerm from dependencies

  // Filter products based on selected category and ensure max 12 items
  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  const filteredProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts(searchTerm, 1); // Trigger search with current searchTerm
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-70 flex-grow p-6">
        <h1 className="text-3xl font-semibold text-teal-600 mb-6">
          Menampilkan {filtered.length} Hasil Bahan dari Marketplace
        </h1>

        {/* Category Tabs with Search */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Cari bahan makanan..."
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Show message if no products found */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Tidak ada produk yang ditemukan{" "}
                  {searchTerm ? `untuk "${searchTerm}"` : ""}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Sidebar - Pagination */}
      <PaginationSidebar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Marketplace;