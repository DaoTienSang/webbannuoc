import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AdminUsersProps {
  onBack: () => void;
}

export function AdminUsers({ onBack }: AdminUsersProps) {
  const users = useQuery(api.admin.getAllUsers) || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  
  // Actions
  const toggleUserStatus = useMutation(api.admin.toggleUserStatus);
  const deleteUser = useMutation(api.admin.deleteUser);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle toggle user status (active/inactive)
  const handleToggleStatus = async (userId: Id<"users">, currentStatus: boolean) => {
    try {
      await toggleUserStatus({ userId, isActive: !currentStatus });
      toast.success("Cập nhật trạng thái người dùng thành công");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: Id<"users">) => {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await deleteUser({ userId });
        toast.success("Xóa người dùng thành công");
      } catch (error: any) {
        toast.error("Lỗi: " + error.message);
      }
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
        <h1 className="text-3xl font-bold text-black">👥 Quản lý người dùng</h1>
      </div>

      {/* Search and Filters */}
      <div className="glass p-6 rounded-2xl mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="glass p-6 rounded-2xl">
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-black font-medium">Người dùng</th>
                <th className="text-left py-3 px-4 text-black font-medium">Email</th>
                <th className="text-left py-3 px-4 text-black font-medium">Ngày đăng ký</th>
                <th className="text-left py-3 px-4 text-black font-medium">Đơn hàng</th>
                <th className="text-left py-3 px-4 text-black font-medium">Trạng thái</th>
                <th className="text-center py-3 px-4 text-black font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="font-medium text-black">{user.name || "Chưa cập nhật"}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">
                    {user.email || "Không có email"}
                  </td>
                  <td className="py-3 px-4 text-black">
                    {new Date(user._creationTime).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-black">
                    {user.orderCount || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user._id, user.isActive || false)}
                        className={`px-3 py-1 rounded-lg hover:opacity-80 text-sm ${
                          user.isActive 
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.isActive ? "Khóa" : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => setSelectedUserId(user._id)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal - Will be implemented if needed */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Thông tin chi tiết</h2>
                <button 
                  onClick={() => setSelectedUserId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* User details content would go here */}
              <div className="py-4">
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">ID người dùng</div>
                  <div className="font-medium">{selectedUserId}</div>
                </div>
                {/* Add more user details here */}
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => setSelectedUserId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
