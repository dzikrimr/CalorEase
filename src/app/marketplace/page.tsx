"use client";
import React, { useState, useEffect } from "react";
import { Input } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
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
  const [inputText, setInputText] = useState(""); // State for input value
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const itemsPerPage = 12; // Display 12 products per page

  const categories = ["All", "Vegetable", "Fruit", "Meat", "Spices", "Others"];

  const formatPrice = (priceStr: string): string => {
    let numericPrice = priceStr.replace(/[^0-9,.]/g, "").replace(",", ".");
    const price = parseFloat(numericPrice);
    if (isNaN(price)) return "Rp 0";
    return `Rp ${price.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const fetchProducts = async (query = "", page = 1) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const foodKeywords = "fresh produce edible grocery";
      const finalQuery = query ? `${query} ${foodKeywords}` : foodKeywords;
      const limit = 100; // Fetch a large batch (max allowed by SerpAPI)

      const response = await fetch(
        `/api/marketplace?query=${encodeURIComponent(
          finalQuery
        )}&page=${page}&limit=${limit}`
      );
      const data = await response.json();

      console.log("Raw API Response:", {
        shopping_results: data.shopping_results?.length,
        total_results: data.pagination?.total,
        query: finalQuery,
        page,
        error: data.error,
      });

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      if (data.shopping_results && data.shopping_results.length > 0) {
        const formattedProducts = data.shopping_results.map(
          (item: any, index: number) => ({
            id: item.product_id || `prod-${index}-${Date.now()}`,
            title: item.title || "Unknown Product",
            thumbnail: item.thumbnail || "/images/placeholder-food.jpg",
            rating: Number(item.rating || 5.0).toFixed(1),
            price: formatPrice(
              item.price || item.extracted_price?.toString() || "0"
            ),
            source: item.source || "Unknown",
            link: item.link || item.product_link || item.url || "",
            category: determineCategory(item.title || ""),
          })
        );

        console.log("All formatted products:", formattedProducts);
        setProducts(formattedProducts);
        const total = data.pagination?.total || formattedProducts.length;
        setTotalResults(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setProducts([]);
        setTotalResults(0);
        setTotalPages(1);
        setErrorMessage("No products found for this query.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalResults(0);
      setTotalPages(1);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching products."
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchProducts(); // Initial fetch with no query
  }, []);

  // Filter products by category
  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  // Apply client-side pagination
  const filteredProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update total results and pages after filtering
  useEffect(() => {
    setTotalResults(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to page 1 when category changes
  }, [filtered]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setInputText(value); // Update input text without triggering search
  };

  const handleSearchSubmit = () => {
    console.log("Search button clicked with value:", inputText);
    setSearchTerm(inputText);
    setCurrentPage(1);
    fetchProducts(inputText, 1);
  };

  const handleClearSearch = () => {
    console.log("Clear search clicked");
    setInputText("");
    setSearchTerm("");
    setCurrentPage(1);
    fetchProducts("", 1); // Reset to initial product list
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="ml-70 flex-grow p-6">
        <h1 className="text-3xl font-semibold text-teal-600 mb-6">
          Menampilkan {totalResults} Hasil Bahan dari Marketplace
        </h1>
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          searchValue={inputText}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Cari bahan makanan..."
        />
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{errorMessage}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Tidak ada produk yang ditemukan untuk kategori "{activeCategory}"
                  {searchTerm ? ` dan pencarian "${searchTerm}"` : ""}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <PaginationSidebar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Marketplace;