import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const settings = useQuery(api.admin.getStoreSettings) || {
    storeName: "Thức Uống Việt Nam",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
    deliveryFee: 15000,
    freeDeliveryThreshold: 100000,
    taxRate: 10,
    orderStatuses: ["pending", "confirmed", "preparing", "shipping", "delivered", "cancelled"],
    paymentMethods: ["COD", "Banking", "Momo"],
    isMaintenanceMode: false,
    maintenanceMessage: "Hệ thống đang bảo trì, vui lòng quay lại sau.",
    openingHours: {
      monday: { open: "08:00", close: "22:00", isOpen: true },
      tuesday: { open: "08:00", close: "22:00", isOpen: true },
      wednesday: { open: "08:00", close: "22:00", isOpen: true },
      thursday: { open: "08:00", close: "22:00", isOpen: true },
      friday: { open: "08:00", close: "22:00", isOpen: true },
      saturday: { open: "08:00", close: "22:00", isOpen: true },
      sunday: { open: "08:00", close: "22:00", isOpen: true },
    },
  };

  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState<"general" | "delivery" | "hours" | "payments" | "maintenance">("general");
  
  // Update form when settings load
  useEffect(() => {
    setFormData(settings);
  }, [settings]);
  
  const updateSettings = useMutation(api.admin.updateStoreSettings);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value
    }));
  };
  
  const handleToggleChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleOpeningHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({ settings: formData });
      toast.success("Cài đặt đã được lưu");
    } catch (error: any) {
      toast.error("Lỗi khi lưu cài đặt: " + error.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-black rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-black">⚙️ Cài đặt hệ thống</h1>
      </div>

      {/* Settings Tabs */}
      <div className="glass p-4 rounded-2xl mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-xl font-medium ${
              activeTab === "general" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Thông tin chung
          </button>
          <button 
            onClick={() => setActiveTab("delivery")}
            className={`px-4 py-2 rounded-xl font-medium ${
              activeTab === "delivery" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Giao hàng
          </button>
          <button 
            onClick={() => setActiveTab("hours")}
            className={`px-4 py-2 rounded-xl font-medium ${
              activeTab === "hours" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Giờ mở cửa
          </button>
          <button 
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-xl font-medium ${
              activeTab === "payments" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Thanh toán
          </button>
          <button 
            onClick={() => setActiveTab("maintenance")}
            className={`px-4 py-2 rounded-xl font-medium ${
              activeTab === "maintenance" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Bảo trì
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass p-6 rounded-2xl mb-6">
          {/* General Info Tab */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-black mb-4">🏪 Thông tin cửa hàng</h2>
              
              <div>
                <label className="block text-black font-medium mb-2">
                  Tên cửa hàng
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tên cửa hàng"
                />
              </div>
              
              <div>
                <label className="block text-black font-medium mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Số điện thoại"
                />
              </div>
              
              <div>
                <label className="block text-black font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="storeEmail"
                  value={formData.storeEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                />
              </div>
              
              <div>
                <label className="block text-black font-medium mb-2">
                  Địa chỉ
                </label>
                <textarea
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Địa chỉ cửa hàng"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-black font-medium mb-2">
                  Thuế VAT (%)
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VAT %"
                />
              </div>
            </div>
          )}

          {/* Delivery Settings Tab */}
          {activeTab === "delivery" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-black mb-4">🚚 Cài đặt giao hàng</h2>
              
              <div>
                <label className="block text-black font-medium mb-2">
                  Phí giao hàng (VND)
                </label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phí giao hàng"
                />
              </div>
              
              <div>
                <label className="block text-black font-medium mb-2">
                  Miễn phí giao hàng cho đơn từ (VND)
                </label>
                <input
                  type="number"
                  name="freeDeliveryThreshold"
                  value={formData.freeDeliveryThreshold}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ngưỡng miễn phí giao hàng"
                />
              </div>
            </div>
          )}

          {/* Opening Hours Tab */}
          {activeTab === "hours" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-black mb-4">🕒 Giờ mở cửa</h2>
              
              {Object.keys(formData.openingHours).map((day) => (
                <div key={day} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-black font-medium capitalize">
                      {day === "monday" && "Thứ hai"}
                      {day === "tuesday" && "Thứ ba"}
                      {day === "wednesday" && "Thứ tư"}
                      {day === "thursday" && "Thứ năm"}
                      {day === "friday" && "Thứ sáu"}
                      {day === "saturday" && "Thứ bảy"}
                      {day === "sunday" && "Chủ nhật"}
                    </label>
                    <div className="flex items-center">
                      <span className="mr-2 text-black">Mở cửa</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.openingHours[day].isOpen}
                          onChange={() => 
                            handleOpeningHoursChange(day, "isOpen", !formData.openingHours[day].isOpen)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                  
                  {formData.openingHours[day].isOpen && (
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-black text-sm mb-1">
                          Mở cửa
                        </label>
                        <input
                          type="time"
                          value={formData.openingHours[day].open}
                          onChange={(e) => 
                            handleOpeningHoursChange(day, "open", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-black text-sm mb-1">
                          Đóng cửa
                        </label>
                        <input
                          type="time"
                          value={formData.openingHours[day].close}
                          onChange={(e) => 
                            handleOpeningHoursChange(day, "close", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-black mb-4">💸 Phương thức thanh toán</h2>
              
              <div className="p-4 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes("COD")}
                    onChange={() => {
                      const updated = formData.paymentMethods.includes("COD")
                        ? formData.paymentMethods.filter(m => m !== "COD")
                        : [...formData.paymentMethods, "COD"];
                      setFormData({...formData, paymentMethods: updated});
                    }}
                    className="w-5 h-5 text-blue-500"
                  />
                  <label className="ml-2 text-black font-medium">
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes("Banking")}
                    onChange={() => {
                      const updated = formData.paymentMethods.includes("Banking")
                        ? formData.paymentMethods.filter(m => m !== "Banking")
                        : [...formData.paymentMethods, "Banking"];
                      setFormData({...formData, paymentMethods: updated});
                    }}
                    className="w-5 h-5 text-blue-500"
                  />
                  <label className="ml-2 text-black font-medium">
                    Chuyển khoản ngân hàng
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes("Momo")}
                    onChange={() => {
                      const updated = formData.paymentMethods.includes("Momo")
                        ? formData.paymentMethods.filter(m => m !== "Momo")
                        : [...formData.paymentMethods, "Momo"];
                      setFormData({...formData, paymentMethods: updated});
                    }}
                    className="w-5 h-5 text-blue-500"
                  />
                  <label className="ml-2 text-black font-medium">
                    Ví MoMo
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Mode Tab */}
          {activeTab === "maintenance" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-black mb-4">🔧 Chế độ bảo trì</h2>
              
              <div className="flex items-center mb-4">
                <span className="mr-2 text-black font-medium">Kích hoạt chế độ bảo trì</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMaintenanceMode}
                    onChange={() => handleToggleChange("isMaintenanceMode")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-black font-medium mb-2">
                  Thông báo bảo trì
                </label>
                <textarea
                  name="maintenanceMessage"
                  value={formData.maintenanceMessage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thông báo hiển thị khi hệ thống đang bảo trì"
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-300"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 