import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface SearchBarProps {
  onProductClick: (productId: Id<"products">) => void;
}

export function SearchBar({ onProductClick }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Only search if at least 1 character is entered
  const searchResults = useQuery(
    api.products.searchProducts,
    searchTerm.length >= 1 ? { searchTerm } : "skip"
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(value.length >= 1);
  };

  const handleProductSelect = (productId: Id<"products">) => {
    setSearchTerm("");
    setIsSearching(false);
    onProductClick(productId);
  };
  
  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full z-50" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full px-4 py-3 pl-12 rounded-xl bg-white/95 backdrop-blur-sm border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-300 shadow-lg text-gray-800 placeholder-gray-500"
        />
      </div>

      {/* Improved Search Results Dropdown - Fixed position to avoid being covered */}
      {isSearching && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-blue-100 max-h-[70vh] overflow-y-auto z-[100]">
          {!searchResults ? (
            <div className="p-4 text-center text-gray-600">
              <div className="spinner mx-auto mb-2"></div>
              <p>Đang tìm kiếm...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleProductSelect(product._id)}
                  className="w-full p-3 hover:bg-blue-50 rounded-lg transition-colors text-left flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                      {product.name.includes("Trà Sữa") && "🧋"}
                      {product.name.includes("Chè") && "🍮"}
                      {product.name.includes("Nước Ép") && "🥤"}
                      {product.name.includes("Cà Phê") && "☕"}
                    {!product.name.includes("Trà Sữa") && 
                      !product.name.includes("Chè") && 
                      !product.name.includes("Nước Ép") && 
                      !product.name.includes("Cà Phê") && "🥤"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm font-semibold text-blue-600">
                      {product.basePrice.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
