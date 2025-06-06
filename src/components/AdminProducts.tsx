import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AdminProductsProps {
  onBack: () => void;
}

export function AdminProducts({ onBack }: AdminProductsProps) {
  const products = useQuery(api.admin.getAllProducts);
  const categories = useQuery(api.admin.getAllCategories);
  const createProduct = useMutation(api.admin.createProduct);
  const updateProduct = useMutation(api.admin.updateProduct);
  const deleteProduct = useMutation(api.admin.deleteProduct);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    basePrice: 0,
    imageUrl: "",
    isAvailable: true,
    ingredients: [] as string[],
    nutritionInfo: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      basePrice: 0,
      imageUrl: "",
      isAvailable: true,
      ingredients: [],
      nutritionInfo: "",
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl || "",
      isAvailable: product.isAvailable,
      ingredients: product.ingredients || [],
      nutritionInfo: product.nutritionInfo || "",
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error("Upload failed");
      }
      
      const { storageId } = await result.json();
      setFormData(prev => ({ ...prev, imageUrl: storageId }));
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || formData.basePrice <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct._id,
          ...formData,
          categoryId: formData.categoryId as Id<"categories">,
        });
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct({
          ...formData,
          categoryId: formData.categoryId as Id<"categories">,
        });
        toast.success("Tạo sản phẩm thành công!");
      }
      resetForm();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (productId: Id<"products">) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct({ productId });
        toast.success("Xóa sản phẩm thành công!");
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa sản phẩm");
      }
    }
  };

  if (!products || !categories) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-white">📦 Quản lý sản phẩm</h1>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          ➕ Thêm sản phẩm
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          editingProduct={editingProduct}
          isUploading={isUploading}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          categories={categories}
        />
      )}

      {/* Products List */}
      <div className="glass p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 text-white font-semibold">Tên sản phẩm</th>
                <th className="text-left py-3 text-white font-semibold">Danh mục</th>
                <th className="text-left py-3 text-white font-semibold">Giá</th>
                <th className="text-left py-3 text-white font-semibold">Trạng thái</th>
                <th className="text-left py-3 text-white font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow 
                  key={product._id} 
                  product={product} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Separate component to handle image loading for each product
function ProductRow({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: any, 
  onEdit: (product: any) => void, 
  onDelete: (productId: Id<"products">) => void 
}) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    product.imageUrl ? { storageId: product.imageUrl } : "skip"
  );

  return (
    <tr className="border-b border-white/10">
      <td className="py-4">
        <div className="flex items-center space-x-3">
          {product.imageUrl && imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">
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
          )}
          <div>
            <div className="font-medium text-white">{product.name}</div>
            <div className="text-white/70 text-sm">{product.description}</div>
          </div>
        </div>
      </td>
      <td className="py-4 text-white">{product.category?.name}</td>
      <td className="py-4 text-white">{product.basePrice.toLocaleString('vi-VN')}đ</td>
      <td className="py-4">
        <span className={product.isAvailable ? "status-available" : "status-unavailable"}>
          {product.isAvailable ? "Có sẵn" : "Hết hàng"}
        </span>
      </td>
      <td className="py-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Sửa
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
}

// Create a separate component for the product form to handle image preview
export function ProductForm({ 
  formData, 
  setFormData, 
  editingProduct, 
  isUploading, 
  handleImageUpload, 
  handleSubmit, 
  resetForm, 
  categories 
}: any) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    formData.imageUrl ? { storageId: formData.imageUrl } : "skip"
  );

  return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Danh mục *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn danh mục</option>
              {categories.map((category: any) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Giá cơ bản (VNĐ) *</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hình ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isUploading}
                />
                {isUploading && <p className="text-sm text-blue-600 mt-1">Đang tải ảnh lên...</p>}
                {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-green-600 mb-1">Ảnh đã được tải lên</p>
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs p-2 break-all">
                    {formData.imageUrl.substring(0, 20)}...
                  </div>
                )}
              </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thành phần (mỗi dòng một thành phần)</label>
                <textarea
                  value={formData.ingredients.join('\n')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ingredients: e.target.value.split('\n').filter(i => i.trim()) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Trà đen&#10;Sữa tươi&#10;Đường"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thông tin dinh dưỡng</label>
                <textarea
                  value={formData.nutritionInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, nutritionInfo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium">
                  Sản phẩm có sẵn
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={isUploading}
                >
                  {editingProduct ? "Cập nhật" : "Tạo sản phẩm"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
      </div>
    </div>
  );
}
