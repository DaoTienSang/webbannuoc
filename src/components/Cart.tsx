import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface CartProps {
  onBack: () => void;
}

export function Cart({ onBack }: CartProps) {
  const cart = useQuery(api.cart.getCart);
  const updateCartItem = useMutation(api.cart.updateCartItem);
  const removeFromCart = useMutation(api.cart.removeFromCart);
  const createOrder = useMutation(api.orders.createOrder);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");

  if (!cart) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingFee = totalAmount >= 200000 ? 0 : 25000;
  const finalAmount = totalAmount + shippingFee;

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateCartItem({ cartItemId: cartItemId as Id<"cartItems">, quantity: newQuantity });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật giỏ hàng");
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeFromCart({ cartItemId: cartItemId as Id<"cartItems"> });
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setIsCheckingOut(true);
    try {
      await createOrder({
        shippingAddress,
        paymentMethod,
        notes: notes || undefined,
      });
      toast.success("Đặt hàng thành công!");
      onBack();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt hàng");
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Quay lại
        </button>
        <h1 className="text-2xl font-bold">Giỏ hàng</h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 text-blue-50 opacity-50 transform -translate-y-1/2 translate-x-1/2">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-1.5C87,13.4,81.4,26.8,73.6,38.2C65.8,49.5,55.9,58.8,44.2,64.2C32.4,69.5,18.9,70.9,5.4,72.8C-8.1,74.8,-21.5,77.3,-33.9,73.9C-46.3,70.5,-57.6,61.2,-67.1,49.6C-76.6,38,-84.2,24.1,-86.1,9.5C-88,-5.1,-84.1,-20.3,-76.6,-32.6C-69.1,-44.9,-58,-54.3,-45.4,-62.4C-32.8,-70.6,-18.6,-77.5,-2.9,-79.1C12.8,-80.7,30.5,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="text-7xl mb-6 animate-float">🛒</div>
          <h2 className="text-2xl font-semibold mb-3">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Hãy thêm một số sản phẩm yêu thích vào giỏ hàng của bạn để tiếp tục mua sắm
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Tiếp tục mua sắm
          </button>
          
          <div className="absolute bottom-0 left-0 w-24 h-24 text-pink-100 opacity-50 transform translate-y-1/3 -translate-x-1/3">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M47.7,-73.2C62.1,-66.3,74.5,-54.5,79.8,-40.1C85.1,-25.7,83.3,-8.6,79.4,7C75.4,22.6,69.2,36.8,59.1,47.4C49,58,34.9,65,20.3,69.7C5.6,74.4,-9.6,76.8,-23.1,73.2C-36.6,69.6,-48.3,60,-57.4,48.1C-66.5,36.1,-73,21.9,-76.9,6.1C-80.7,-9.7,-82,-27,-74.9,-39.8C-67.9,-52.7,-52.6,-61,-37.7,-67.8C-22.8,-74.7,-8.3,-80.2,6.5,-80.4C21.3,-80.5,33.4,-80.2,47.7,-73.2Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-blue-50/30 p-4 rounded-xl mb-6 flex items-center">
              <div className="text-2xl mr-3">🛍️</div>
              <div>
                <h3 className="font-medium text-blue-800">Giỏ hàng của bạn ({cart.length} món)</h3>
                <p className="text-sm text-blue-600">Miễn phí vận chuyển cho đơn hàng từ 200.000đ</p>
              </div>
            </div>
            
            {cart.map((item) => (
              <CartItem 
                key={item._id} 
                item={item} 
                handleUpdateQuantity={handleUpdateQuantity} 
                handleRemoveItem={handleRemoveItem} 
              />
            ))}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={onBack}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <span className="mr-1">+</span> Thêm sản phẩm khác
              </button>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit relative">
            <div className="absolute top-0 right-0 w-32 h-32 text-blue-50 opacity-50 transform -translate-y-1/3 translate-x-1/3">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M47.3,-79.6C60.9,-71.2,71.3,-57.9,77.8,-43.1C84.2,-28.2,86.7,-11.7,83.7,3.1C80.6,17.8,72.1,30.9,62.7,42.8C53.4,54.7,43.2,65.4,30.7,71.8C18.2,78.2,3.5,80.3,-12.1,79.6C-27.6,78.9,-44,75.4,-56.4,66.5C-68.9,57.6,-77.3,43.3,-81.3,27.8C-85.2,12.3,-84.7,-4.4,-79.8,-19.2C-74.9,-34,-65.6,-46.9,-53.5,-56.1C-41.5,-65.2,-26.7,-70.6,-11.1,-73.1C4.5,-75.6,20.1,-75.3,33.6,-80.1C47.1,-84.9,58.5,-95.8,69.9,-96.6" transform="translate(100 100)" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="text-2xl mr-2">🧾</span> Thông tin đặt hàng
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <span className="text-lg mr-2">📍</span> Địa chỉ giao hàng *
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng đầy đủ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <span className="text-lg mr-2">💳</span> Phương thức thanh toán
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                      paymentMethod === "COD" 
                        ? "border-blue-600 bg-blue-50 text-blue-800" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl mb-1">💵</span>
                    <span className="text-xs font-medium">COD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("VNPay")}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                      paymentMethod === "VNPay" 
                        ? "border-blue-600 bg-blue-50 text-blue-800" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl mb-1">🏦</span>
                    <span className="text-xs font-medium">VNPay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Momo")}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                      paymentMethod === "Momo" 
                        ? "border-blue-600 bg-blue-50 text-blue-800" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl mb-1">📱</span>
                    <span className="text-xs font-medium">Momo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <span className="text-lg mr-2">📝</span> Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú cho đơn hàng..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  ) : (
                    `${shippingFee.toLocaleString('vi-VN')}đ`
                  )}
                </span>
              </div>
              {totalAmount < 200000 && (
                <div className="text-sm bg-blue-50 text-blue-700 p-2 rounded-lg mt-2 flex items-start">
                  <span className="text-lg mr-2 mt-0.5">💡</span>
                  <span>Mua thêm {(200000 - totalAmount).toLocaleString('vi-VN')}đ để được miễn phí ship</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{finalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || !shippingAddress.trim()}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="mr-2">✅</span> Đặt hàng
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Tách thành component riêng để xử lý việc hiển thị ảnh sản phẩm
function CartItem({ 
  item, 
  handleUpdateQuantity, 
  handleRemoveItem 
}: { 
  item: any, 
  handleUpdateQuantity: (id: string, quantity: number) => Promise<void>,
  handleRemoveItem: (id: string) => Promise<void>
}) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    item.product?.imageUrl ? { storageId: item.product.imageUrl } : "skip"
  );

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center overflow-hidden">
          {item.product?.imageUrl && imageUrl ? (
            <img 
              src={imageUrl} 
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">
              {item.product?.name.includes("Trà Sữa") && "🧋"}
              {item.product?.name.includes("Chè") && "🍮"}
              {item.product?.name.includes("Nước Ép") && "🥤"}
              {item.product?.name.includes("Cà Phê") && "☕"}
              {!item.product?.name.includes("Trà Sữa") && 
                !item.product?.name.includes("Chè") && 
                !item.product?.name.includes("Nước Ép") && 
                !item.product?.name.includes("Cà Phê") && "🥤"}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-semibold text-lg text-blue-800">{item.product?.name}</h3>
            <div className="font-bold text-blue-600">{item.totalPrice.toLocaleString('vi-VN')}đ</div>
          </div>
          
          {/* Hiển thị các tùy chọn đã chọn */}
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {item.selectedOptions.size && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
                  Size: {item.selectedOptions.size}
                </span>
              )}
              {item.selectedOptions.sugar && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
                  Đường: {item.selectedOptions.sugar}
                </span>
              )}
              {item.selectedOptions.ice && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
                  Đá: {item.selectedOptions.ice}
                </span>
              )}
            </div>

            {/* Hiển thị các topping đã chọn */}
            {item.toppings.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Topping:</span> {item.toppings.map((t: any) => `${t.topping?.name} (${t.quantity})`).join(", ")}
              </div>
            )}

            {/* Hiển thị ghi chú đặc biệt */}
            {item.specialInstructions && (
              <div className="mt-2 text-sm text-gray-600 italic">
                <span className="font-medium">Ghi chú:</span> {item.specialInstructions}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleRemoveItem(item._id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
