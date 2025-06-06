import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ProductDetailProps {
  productId: Id<"products">;
  onBack: () => void;
}

export function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const data = useQuery(api.products.getProductDetail, { productId });
  const addToCart = useMutation(api.cart.addToCart);
  const imageUrl = useQuery(
    api.storage.getImageUrl, 
    data?.product.imageUrl ? { storageId: data.product.imageUrl } : "skip"
  );
  const relatedProducts = useQuery(
    api.products.getRelatedProducts,
    data?.product ? { categoryId: data.product.categoryId, currentProductId: productId } : "skip"
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{
    size?: string;
    sugar?: string;
    ice?: string;
  }>({});
  const [selectedToppings, setSelectedToppings] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Set default options
  useEffect(() => {
    if (data && Object.keys(data.options).length > 0) {
      const defaults: typeof selectedOptions = {};
      Object.entries(data.options).forEach(([group, groupOptions]) => {
        const defaultOption = groupOptions.find(opt => opt.isDefault);
        if (defaultOption) {
          defaults[group as keyof typeof defaults] = defaultOption.optionValue;
        }
      });
      setSelectedOptions(defaults);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { product, options, toppings, averageRating, reviewCount } = data;

  const calculatePrice = () => {
    let price = product.basePrice;
    
    // Add size adjustment
    if (selectedOptions.size && options.size) {
      const sizeOption = options.size.find(opt => opt.optionValue === selectedOptions.size);
      if (sizeOption) {
        price += sizeOption.priceAdjustment;
      }
    }

    // Add toppings price
    const toppingsPrice = Object.entries(selectedToppings).reduce((sum, [toppingId, qty]) => {
      const topping = toppings.find(t => t?._id === toppingId);
      return sum + (topping?.price || 0) * qty;
    }, 0);

    return (price + toppingsPrice) * quantity;
  };

  const getPlaceholder = () => {
    if (product.name.includes("Chè")) {
      return "Ví dụ: Thêm nhiều đậu xanh, ít đường hơn, thêm nước cốt dừa...";
    } else if (product.name.includes("Trà Sữa")) {
      return "Ví dụ: Thêm nhiều trân châu, ít sữa hơn, thêm thạch...";
    } else if (product.name.includes("Nước Ép")) {
      return "Ví dụ: Không thêm đá, thêm nhiều trái cây, ít đường hơn...";
    } else if (product.name.includes("Cà Phê")) {
      return "Ví dụ: Thêm ít đường, nhiều sữa, không đá...";
    }
    return "Nhập yêu cầu đặc biệt của bạn tại đây...";
  };

  const handleAddToCart = async () => {
    try {
      const toppingsArray = Object.entries(selectedToppings)
        .filter(([_, qty]) => qty > 0)
        .map(([toppingId, qty]) => ({
          toppingId: toppingId as Id<"toppings">,
          quantity: qty,
        }));

      await addToCart({
        productId,
        quantity,
        selectedOptions,
        selectedToppings: toppingsArray,
        specialInstructions: specialInstructions.trim() || undefined,
      });

      toast.success("Đã thêm vào giỏ hàng!");
      
      // Quay lại trang danh mục sản phẩm sau khi thêm vào giỏ hàng
      onBack();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      console.error(error);
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
            {product.imageUrl && imageUrl ? (
              <div className="relative w-full h-full">
                <img 
                  src={imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ) : (
              <span className="text-8xl animate-float">
                {product.name.includes("Trà Sữa") && "🧋"}
                {product.name.includes("Chè") && "🍮"}
                {product.name.includes("Nước Ép") && "🥤"}
                {product.name.includes("Cà Phê") && "☕"}
                {!product.name.includes("Trà Sữa") && 
                  !product.name.includes("Chè") && 
                  !product.name.includes("Nước Ép") && 
                  !product.name.includes("Cà Phê") && "🥤"}
              </span>
            )}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-4 -left-4 w-16 h-16 text-blue-200 opacity-70 animate-spin-slow">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M41.3,-69.8C53.4,-63.5,63.2,-52.6,70.2,-39.8C77.1,-27,81.2,-12.2,79.9,1.9C78.6,16,72,31.9,62.5,44.8C53,57.7,40.6,67.5,26.7,73.1C12.8,78.7,-2.5,80,-16.9,76.5C-31.3,73,-44.7,64.7,-55.3,53.5C-65.9,42.3,-73.6,28.2,-77.5,12.5C-81.4,-3.1,-81.5,-20.3,-74.6,-33.6C-67.8,-46.9,-54.1,-56.3,-40.2,-61.8C-26.3,-67.2,-12.3,-68.7,1.2,-70.7C14.7,-72.7,29.3,-76.2,41.3,-69.8Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 text-pink-200 opacity-70">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M47.7,-73.2C62.1,-66.3,74.5,-54.5,79.8,-40.1C85.1,-25.7,83.3,-8.6,79.4,7C75.4,22.6,69.2,36.8,59.1,47.4C49,58,34.9,65,20.3,69.7C5.6,74.4,-9.6,76.8,-23.1,73.2C-36.6,69.6,-48.3,60,-57.4,48.1C-66.5,36.1,-73,21.9,-76.9,6.1C-80.7,-9.7,-82,-27,-74.9,-39.8C-67.9,-52.7,-52.6,-61,-37.7,-67.8C-22.8,-74.7,-8.3,-80.2,6.5,-80.4C21.3,-80.5,33.4,-80.2,47.7,-73.2Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 text-blue-50 opacity-50 transform -translate-y-1/2 translate-x-1/2">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-1.5C87,13.4,81.4,26.8,73.6,38.2C65.8,49.5,55.9,58.8,44.2,64.2C32.4,69.5,18.9,70.9,5.4,72.8C-8.1,74.8,-21.5,77.3,-33.9,73.9C-46.3,70.5,-57.6,61.2,-67.1,49.6C-76.6,38,-84.2,24.1,-86.1,9.5C-88,-5.1,-84.1,-20.3,-76.6,-32.6C-69.1,-44.9,-58,-54.3,-45.4,-62.4C-32.8,-70.6,-18.6,-77.5,-2.9,-79.1C12.8,-80.7,30.5,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="relative">
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              {product.categoryName}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-lg">
                    {star <= Math.round(averageRating) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({reviewCount} đánh giá)
              </span>
            </div>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Thành phần:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-sm border border-blue-100"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3">
                <span className="text-sm">Giá chỉ từ</span>
                <div className="text-xl font-bold">{product.basePrice.toLocaleString('vi-VN')}đ</div>
              </div>
            </div>
          </div>

          {/* Options */}
          {Object.entries(options).map(([group, groupOptions]) => (
            <div key={group} className="bg-blue-50/50 p-4 rounded-xl">
              <h3 className="font-semibold mb-3 capitalize flex items-center">
                {group === "size" && (
                  <>
                    <span className="text-lg mr-2">📏</span> Kích thước
                  </>
                )}
                {group === "sugar" && (
                  <>
                    <span className="text-lg mr-2">🍯</span> Độ ngọt
                  </>
                )}
                {group === "ice" && (
                  <>
                    <span className="text-lg mr-2">❄️</span> Lượng đá
                  </>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {groupOptions.map((option) => (
                  <button
                    key={option._id}
                    onClick={() => setSelectedOptions(prev => ({
                      ...prev,
                      [group]: option.optionValue,
                    }))}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedOptions[group as keyof typeof selectedOptions] === option.optionValue
                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                        : "border-gray-300 bg-white hover:border-blue-300"
                    }`}
                  >
                    {option.optionValue}
                    {option.priceAdjustment > 0 && (
                      <span className="ml-1 text-sm">
                        (+{option.priceAdjustment.toLocaleString('vi-VN')}đ)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Toppings */}
          {toppings.length > 0 && (
            <div className="bg-blue-50/50 p-4 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="text-lg mr-2">🧋</span> Topping
              </h3>
              <div className="space-y-2">
                {toppings.map((topping) => topping && (
                  <div key={topping._id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <div>
                      <span className="font-medium">{topping.name}</span>
                      <span className="ml-2 text-blue-600 font-semibold">
                        +{topping.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedToppings(prev => ({
                          ...prev,
                          [topping._id]: Math.max(0, (prev[topping._id] || 0) - 1),
                        }))}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {selectedToppings[topping._id] || 0}
                      </span>
                      <button
                        onClick={() => setSelectedToppings(prev => ({
                          ...prev,
                          [topping._id]: (prev[topping._id] || 0) + 1,
                        }))}
                        className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <span className="text-lg mr-2">📝</span> Yêu cầu đặc biệt
            </h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex flex-wrap items-end justify-between pt-4 border-t">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold mb-2">Số lượng:</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg"
                >
                  -
                </button>
                <span className="w-10 text-center font-medium text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-gray-600 mb-1">Tổng tiền:</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {calculatePrice().toLocaleString('vi-VN')}đ
              </div>
              <button
                onClick={handleAddToCart}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
              >
                <span className="mr-2">🛒</span> Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12 relative">
          <div className="absolute -top-6 -left-6 w-16 h-16 text-blue-100 opacity-70">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M47.3,-79.6C60.9,-71.2,71.3,-57.9,77.8,-43.1C84.2,-28.2,86.7,-11.7,83.7,3.1C80.6,17.8,72.1,30.9,62.7,42.8C53.4,54.7,43.2,65.4,30.7,71.8C18.2,78.2,3.5,80.3,-12.1,79.6C-27.6,78.9,-44,75.4,-56.4,66.5C-68.9,57.6,-77.3,43.3,-81.3,27.8C-85.2,12.3,-84.7,-4.4,-79.8,-19.2C-74.9,-34,-65.6,-46.9,-53.5,-56.1C-41.5,-65.2,-26.7,-70.6,-11.1,-73.1C4.5,-75.6,20.1,-75.3,33.6,-80.1C47.1,-84.9,58.5,-95.8,69.9,-96.6" transform="translate(100 100)" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-blue-800">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((product) => (
              <RelatedProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelatedProductCard({ product }: { product: any }) {
  const imageUrl = useQuery(
    api.storage.getImageUrl, 
    product.imageUrl ? { storageId: product.imageUrl } : "skip"
  );

  return (
    <div 
      className="product-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md cursor-pointer"
      onClick={() => window.location.href = `/product/${product._id}`}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {product.imageUrl && imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover product-card-image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">
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
      </div>
      <div className="p-4">
        <h3 className="font-medium text-blue-800 line-clamp-1">{product.name}</h3>
        <div className="text-blue-600 font-semibold mt-1">
          {product.basePrice.toLocaleString('vi-VN')}đ
        </div>
      </div>
    </div>
  );
}
