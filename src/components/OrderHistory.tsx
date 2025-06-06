import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface OrderHistoryProps {
  onBack: () => void;
}

export function OrderHistory({ onBack }: OrderHistoryProps) {
  const orders = useQuery(api.orders.getUserOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const orderDetail = useQuery(
    api.orders.getOrderDetail,
    selectedOrderId ? { orderId: selectedOrderId } : "skip"
  );

  if (!orders) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "shipping":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "preparing":
        return "Đang chuẩn bị";
      case "shipping":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "confirmed":
        return "✅";
      case "preparing":
        return "👨‍🍳";
      case "shipping":
        return "🚚";
      case "delivered":
        return "📦";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  if (selectedOrderId && orderDetail) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedOrderId(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
          <div className="absolute top-0 right-0 w-32 h-32 text-blue-50 opacity-50 transform -translate-y-1/3 translate-x-1/3">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M47.3,-79.6C60.9,-71.2,71.3,-57.9,77.8,-43.1C84.2,-28.2,86.7,-11.7,83.7,3.1C80.6,17.8,72.1,30.9,62.7,42.8C53.4,54.7,43.2,65.4,30.7,71.8C18.2,78.2,3.5,80.3,-12.1,79.6C-27.6,78.9,-44,75.4,-56.4,66.5C-68.9,57.6,-77.3,43.3,-81.3,27.8C-85.2,12.3,-84.7,-4.4,-79.8,-19.2C-74.9,-34,-65.6,-46.9,-53.5,-56.1C-41.5,-65.2,-26.7,-70.6,-11.1,-73.1C4.5,-75.6,20.1,-75.3,33.6,-80.1C47.1,-84.9,58.5,-95.8,69.9,-96.6" transform="translate(100 100)" />
            </svg>
          </div>
          
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50/30 p-4 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="text-lg mr-2">📋</span> Thông tin đơn hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mã đơn:</span>
                  <span className="font-medium">#{orderDetail._id.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span className="font-medium">{new Date(orderDetail._creationTime).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusColor(orderDetail.orderStatus)}`}>
                    <span className="mr-1">{getStatusIcon(orderDetail.orderStatus)}</span>
                    {getStatusText(orderDetail.orderStatus)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Thanh toán:</span>
                  <span className="font-medium">{orderDetail.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/30 p-4 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="text-lg mr-2">📍</span> Địa chỉ giao hàng
              </h3>
              <div className="text-sm text-gray-700">
                {orderDetail.shippingAddress}
              </div>
              {orderDetail.notes && (
                <div className="mt-3 bg-white p-3 rounded-lg border border-gray-100">
                  <span className="font-medium text-sm flex items-center">
                    <span className="text-lg mr-2">📝</span> Ghi chú:
                  </span>
                  <div className="text-sm text-gray-600 mt-1 italic">{orderDetail.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="text-lg mr-2">🧋</span> Sản phẩm đã đặt
            </h3>
            <div className="space-y-3">
              {orderDetail.items.map((item) => (
                <div key={item._id} className="flex items-start space-x-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">
                      {item.product?.name.includes("Trà Sữa") && "🧋"}
                      {item.product?.name.includes("Chè") && "🍮"}
                      {item.product?.name.includes("Nước Ép") && "🥤"}
                      {item.product?.name.includes("Cà Phê") && "☕"}
                      {!item.product?.name.includes("Trà Sữa") && 
                        !item.product?.name.includes("Chè") && 
                        !item.product?.name.includes("Nước Ép") && 
                        !item.product?.name.includes("Cà Phê") && "🥤"}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-blue-800">{item.product?.name}</h4>
                      <span className="font-semibold text-blue-600">
                        {item.subtotal.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    
                    {/* Options */}
                    <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                      {item.selectedOptions.size && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs">
                          Size: {item.selectedOptions.size}
                        </span>
                      )}
                      {item.selectedOptions.sugar && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs">
                          Đường: {item.selectedOptions.sugar}
                        </span>
                      )}
                      {item.selectedOptions.ice && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs">
                          Đá: {item.selectedOptions.ice}
                        </span>
                      )}
                    </div>

                    {/* Toppings */}
                    {item.toppings.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Topping:</span> {item.toppings.map(t => `${t.topping?.name} (${t.quantity})`).join(", ")}
                      </div>
                    )}

                    <div className="mt-2 text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4 mt-6">
            <div className="space-y-2 max-w-sm ml-auto bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{orderDetail.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>
                  {orderDetail.shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  ) : (
                    `${orderDetail.shippingFee.toLocaleString('vi-VN')}đ`
                  )}
                </span>
              </div>
              {orderDetail.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{orderDetail.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2 mt-2">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">
                  {orderDetail.finalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 text-blue-50 opacity-50 transform -translate-y-1/2 translate-x-1/2">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-1.5C87,13.4,81.4,26.8,73.6,38.2C65.8,49.5,55.9,58.8,44.2,64.2C32.4,69.5,18.9,70.9,5.4,72.8C-8.1,74.8,-21.5,77.3,-33.9,73.9C-46.3,70.5,-57.6,61.2,-67.1,49.6C-76.6,38,-84.2,24.1,-86.1,9.5C-88,-5.1,-84.1,-20.3,-76.6,-32.6C-69.1,-44.9,-58,-54.3,-45.4,-62.4C-32.8,-70.6,-18.6,-77.5,-2.9,-79.1C12.8,-80.7,30.5,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="text-7xl mb-6 animate-float">📋</div>
          <h2 className="text-2xl font-semibold mb-3">Chưa có đơn hàng nào</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Bạn chưa đặt đơn hàng nào. Hãy mua sắm và đặt đơn hàng đầu tiên của bạn!
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Bắt đầu mua sắm
          </button>
          
          <div className="absolute bottom-0 left-0 w-24 h-24 text-pink-100 opacity-50 transform translate-y-1/3 -translate-x-1/3">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M47.7,-73.2C62.1,-66.3,74.5,-54.5,79.8,-40.1C85.1,-25.7,83.3,-8.6,79.4,7C75.4,22.6,69.2,36.8,59.1,47.4C49,58,34.9,65,20.3,69.7C5.6,74.4,-9.6,76.8,-23.1,73.2C-36.6,69.6,-48.3,60,-57.4,48.1C-66.5,36.1,-73,21.9,-76.9,6.1C-80.7,-9.7,-82,-27,-74.9,-39.8C-67.9,-52.7,-52.6,-61,-37.7,-67.8C-22.8,-74.7,-8.3,-80.2,6.5,-80.4C21.3,-80.5,33.4,-80.2,47.7,-73.2Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50/30 p-4 rounded-xl mb-6 flex items-center">
            <div className="text-2xl mr-3">📊</div>
            <div>
              <h3 className="font-medium text-blue-800">Lịch sử đơn hàng của bạn</h3>
              <p className="text-sm text-blue-600">Nhấp vào đơn hàng để xem chi tiết</p>
            </div>
          </div>
          
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
              onClick={() => setSelectedOrderId(order._id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-blue-800 flex items-center">
                    <span className="mr-2">{getStatusIcon(order.orderStatus)}</span>
                    Đơn hàng #{order._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order._creationTime).toLocaleDateString('vi-VN')} - {new Date(order._creationTime).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">
                    {order.finalAmount.toLocaleString('vi-VN')}đ
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.orderStatus)}`}>
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-lg mr-2">💳</span>
                  <span>Thanh toán: {order.paymentMethod}</span>
                </div>
                <div className="mt-1 truncate flex items-center">
                  <span className="text-lg mr-2">📍</span>
                  <span>Địa chỉ: {order.shippingAddress}</span>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-end">
                Xem chi tiết <span className="ml-1">→</span>
              </div>
              
              <div className="absolute top-0 right-0 w-16 h-16 text-blue-50 opacity-30">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M47.7,-73.2C62.1,-66.3,74.5,-54.5,79.8,-40.1C85.1,-25.7,83.3,-8.6,79.4,7C75.4,22.6,69.2,36.8,59.1,47.4C49,58,34.9,65,20.3,69.7C5.6,74.4,-9.6,76.8,-23.1,73.2C-36.6,69.6,-48.3,60,-57.4,48.1C-66.5,36.1,-73,21.9,-76.9,6.1C-80.7,-9.7,-82,-27,-74.9,-39.8C-67.9,-52.7,-52.6,-61,-37.7,-67.8C-22.8,-74.7,-8.3,-80.2,6.5,-80.4C21.3,-80.5,33.4,-80.2,47.7,-73.2Z" transform="translate(100 100)" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
