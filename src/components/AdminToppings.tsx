import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AdminToppingsProps {
  onBack: () => void;
}

interface ToppingFormData {
  name: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export function AdminToppings({ onBack }: AdminToppingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTopping, setEditingTopping] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ToppingFormData>({
    name: "",
    price: 0,
    isAvailable: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);
  const [isManagingProductToppings, setIsManagingProductToppings] = useState(false);

  const toppings = useQuery(api.admin.getAllToppings);
  const products = useQuery(api.admin.getAllProducts);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const createTopping = useMutation(api.admin.createTopping);
  const updateTopping = useMutation(api.admin.updateTopping);
  const deleteTopping = useMutation(api.admin.deleteTopping);
  const getProductToppings = useQuery(api.admin.getProductToppings, 
    selectedProductId ? { productId: selectedProductId } : "skip"
  );
  const addToppingToProduct = useMutation(api.admin.addToppingToProduct);
  const removeToppingFromProduct = useMutation(api.admin.removeToppingFromProduct);

  useEffect(() => {
    if (editingTopping) {
      setFormData({
        name: editingTopping.name,
        price: editingTopping.price,
        imageUrl: editingTopping.imageUrl,
        isAvailable: editingTopping.isAvailable,
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        isAvailable: true,
      });
    }
  }, [editingTopping]);

  const handleOpenModal = (topping?: any) => {
    if (topping) {
      setEditingTopping(topping);
      setIsEditing(true);
    } else {
      setEditingTopping(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTopping(null);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : name === "price" 
          ? parseFloat(value) 
          : value,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setFormData({ ...formData, imageUrl: storageId });
      toast.success("Tải ảnh lên thành công");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && editingTopping) {
        await updateTopping({
          toppingId: editingTopping._id,
          name: formData.name,
          price: formData.price,
          imageUrl: formData.imageUrl,
          isAvailable: formData.isAvailable,
        });
        toast.success("Cập nhật topping thành công");
      } else {
        await createTopping({
          name: formData.name,
          price: formData.price,
          imageUrl: formData.imageUrl,
          isAvailable: formData.isAvailable,
        });
        toast.success("Thêm topping mới thành công");
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (toppingId: Id<"toppings">) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa topping này không?")) {
      try {
        await deleteTopping({ toppingId });
        toast.success("Xóa topping thành công");
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  const handleManageProductToppings = (productId: Id<"products">) => {
    setSelectedProductId(productId);
    setIsManagingProductToppings(true);
  };

  const handleAddToppingToProduct = async (toppingId: Id<"toppings">) => {
    if (!selectedProductId) return;
    
    try {
      await addToppingToProduct({
        productId: selectedProductId,
        toppingId,
      });
      toast.success("Thêm topping vào sản phẩm thành công");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleRemoveToppingFromProduct = async (toppingId: Id<"toppings">) => {
    if (!selectedProductId) return;
    
    try {
      await removeToppingFromProduct({
        productId: selectedProductId,
        toppingId,
      });
      toast.success("Xóa topping khỏi sản phẩm thành công");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const renderToppingsList = () => {
    if (!toppings) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="spinner"></div>
        </div>
      );
    }

    if (toppings.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-white/80 mb-4">Chưa có topping nào</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300"
          >
            Thêm topping mới
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toppings.map((topping) => (
          <div key={topping._id} className="glass p-6 rounded-2xl animate-fade-in-up">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white">{topping.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${topping.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {topping.isAvailable ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>
            <p className="text-white/80 text-lg font-semibold mt-2">
              {topping.price.toLocaleString('vi-VN')}đ
            </p>
            
            <div className="flex mt-4 space-x-2">
              <button
                onClick={() => handleOpenModal(topping)}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all duration-300"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(topping._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all duration-300"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProductToppingManager = () => {
    if (!selectedProductId || !products) return null;
    
    const product = products.find(p => p._id === selectedProductId);
    if (!product) return null;
    
    if (!getProductToppings) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="spinner"></div>
        </div>
      );
    }
    
    // Lấy danh sách topping đã được thêm vào sản phẩm
    const addedToppingIds = getProductToppings.map(pt => pt.toppingId);
    
    return (
      <div className="glass p-6 rounded-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Quản lý topping cho: {product.name}</h2>
          <button
            onClick={() => setIsManagingProductToppings(false)}
            className="px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all duration-300"
          >
            ← Quay lại
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Topping đã thêm</h3>
          {getProductToppings.length === 0 ? (
            <p className="text-white/80">Chưa có topping nào được thêm vào sản phẩm này</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getProductToppings.map((pt) => (
                <div key={pt._id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{pt.topping.name}</div>
                    <div className="text-white/80 text-sm">
                      {pt.topping.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveToppingFromProduct(pt.toppingId)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all duration-300"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {toppings && toppings.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Thêm topping</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toppings
                .filter(topping => !addedToppingIds.includes(topping._id))
                .map((topping) => (
                  <div key={topping._id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{topping.name}</div>
                      <div className="text-white/80 text-sm">
                        {topping.price.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToppingToProduct(topping._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-all duration-300"
                    >
                      Thêm
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProductsList = () => {
    if (!products) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="spinner"></div>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-white/80">Chưa có sản phẩm nào</p>
        </div>
      );
    }

    return (
      <div className="glass p-6 rounded-2xl animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-6">Quản lý topping theo sản phẩm</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">{product.name}</div>
                <div className="text-white/80 text-sm">
                  {product.category?.name || "Không có danh mục"}
                </div>
              </div>
              <button
                onClick={() => handleManageProductToppings(product._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all duration-300"
              >
                Quản lý topping
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">🧋 Quản lý Topping</h1>
        {!isManagingProductToppings && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300"
          >
            + Thêm topping mới
          </button>
        )}
      </div>

      {/* Main Content */}
      {isManagingProductToppings ? renderProductToppingManager() : (
        <>
          {/* Toppings List */}
          <div className="glass p-6 rounded-2xl animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-6">Danh sách topping</h2>
            {renderToppingsList()}
          </div>

          {/* Products List for Topping Management */}
          {renderProductsList()}
        </>
      )}

      {/* Modal for Adding/Editing Topping */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-bounce-in">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? "Chỉnh sửa topping" : "Thêm topping mới"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên topping
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {isUploading && <div className="mt-2 text-blue-500">Đang tải ảnh lên...</div>}
                {formData.imageUrl && <div className="mt-2 text-green-500">Đã tải ảnh lên</div>}
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-gray-700">Còn hàng</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                >
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 