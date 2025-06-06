import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface WishlistProps {
  onBack: () => void;
  onProductClick: (productId: Id<"products">) => void;
}

export function Wishlist({ onBack, onProductClick }: WishlistProps) {
  const wishlist = useQuery(api.wishlist.getWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);

  const handleRemoveFromWishlist = async (productId: Id<"products">) => {
    try {
      await removeFromWishlist({ productId });
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  if (!wishlist) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-white">Danh sách yêu thích</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-8xl mb-4 animate-float">💝</div>
          <h2 className="text-2xl font-semibold mb-2 text-white">Danh sách yêu thích trống</h2>
          <p className="text-white/80 mb-6">Hãy thêm một số sản phẩm yêu thích của bạn</p>
          <button
            onClick={onBack}
            className="btn-primary"
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item._id} className="product-card p-6 animate-bounce-in">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-6xl animate-float">
                    {item.product?.name.includes("Trà Sữa") && "🧋"}
                    {item.product?.name.includes("Chè") && "🍮"}
                    {item.product?.name.includes("Nước Ép") && "🥤"}
                    {item.product?.name.includes("Cà Phê") && "☕"}
                  </span>
                </div>
                
                <button
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-800">{item.product?.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{item.product?.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="price-tag">
                    {item.product?.basePrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className={item.product?.isAvailable ? "status-available" : "status-unavailable"}>
                    {item.product?.isAvailable ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>

                <button
                  onClick={() => onProductClick(item.productId)}
                  className="w-full btn-primary"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
