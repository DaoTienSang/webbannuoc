import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AdminOrdersProps {
  onBack: () => void;
}

export function AdminOrders({ onBack }: AdminOrdersProps) {
  const orders = useQuery(api.admin.getAllOrders);
  const updateOrderStatus = useMutation(api.admin.updateOrderStatus);
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const orderDetail = useQuery(
    api.orders.getOrderDetail,
    selectedOrderId ? { orderId: selectedOrderId } : "skip"
  );

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

  const handleStatusUpdate = async (orderId: Id<"orders">, newStatus: string) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  if (!orders) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (selectedOrderId && orderDetail) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedOrderId(null)}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-white">Chi tiết đơn hàng</h1>
        </div>

        <div className="glass p-6 rounded-2xl">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2 text-white">Thông tin đơn hàng</h3>
              <div className="space-y-1 text-sm text-white/80">
                <div>Mã đơn: #{orderDetail._id.slice(-8)}</div>
                <div>Ngày đặt: {new Date(orderDetail._creationTime).toLocaleDateString('vi-VN')}</div>
                <div>Thanh toán: {orderDetail.paymentMethod}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-white">Địa chỉ giao hàng</h3>
              <div className="text-sm text-white/80">
                {orderDetail.shippingAddress}
              </div>
              {orderDetail.notes && (
                <div className="mt-2">
                  <span className="font-medium text-white">Ghi chú:</span>
                  <div className="text-sm text-white/80">{orderDetail.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-white">Cập nhật trạng thái</h3>
            <div className="flex flex-wrap gap-2">
              {["pending", "confirmed", "preparing", "shipping", "delivered", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(orderDetail._id, status)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    orderDetail.orderStatus === status
                      ? getStatusColor(status)
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Sản phẩm đã đặt</h3>
            <div className="space-y-4">
              {orderDetail.items.map((item) => (
                <OrderItemDetail key={item._id} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-white/20 pt-4 mt-6">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-white">
                <span>Tạm tính:</span>
                <span>{orderDetail.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Phí vận chuyển:</span>
                <span>{orderDetail.shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>
              {orderDetail.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Giảm giá:</span>
                  <span>-{orderDetail.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-white/20 pt-2 text-white">
                <span>Tổng cộng:</span>
                <span className="text-blue-400">
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-white">📋 Quản lý đơn hàng</h1>
      </div>

      {/* Orders List */}
      <div className="glass p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 text-white font-semibold">Mã đơn</th>
                <th className="text-left py-3 text-white font-semibold">Khách hàng</th>
                <th className="text-left py-3 text-white font-semibold">Ngày đặt</th>
                <th className="text-left py-3 text-white font-semibold">Tổng tiền</th>
                <th className="text-left py-3 text-white font-semibold">Trạng thái</th>
                <th className="text-left py-3 text-white font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-white/10">
                  <td className="py-4 text-white">#{order._id.slice(-8)}</td>
                  <td className="py-4 text-white">
                    {order.user?.name || order.customerName || "Khách vãng lai"}
                  </td>
                  <td className="py-4 text-white">
                    {new Date(order._creationTime).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 text-white">
                    {order.finalAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.orderStatus)}`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => setSelectedOrderId(order._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Tách thành component riêng để xử lý việc hiển thị ảnh sản phẩm
function OrderItemDetail({ item }: { item: any }) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    item.product?.imageUrl ? { storageId: item.product.imageUrl } : "skip"
  );

  return (
    <div className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl">
      <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
        {item.product?.imageUrl && imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.product?.name}
            className="w-full h-full object-cover"
          />
        ) : (
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
        )}
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium text-white">{item.product?.name}</h4>
        
        {/* Options */}
        <div className="text-sm text-white/70 mt-1">
          {item.selectedOptions.size && (
            <span className="mr-3">Size: {item.selectedOptions.size}</span>
          )}
          {item.selectedOptions.sugar && (
            <span className="mr-3">Đường: {item.selectedOptions.sugar}</span>
          )}
          {item.selectedOptions.ice && (
            <span>Đá: {item.selectedOptions.ice}</span>
          )}
        </div>

        {/* Toppings */}
        {item.toppings.length > 0 && (
          <div className="text-sm text-white/70 mt-1">
            Topping: {item.toppings.map((t: any) => `${t.topping?.name} (${t.quantity})`).join(", ")}
          </div>
        )}
        
        {/* Special Instructions */}
        {item.specialInstructions && (
          <div className="text-sm text-white/70 mt-1">
            <span className="font-medium">Yêu cầu đặc biệt:</span> {item.specialInstructions}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-white/80">Số lượng: {item.quantity}</span>
          <span className="font-medium text-white">
            {item.subtotal.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>
    </div>
  );
}
