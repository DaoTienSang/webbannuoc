import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProductGrid } from "./ProductGrid";
import { ProductDetail } from "./ProductDetail";
import { Cart } from "./Cart";
import { OrderHistory } from "./OrderHistory";
import { Wishlist } from "./Wishlist";
import { SearchBar } from "./SearchBar";
import { Id } from "../../convex/_generated/dataModel";
import { WishlistButton } from "./WishlistButton";

type View = "home" | "category" | "product" | "cart" | "orders" | "wishlist" | "search";

export function BeverageStore() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const categories = useQuery(api.categories.getAllCategories);
  const featuredProducts = useQuery(api.products.getFeaturedProducts);
  const imageUrls = useQuery(api.storage.getBatchImageUrls, 
    categories ? { 
      storageIds: categories.filter(c => c.imageUrl).map(c => c.imageUrl) as string[] 
    } : "skip"
  );
  const cart = useQuery(api.cart.getCart);
  const wishlist = useQuery(api.wishlist.getWishlist);
  const seedData = useMutation(api.admin.seedData);

  const cartItemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  // Reset search results when navigating back
  useEffect(() => {
    if (!selectedCategoryId && !selectedProductId && !showCart) {
      setSearchResults(null);
      setShowSearchResults(false);
    }
  }, [selectedCategoryId, selectedProductId, showCart]);

  const handleProductClick = (productId: Id<"products">) => {
    setSelectedProductId(productId);
    setShowSearchResults(false);
    setCurrentView("product");
  };

  const handleCategoryClick = (categoryId: Id<"categories">) => {
    setSelectedCategoryId(categoryId);
    setSelectedProductId(null);
    setShowCart(false);
    setShowSearchResults(false);
    setCurrentView("category");
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedProductId(null);
    setShowCart(false);
    setShowSearchResults(false);
    setCurrentView("home");
  };

  const handleBackToProducts = () => {
    setSelectedProductId(null);
    setCurrentView("category");
  };

  const handleCartClick = () => {
    setShowCart(true);
    setSelectedCategoryId(null);
    setSelectedProductId(null);
    setShowSearchResults(false);
    setCurrentView("cart");
  };

  const handleSeedData = async () => {
    try {
      await seedData({});
      alert("Dữ liệu mẫu đã được thêm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm dữ liệu mẫu:", error);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return (
          <div className="space-y-8 animate-fade-in-up relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 text-blue-100 opacity-50 transform rotate-12">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-1.5C87,13.4,81.4,26.8,73.6,38.2C65.8,49.5,55.9,58.8,44.2,64.2C32.4,69.5,18.9,70.9,5.4,72.8C-8.1,74.8,-21.5,77.3,-33.9,73.9C-46.3,70.5,-57.6,61.2,-67.1,49.6C-76.6,38,-84.2,24.1,-86.1,9.5C-88,-5.1,-84.1,-20.3,-76.6,-32.6C-69.1,-44.9,-58,-54.3,-45.4,-62.4C-32.8,-70.6,-18.6,-77.5,-2.9,-79.1C12.8,-80.7,30.5,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-40 h-40 -mb-20 -ml-10 text-pink-100 opacity-50">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M47.7,-73.2C62.1,-66.3,74.5,-54.5,79.8,-40.1C85.1,-25.7,83.3,-8.6,79.4,7C75.4,22.6,69.2,36.8,59.1,47.4C49,58,34.9,65,20.3,69.7C5.6,74.4,-9.6,76.8,-23.1,73.2C-36.6,69.6,-48.3,60,-57.4,48.1C-66.5,36.1,-73,21.9,-76.9,6.1C-80.7,-9.7,-82,-27,-74.9,-39.8C-67.9,-52.7,-52.6,-61,-37.7,-67.8C-22.8,-74.7,-8.3,-80.2,6.5,-80.4C21.3,-80.5,33.4,-80.2,47.7,-73.2Z" transform="translate(100 100)" />
              </svg>
            </div>

            {/* Hero Section with Ocean & Nature Theme */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white p-8 rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              
              {/* Beach/Ocean Background */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                <img 
                  src="https://cdn.pixabay.com/photo/2017/03/27/14/49/beach-2179183_960_720.jpg" 
                  alt="Ocean background" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative bubbles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="bubble bubble-1"></div>
                <div className="bubble bubble-2"></div>
                <div className="bubble bubble-3"></div>
                <div className="bubble bubble-4"></div>
              </div>
              
                             {/* Decorative tropical elements using emojis */}
               <div className="absolute -right-10 -top-10 opacity-50 scale-[2] origin-bottom-left">
                 <span className="text-6xl">🌿</span>
               </div>
               <div className="absolute -left-10 -bottom-5 opacity-50 scale-[2] origin-top-right">
                 <span className="text-6xl">🍃</span>
               </div>
              
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in">
                  🧋 Nước Ngon Store
                </h1>
                <p className="text-xl mb-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  Trà sữa, chè, nước ép tươi ngon mỗi ngày
                </p>
                
                {/* Search and Sample Data in separate rows */}
                <div className="mb-4 max-w-md">
                  <SearchBar onProductClick={handleProductClick} />
                </div>
                
                <div>
                  <button
                    onClick={handleSeedData}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg animate-bounce-in"
                  >
                    ✨ Thêm dữ liệu mẫu
                  </button>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-6xl animate-float">🌊</div>
              <div className="absolute bottom-4 left-4 text-4xl animate-float" style={{ animationDelay: '1s' }}>🌴</div>
              <div className="absolute top-1/2 left-3/4 text-5xl animate-float" style={{ animationDelay: '1.5s' }}>🧋</div>
              <div className="absolute bottom-1/3 right-1/4 text-3xl animate-float" style={{ animationDelay: '0.7s' }}>🌿</div>
              <div className="absolute top-1/4 left-1/4 text-4xl animate-float" style={{ animationDelay: '1.2s' }}>🍃</div>
            </div>

            {/* Categories */}
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-20 h-20 text-yellow-200 opacity-60 animate-spin-slow">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M41.3,-69.8C53.4,-63.5,63.2,-52.6,70.2,-39.8C77.1,-27,81.2,-12.2,79.9,1.9C78.6,16,72,31.9,62.5,44.8C53,57.7,40.6,67.5,26.7,73.1C12.8,78.7,-2.5,80,-16.9,76.5C-31.3,73,-44.7,64.7,-55.3,53.5C-65.9,42.3,-73.6,28.2,-77.5,12.5C-81.4,-3.1,-81.5,-20.3,-74.6,-33.6C-67.8,-46.9,-54.1,-56.3,-40.2,-61.8C-26.3,-67.2,-12.3,-68.7,1.2,-70.7C14.7,-72.7,29.3,-76.2,41.3,-69.8Z" transform="translate(100 100)" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center">
                🎯 Danh mục sản phẩm
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories?.map((category, index) => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    imageUrl={category.imageUrl && imageUrls ? imageUrls[category.imageUrl] : null}
                    index={index}
                    onClick={() => handleCategoryClick(category._id)}
                    className="glass-card"
                  />
                ))}
              </div>
            </div>

            {/* Featured Products */}
            <div className="text-center relative">
              <div className="absolute -right-10 bottom-0 w-24 h-24 text-green-200 opacity-60">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M47.3,-79.6C60.9,-71.2,71.3,-57.9,77.8,-43.1C84.2,-28.2,86.7,-11.7,83.7,3.1C80.6,17.8,72.1,30.9,62.7,42.8C53.4,54.7,43.2,65.4,30.7,71.8C18.2,78.2,3.5,80.3,-12.1,79.6C-27.6,78.9,-44,75.4,-56.4,66.5C-68.9,57.6,-77.3,43.3,-81.3,27.8C-85.2,12.3,-84.7,-4.4,-79.8,-19.2C-74.9,-34,-65.6,-46.9,-53.5,-56.1C-41.5,-65.2,-26.7,-70.6,-11.1,-73.1C4.5,-75.6,20.1,-75.3,33.6,-80.1C47.1,-84.9,58.5,-95.8,69.9,-96.6" transform="translate(100 100)" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-blue-800">
                🔥 Sản phẩm nổi bật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { emoji: "🧋", title: "Trà Sữa Premium", desc: "Hương vị đậm đà, thơm ngon" },
                  { emoji: "🍮", title: "Chè Truyền Thống", desc: "Công thức gia truyền" },
                  { emoji: "🥤", title: "Nước Ép Tươi", desc: "100% trái cây tự nhiên" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="category-card p-6 text-center animate-bounce-in"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="text-5xl mb-4 animate-float">{item.emoji}</div>
                    <h3 className="font-bold text-lg text-blue-800 mb-2">{item.title}</h3>
                    <p className="text-blue-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nature-themed Decorative Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-3xl shadow-sm overflow-hidden relative">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 opacity-20">
                <img src="https://cdn.pixabay.com/photo/2018/10/01/09/21/pets-3715733_960_720.png" alt="Palm leaves" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 opacity-20 rotate-45">
                <img src="https://cdn.pixabay.com/photo/2018/10/01/09/21/pets-3715733_960_720.png" alt="Palm leaves" className="w-full h-full object-contain" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
                  <div className="text-6xl mb-4 flex justify-center">🌊</div>
                  <h3 className="text-xl font-bold text-blue-800 text-center mb-2">Nguồn nước tinh khiết</h3>
                  <p className="text-blue-700 text-center">Sử dụng nguồn nước tinh khiết, đảm bảo chất lượng cho mỗi ly đồ uống</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
                  <div className="text-6xl mb-4 flex justify-center">🌱</div>
                  <h3 className="text-xl font-bold text-blue-800 text-center mb-2">Nguyên liệu tự nhiên</h3>
                  <p className="text-blue-700 text-center">Trái cây tươi, lá trà hữu cơ và các nguyên liệu tự nhiên không chất bảo quản</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
                  <div className="text-6xl mb-4 flex justify-center">♻️</div>
                  <h3 className="text-xl font-bold text-blue-800 text-center mb-2">Thân thiện môi trường</h3>
                  <p className="text-blue-700 text-center">Sử dụng ống hút giấy và bao bì có thể tái chế, bảo vệ môi trường</p>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-green-100/50 to-transparent"></div>
            </div>

            {/* About Us Section with Ocean & Nature Theme */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-3xl shadow-sm border border-blue-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              {/* Ocean waves background */}
              <div className="absolute inset-0 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0">
                  <path fill="#0099ff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 opacity-50">
                  <path fill="#0099ff" fillOpacity="0.5" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
              </div>
              
                             {/* Floating plants using emojis */}
               <div className="absolute -top-10 right-10 opacity-40 animate-float" style={{animationDelay: '0.5s'}}>
                 <span className="text-6xl">🌱</span>
               </div>
               <div className="absolute bottom-5 left-5 opacity-40 animate-float" style={{animationDelay: '1.2s'}}>
                 <span className="text-6xl">🪴</span>
               </div>
              
              <div className="w-full md:w-1/2 relative z-10">
                <h2 className="text-3xl font-bold mb-4 text-blue-800">Về Nước Ngon Store</h2>
                <p className="text-blue-700 mb-4">
                  Chúng tôi tự hào mang đến những thức uống chất lượng cao với nguyên liệu tươi ngon nhất. 
                  Được thành lập từ năm 2020, Nước Ngon Store đã phục vụ hơn 10,000 khách hàng hài lòng.
                </p>
                <p className="text-blue-700">
                  Sứ mệnh của chúng tôi là mang lại niềm vui và sự sảng khoái qua từng ly nước, từng ly trà sữa thơm ngon.
                </p>
              </div>
              <div className="w-full md:w-1/2 flex justify-center relative z-10">
                <div className="relative w-64 h-64">
                  {/* Water ripple effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute inset-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                  
                  {/* Floating leaves around the bubble tea */}
                  <div className="absolute -top-5 -right-5 text-4xl animate-float" style={{animationDelay: '0.7s'}}>🍃</div>
                  <div className="absolute -bottom-5 -left-5 text-4xl animate-float" style={{animationDelay: '1.3s'}}>🌿</div>
                  <div className="absolute top-1/4 -left-8 text-3xl animate-float" style={{animationDelay: '0.9s'}}>🌱</div>
                  <div className="absolute bottom-1/4 -right-8 text-3xl animate-float" style={{animationDelay: '1.5s'}}>☘️</div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-8xl">
                    🧋
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "category":
        return selectedCategoryId ? (
          <ProductGrid 
            categoryId={selectedCategoryId}
            onProductClick={handleProductClick}
            onBack={handleBackToCategories}
          />
        ) : null;

      case "product":
        return selectedProductId ? (
          <ProductDetail
            productId={selectedProductId}
            onBack={selectedCategoryId ? handleBackToProducts : handleBackToCategories}
          />
        ) : null;

      case "cart":
        return <Cart onBack={handleBackToCategories} />;

      case "orders":
        return <OrderHistory onBack={() => setCurrentView("home")} />;

      case "wishlist":
        return <Wishlist onBack={() => setCurrentView("home")} onProductClick={handleProductClick} />;

      case "search":
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToCategories}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg"
              >
                ← Quay lại
              </button>
              <h1 className="text-2xl font-bold">Kết quả tìm kiếm</h1>
              <div className="w-[100px]"></div>
            </div>

            <div className="mb-6">
              <SearchBar onProductClick={handleProductClick} />
            </div>

            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-text">Vui lòng sử dụng thanh tìm kiếm phía trên</h3>
              <p className="empty-state-subtext">Nhập tên sản phẩm để tìm kiếm</p>
              <button 
                onClick={handleBackToCategories}
                className="btn-primary mt-4"
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-200 via-cyan-100 to-green-200">
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-blue-300 via-cyan-200 to-green-200"></div>
      </div>
      
      {/* Additional floating bubbles for ocean feeling */}
      <div className="absolute top-20 right-32 text-8xl opacity-20 animate-float" style={{animationDelay: '0.3s'}}>🌊</div>
      <div className="absolute bottom-40 left-20 text-7xl opacity-20 animate-float" style={{animationDelay: '1.1s'}}>💧</div>
      
      {/* Floating decorative elements using emojis instead of images */}
      <div className="fixed top-20 right-20 w-64 h-64 opacity-60 pointer-events-none animate-float" style={{animationDelay: '0.5s'}}>
        <div className="text-9xl scale-[4] origin-center">🌿</div>
      </div>
      <div className="fixed bottom-10 left-10 w-48 h-48 opacity-60 pointer-events-none animate-float" style={{animationDelay: '1.2s'}}>
        <div className="text-9xl scale-[3.5] origin-center">🍃</div>
      </div>
      <div className="fixed top-1/4 left-5 w-40 h-40 opacity-50 pointer-events-none animate-float" style={{animationDelay: '0.8s'}}>
        <div className="text-8xl scale-[3] origin-center">🌴</div>
      </div>
      <div className="fixed bottom-1/4 right-5 w-40 h-40 opacity-50 pointer-events-none animate-float" style={{animationDelay: '1.5s'}}>
        <div className="text-8xl scale-[3] origin-center">🌺</div>
      </div>
      
      {/* Animated bubbles */}
      <div className="bubble-container fixed inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, index) => (
          <div 
            key={index}
            className="bubble-float"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Additional decorative bubbles using emojis */}
      <div className="fixed bottom-0 left-1/4 text-4xl animate-float opacity-30" style={{animationDelay: '0.2s', animationDuration: '8s'}}>💦</div>
      <div className="fixed bottom-0 right-1/3 text-5xl animate-float opacity-30" style={{animationDelay: '1.7s', animationDuration: '12s'}}>💧</div>
      <div className="fixed bottom-0 left-2/3 text-3xl animate-float opacity-30" style={{animationDelay: '3.1s', animationDuration: '9s'}}>💧</div>
      <div className="fixed bottom-0 right-1/4 text-5xl animate-float opacity-30" style={{animationDelay: '0.5s', animationDuration: '11s'}}>💦</div>
      <div className="fixed bottom-0 left-1/5 text-4xl animate-float opacity-30" style={{animationDelay: '2.3s', animationDuration: '10s'}}>🫧</div>
      <div className="fixed bottom-0 right-1/5 text-3xl animate-float opacity-30" style={{animationDelay: '1.2s', animationDuration: '7s'}}>🫧</div>
      
      {/* Wave animation at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
        <div className="wave1 w-full h-full opacity-50"></div>
        <div className="wave2 w-full h-full opacity-40"></div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        {/* Navigation */}
        <nav className="nav-glass flex items-center justify-between mb-8 p-4 animate-slide-in">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView("home")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "home" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              🏠 Trang chủ
            </button>
            <button
              onClick={() => setCurrentView("orders")}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                currentView === "orders" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              📋 Đơn hàng
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentView("wishlist")}
              className="relative px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              💝 Yêu thích
              {wishlistCount > 0 && (
                <span className="notification-badge">
                  {wishlistCount}
                </span>
              )}
            </button>
            
            <button
              onClick={handleCartClick}
              className="relative px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              🛒 Giỏ hàng
              {cartItemCount > 0 && (
                <span className="notification-badge">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pb-20">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-blue-700 text-sm glass py-4 px-6 rounded-xl relative z-10">
          <div className="flex justify-center mb-2 space-x-3">
            <span className="text-xl">🌊</span>
            <span className="text-xl">🌴</span>
            <span className="text-xl">🧋</span>
            <span className="text-xl">🍃</span>
          </div>
          <p>© 2023 Nước Ngon Store. Tất cả các quyền được bảo lưu.</p>
          <p className="text-blue-600 mt-1">Thiết kế với 💙 từ biển và thiên nhiên</p>
        </footer>
      </div>
    </div>
  );
}

// Separate component to handle category image loading
function CategoryCard({ 
  category, 
  imageUrl, 
  index,
  onClick,
  className = ""
}: { 
  category: any, 
  imageUrl: string | null,
  index: number,
  onClick: () => void,
  className?: string
}) {
  return (
    <div 
      className={`category-card overflow-hidden cursor-pointer animate-fade-in-up ${className}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <span className="text-6xl">
              {category.name === "Trà Sữa" && "🧋"}
              {category.name === "Chè" && "🍮"}
              {category.name === "Nước Ép" && "🥤"}
              {category.name === "Cà Phê" && "☕"}
              {!["Trà Sữa", "Chè", "Nước Ép", "Cà Phê"].includes(category.name) && "🥤"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>
      <div className="p-4 relative">
        <h3 className="font-bold text-lg">{category.name}</h3>
        {category.description && (
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{category.description}</p>
        )}
        <div className="absolute top-0 right-0 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          Xem ngay
        </div>
      </div>
    </div>
  );
}

function FeaturedProductCard({ 
  product, 
  index,
  onClick 
}: { 
  product: any, 
  index: number,
  onClick: () => void 
}) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    product.imageUrl ? { storageId: product.imageUrl } : "skip"
  );

  return (
    <div 
      className="product-card overflow-hidden cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          {product.imageUrl && imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl">
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
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product._id} />
        </div>
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12">
              Hết hàng
            </span>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="price-tag">
            {product.basePrice.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
      </div>
    </div>
  );
}

function SearchResultCard({ 
  product, 
  onClick 
}: { 
  product: any, 
  onClick: () => void 
}) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    product.imageUrl ? { storageId: product.imageUrl } : "skip"
  );

  return (
    <div 
      className="product-card overflow-hidden cursor-pointer animate-bounce-in"
      onClick={onClick}
    >
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          {product.imageUrl && imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl">
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
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product._id} />
        </div>
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12">
              Hết hàng
            </span>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="price-tag">
            {product.basePrice.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
      </div>
    </div>
  );
}
