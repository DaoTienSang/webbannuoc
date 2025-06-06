import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { WishlistButton } from "./WishlistButton";
import { useEffect, useRef } from "react";

interface ProductGridProps {
  categoryId: Id<"categories">;
  onProductClick: (productId: Id<"products">) => void;
  onBack: () => void;
}

export function ProductGrid({ categoryId, onProductClick, onBack }: ProductGridProps) {
  const data = useQuery(api.products.getProductsByCategory, { categoryId });
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const swiperInstanceRef = useRef<any>(null);

  // Load Swiper script if not already loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Swiper) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  // Initialize Swiper when products data is loaded
  useEffect(() => {
    if (data?.products && data.products.length > 0 && swiperContainerRef.current) {
      // Wait for Swiper to be available
      const initSwiper = () => {
        if (typeof window !== 'undefined' && (window as any).Swiper) {
          // Destroy previous instance if it exists
          if (swiperInstanceRef.current) {
            swiperInstanceRef.current.destroy();
          }

          // Create new Swiper instance
          const Swiper = (window as any).Swiper;
          swiperInstanceRef.current = new Swiper(swiperContainerRef.current, {
            slidesPerView: 3,
            spaceBetween: 30,
            centeredSlides: true,
            loop: true,
            effect: 'coverflow',
            coverflowEffect: {
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: false,
            },
            simulateTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }
          });
        } else {
          // If Swiper is not available yet, try again after a short delay
          setTimeout(initSwiper, 100);
        }
      };

      initSwiper();

      return () => {
        if (swiperInstanceRef.current) {
          swiperInstanceRef.current.destroy();
        }
      };
    }
  }, [data?.products]);

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  const { category, products } = data;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/80 backdrop-blur-sm text-blue-700 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg border border-blue-200"
        >
          ← Quay lại
        </button>
        <div>
          <h1 className="text-3xl font-bold text-blue-800">{category?.name}</h1>
          <p className="text-blue-600">{category?.description}</p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-8xl mb-4 animate-float">📦</div>
          <p className="text-blue-600 text-xl">Chưa có sản phẩm nào trong danh mục này</p>
        </div>
      ) : (
        <div className="relative py-10">
          <div className="swiper" ref={swiperContainerRef}>
            <div className="swiper-wrapper">
              {products.map((product) => (
                <div key={product._id} className="swiper-slide">
                  <div className="product-slide" onClick={() => onProductClick(product._id)}>
                    <div className="product-slide-image">
                      <ProductImage product={product} />
                      
                      <div className="product-wishlist">
                        <WishlistButton 
                          productId={product._id} 
                          className="shadow-lg"
                        />
                      </div>
                      
                      <div className={`product-status ${product.isAvailable ? "available" : "unavailable"}`}>
                        {product.isAvailable ? "Còn hàng" : "Hết hàng"}
                      </div>
                    </div>
                    
                    <div className="product-info">
                      <div className="product-title">{product.name}</div>
                      <div className="product-price">{product.basePrice.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="swiper-button swiper-button-next"></div>
            <div className="swiper-button swiper-button-prev"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for product image
function ProductImage({ product }: { product: any }) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    product.imageUrl ? { storageId: product.imageUrl } : "skip"
  );

  if (product.imageUrl && imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={product.name}
        className="w-full h-full object-cover"
      />
    );
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <span className="text-6xl">
        {product.name.includes("Trà Sữa") && "🧋"}
        {product.name.includes("Chè") && "🍮"}
        {product.name.includes("Nước Ép") && "🥤"}
        {product.name.includes("Cà Phê") && "☕"}
        {!product.name.includes("Trà Sữa") && 
          !product.name.includes("Chè") && 
          !product.name.includes("Nước Ép") && 
          !product.name.includes("Cà Phê") && "🥤"}
      </span>
    </div>
  );
}
