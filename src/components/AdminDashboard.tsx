import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminProducts } from "./AdminProducts";
import { AdminOrders } from "./AdminOrders";
import { AdminCategories } from "./AdminCategories";
import { AdminToppings } from "./AdminToppings";
import { AdminUsers } from "./AdminUsers";
import { AdminAnalytics } from "./AdminAnalytics";
import { AdminSettings } from "./AdminSettings";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

type AdminView = "dashboard" | "products" | "orders" | "categories" | "toppings" | "users" | "analytics" | "settings";

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const stats = useQuery(api.admin.getDashboardStats);
  const addSampleData = useMutation(api.products.addSampleData);
  const [isAddingSampleData, setIsAddingSampleData] = useState(false);

  const handleAddSampleData = async () => {
    setIsAddingSampleData(true);
    try {
      const result = await addSampleData();
      toast.success(result.message);
    } catch (error: any) {
      toast.error("Lỗi khi thêm dữ liệu mẫu: " + error.message);
    } finally {
      setIsAddingSampleData(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-2xl text-center animate-bounce-in">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="text-2xl font-bold text-white">{stats.totalProducts}</h3>
                <p className="text-white/80">Sản phẩm</p>
              </div>
              
              <div className="glass p-6 rounded-2xl text-center animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-2xl font-bold text-white">{stats.totalOrders}</h3>
                <p className="text-white/80">Đơn hàng</p>
              </div>
              
              <div className="glass p-6 rounded-2xl text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl mb-2">🏷️</div>
                <h3 className="text-2xl font-bold text-white">{stats.totalCategories}</h3>
                <p className="text-white/80">Danh mục</p>
              </div>
              
              <div className="glass p-6 rounded-2xl text-center animate-bounce-in" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl mb-2">💰</div>
                <h3 className="text-2xl font-bold text-white">
                  {stats.totalRevenue.toLocaleString('vi-VN')}đ
                </h3>
                <p className="text-white/80">Doanh thu</p>
              </div>
            </div>

            {/* Sample Data Button */}
            <div className="glass p-6 rounded-2xl animate-fade-in-up">
              <h2 className="text-2xl font-bold text-white mb-4">🔄 Dữ liệu mẫu</h2>
              <p className="text-white/80 mb-4">
                Thêm dữ liệu mẫu vào hệ thống để kiểm tra chức năng.
              </p>
              <button
                onClick={handleAddSampleData}
                disabled={isAddingSampleData}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50"
              >
                {isAddingSampleData ? "Đang thêm dữ liệu..." : "Thêm dữ liệu mẫu"}
              </button>
            </div>

            {/* Order Status Chart */}
            <div className="glass p-6 rounded-2xl animate-fade-in-up">
              <h2 className="text-2xl font-bold text-white mb-6">📊 Thống kê đơn hàng</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className="text-3xl font-bold text-white">{count}</div>
                    <div className="text-white/80 text-sm capitalize">
                      {status === "pending" && "Chờ xác nhận"}
                      {status === "confirmed" && "Đã xác nhận"}
                      {status === "preparing" && "Đang chuẩn bị"}
                      {status === "shipping" && "Đang giao"}
                      {status === "delivered" && "Đã giao"}
                      {status === "cancelled" && "Đã hủy"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="glass p-6 rounded-2xl animate-fade-in-up">
              <h2 className="text-2xl font-bold text-white mb-6">📋 Đơn hàng gần đây</h2>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="bg-white/10 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-white">
                          Đơn hàng #{order._id.slice(-8)}
                        </div>
                        <div className="text-white/80 text-sm">
                          {new Date(order._creationTime).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">
                          {order.finalAmount.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-white/80 text-sm">{order.orderStatus}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "products":
        return <AdminProducts onBack={() => setCurrentView("dashboard")} />;

      case "orders":
        return <AdminOrders onBack={() => setCurrentView("dashboard")} />;

      case "categories":
        return <AdminCategories onBack={() => setCurrentView("dashboard")} />;
        
      case "toppings":
        return <AdminToppings onBack={() => setCurrentView("dashboard")} />;

      case "users":
        return <AdminUsers onBack={() => setCurrentView("dashboard")} />;
        
      case "analytics":
        return <AdminAnalytics onBack={() => setCurrentView("dashboard")} />;
        
      case "settings":
        return <AdminSettings onBack={() => setCurrentView("dashboard")} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        {/* Navigation */}
        <nav className="nav-glass flex items-center justify-between mb-8 p-4 animate-slide-in">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all duration-300"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "dashboard" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentView("products")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "products" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              📦 Sản phẩm
            </button>
            <button
              onClick={() => setCurrentView("orders")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "orders" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              📋 Đơn hàng
            </button>
            <button
              onClick={() => setCurrentView("categories")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "categories" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              🏷️ Danh mục
            </button>
            <button
              onClick={() => setCurrentView("toppings")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "toppings" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              🧋 Topping
            </button>
            <button
              onClick={() => setCurrentView("users")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "users" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              👥 Người dùng
            </button>
            <button
              onClick={() => setCurrentView("analytics")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "analytics" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              📈 Báo cáo
            </button>
            <button
              onClick={() => setCurrentView("settings")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "settings" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              ⚙️ Cài đặt
            </button>
          </div>
          
          <div className="text-white font-semibold">
            👨‍💼 Admin Panel
          </div>
        </nav>

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
}
