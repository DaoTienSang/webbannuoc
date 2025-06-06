import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AdminCategoriesProps {
  onBack: () => void;
}

export function AdminCategories({ onBack }: AdminCategoriesProps) {
  const categories = useQuery(api.admin.getAllCategories);
  const createCategory = useMutation(api.admin.createCategory);
  const updateCategory = useMutation(api.admin.updateCategory);
  const deleteCategory = useMutation(api.admin.deleteCategory);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      isActive: category.isActive,
    });
    setEditingCategory(category);
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
    
    if (!formData.name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory._id,
          ...formData,
        });
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(formData);
        toast.success("Tạo danh mục thành công!");
      }
      resetForm();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (categoryId: Id<"categories">) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await deleteCategory({ categoryId });
        toast.success("Xóa danh mục thành công!");
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi xóa danh mục");
      }
    }
  };

  if (!categories) {
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
          <h1 className="text-3xl font-bold text-white">🏷️ Quản lý danh mục</h1>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          ➕ Thêm danh mục
        </button>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          formData={formData}
          setFormData={setFormData}
          editingCategory={editingCategory}
          isUploading={isUploading}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
        />
      )}

      {/* Categories List */}
      <div className="glass p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category._id}
              category={category}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component for the category form
function CategoryForm({
  formData,
  setFormData,
  editingCategory,
  isUploading,
  handleImageUpload,
  handleSubmit,
  resetForm
}: {
  formData: {
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
  }>>;
  editingCategory: any;
  isUploading: boolean;
  handleImageUpload: (file: File) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    formData.imageUrl ? { storageId: formData.imageUrl } : "skip"
  );

  return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
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
                <label className="block text-sm font-medium mb-2">Tên danh mục *</label>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Danh mục hoạt động
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={isUploading}
                >
                  {editingCategory ? "Cập nhật" : "Tạo danh mục"}
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

// Separate component to handle image loading for each category
function CategoryCard({ 
  category, 
  index,
  onEdit, 
  onDelete 
}: { 
  category: any, 
  index: number,
  onEdit: (category: any) => void, 
  onDelete: (categoryId: Id<"categories">) => void 
}) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    category.imageUrl ? { storageId: category.imageUrl } : "skip"
  );

  return (
    <div
              className="bg-white/10 p-6 rounded-2xl animate-bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
        <div className="text-4xl relative">
          {category.imageUrl && imageUrl ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <>
                  {category.name === "Trà Sữa" && "🧋"}
                  {category.name === "Chè" && "🍮"}
                  {category.name === "Nước Ép" && "🥤"}
                  {category.name === "Cà Phê" && "☕"}
                  {!["Trà Sữa", "Chè", "Nước Ép", "Cà Phê"].includes(category.name) && "🏷️"}
            </>
          )}
                </div>
                <span className={category.isActive ? "status-available" : "status-unavailable"}>
                  {category.isActive ? "Hoạt động" : "Tạm dừng"}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-white mb-2">{category.name}</h3>
              <p className="text-white/80 text-sm mb-4 line-clamp-2">
                {category.description || "Không có mô tả"}
              </p>
              
              <div className="flex space-x-2">
                <button
          onClick={() => onEdit(category)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Sửa
                </button>
                <button
          onClick={() => onDelete(category._id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Xóa
                </button>
      </div>
    </div>
  );
}
