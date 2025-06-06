import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: Id<"products">;
  className?: string;
}

export function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
  const isInWishlist = useQuery(api.wishlist.isInWishlist, { productId });
  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isInWishlist) {
        await removeFromWishlist({ productId });
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlist({ productId });
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`p-2 rounded-full transition-all duration-300 backdrop-blur-sm ${
        isInWishlist 
          ? "text-red-500 bg-white/90 hover:bg-white shadow-md" 
          : "text-gray-400 bg-white/80 hover:bg-white hover:text-red-500 shadow-md"
      } ${className}`}
      title={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      <svg 
        className={`w-5 h-5 ${isInWishlist ? "heart-beat" : ""}`}
        fill={isInWishlist ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  );
}
