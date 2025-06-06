import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Kiểm tra quyền admin (tạm thời bỏ yêu cầu đăng nhập)
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  // Tạm thời bỏ yêu cầu đăng nhập để dễ dàng truy cập admin
  return userId || "anonymous";
}

// API Cài đặt hệ thống
export const getStoreSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    // Lấy cài đặt từ bảng settings, nếu không có thì tạo mặc định
    const settings = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("id"), "store_settings"))
      .first();
    
    if (settings) {
      return settings.data;
    }
    
    // Trả về cài đặt mặc định nếu chưa có
    return {
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
  },
});

export const updateStoreSettings = mutation({
  args: {
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Kiểm tra xem đã có cài đặt chưa
    const existing = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("id"), "store_settings"))
      .first();
    
    if (existing) {
      // Nếu có rồi thì cập nhật
      await ctx.db.patch(existing._id, { data: args.settings });
    } else {
      // Nếu chưa có thì tạo mới
      await ctx.db.insert("settings", {
        id: "store_settings",
        data: args.settings,
      });
    }
    
    return { success: true };
  },
});

// Dashboard thống kê
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const totalProducts = await ctx.db.query("products").collect();
    const totalOrders = await ctx.db.query("orders").collect();
    const totalCategories = await ctx.db.query("categories").collect();
    const totalUsers = await ctx.db.query("users").collect();

    // Tính doanh thu
    const completedOrders = totalOrders.filter(order => order.orderStatus === "delivered");
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.finalAmount, 0);

    // Đơn hàng theo trạng thái
    const ordersByStatus = totalOrders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts: totalProducts.length,
      totalOrders: totalOrders.length,
      totalCategories: totalCategories.length,
      totalUsers: totalUsers.length,
      totalRevenue,
      ordersByStatus,
      recentOrders: totalOrders.slice(0, 5),
    };
  },
});

// API cho Analytics
export const getAnalyticsData = query({
  args: { timeRange: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Lấy tất cả đơn hàng
    const orders = await ctx.db.query("orders").collect();
    
    // Lọc đơn hàng theo thời gian
    const now = Date.now();
    const filteredOrders = orders.filter(order => {
      const orderTime = order._creationTime;
      const daysDiff = (now - orderTime) / (1000 * 60 * 60 * 24);
      
      switch (args.timeRange) {
        case "day":
          return daysDiff <= 1;
        case "week":
          return daysDiff <= 7;
        case "month":
          return daysDiff <= 30;
        case "year":
          return daysDiff <= 365;
        default:
          return true;
      }
    });
    
    // Chỉ lấy đơn hàng đã giao thành công để tính doanh thu thực tế
    const completedOrders = filteredOrders.filter(order => order.orderStatus === "delivered" || order.paymentStatus === "paid");
    
    // Tính tổng doanh thu
    const totalSales = completedOrders.reduce((sum, order) => sum + order.finalAmount, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    
    // Doanh thu theo ngày - Đảm bảo hiển thị dữ liệu theo thứ tự thời gian
    const salesByDayMap = new Map();
    const datesToShow = [];
    
    // Tạo các ngày cần hiển thị dựa trên khoảng thời gian
    const today = new Date();
    let daysToShow = 7; // Mặc định là tuần
    
    if (args.timeRange === "day") {
      daysToShow = 24; // Hiển thị theo giờ
    } else if (args.timeRange === "month") {
      daysToShow = 30;
    } else if (args.timeRange === "year") {
      daysToShow = 12; // Hiển thị theo tháng
    }
    
    // Khởi tạo dữ liệu cho tất cả các ngày/giờ
    for (let i = daysToShow - 1; i >= 0; i--) {
      let dateKey;
      if (args.timeRange === "day") {
        // Tạo key theo giờ
        const hour = new Date(today);
        hour.setHours(today.getHours() - i, 0, 0, 0);
        dateKey = `${hour.getHours()}h`;
        datesToShow.push(dateKey);
        salesByDayMap.set(dateKey, 0);
      } else if (args.timeRange === "year") {
        // Tạo key theo tháng
        const month = new Date(today);
        month.setMonth(today.getMonth() - i);
        dateKey = `${month.getMonth() + 1}/${month.getFullYear()}`;
        datesToShow.push(dateKey);
        salesByDayMap.set(dateKey, 0);
      } else {
        // Tạo key theo ngày
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        dateKey = `${day.getDate()}/${day.getMonth() + 1}`;
        datesToShow.push(dateKey);
        salesByDayMap.set(dateKey, 0);
      }
    }
    
    // Cập nhật dữ liệu từ các đơn hàng
    completedOrders.forEach(order => {
      const date = new Date(order._creationTime);
      let dateKey;
      
      if (args.timeRange === "day") {
        // Key theo giờ
        dateKey = `${date.getHours()}h`;
      } else if (args.timeRange === "year") {
        // Key theo tháng
        dateKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      } else {
        // Key theo ngày
        dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
      }
      
      if (salesByDayMap.has(dateKey)) {
        const currentAmount = salesByDayMap.get(dateKey);
        salesByDayMap.set(dateKey, currentAmount + order.finalAmount);
      }
    });
    
    // Chuyển đổi map thành mảng theo thứ tự thời gian
    const salesByDay = datesToShow.map(dateKey => ({
      label: dateKey,
      amount: salesByDayMap.get(dateKey) || 0,
    }));
    
    // Doanh thu theo danh mục
    const orderItemsPromises = completedOrders.map(order => 
      ctx.db.query("orderItems")
        .withIndex("by_order", q => q.eq("orderId", order._id))
        .collect()
    );
    const allOrderItems = await Promise.all(orderItemsPromises);
    const flattenedOrderItems = allOrderItems.flat();
    
    // Map product to category and sum up
    const salesByCategoryMap = new Map();
    for (const item of flattenedOrderItems) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        const category = await ctx.db.get(product.categoryId);
        if (category) {
          const categoryName = category.name;
          const currentAmount = salesByCategoryMap.get(categoryName) || 0;
          salesByCategoryMap.set(categoryName, currentAmount + (item.subtotal));
        }
      }
    }
    
    const salesByCategory = Array.from(salesByCategoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount); // Sắp xếp theo doanh thu giảm dần
    
    // Top sản phẩm bán chạy
    const productSalesMap = new Map();
    const productQuantityMap = new Map();
    
    for (const item of flattenedOrderItems) {
      const productId = item.productId.toString();
      
      const currentRevenue = productSalesMap.get(productId) || 0;
      productSalesMap.set(productId, currentRevenue + item.subtotal);
      
      const currentQuantity = productQuantityMap.get(productId) || 0;
      productQuantityMap.set(productId, currentQuantity + item.quantity);
    }
    
    // Get product details and sort by revenue
    const topProductsPromises = Array.from(productSalesMap.keys()).map(async (productId) => {
      const product = await ctx.db.get(productId as any);
      return {
        name: product && 'name' in product ? product.name : "Unknown Product",
        revenue: productSalesMap.get(productId) || 0,
        quantity: productQuantityMap.get(productId) || 0,
      };
    });
    
    const topProducts = await Promise.all(topProductsPromises);
    topProducts.sort((a, b) => b.revenue - a.revenue);
    
    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      salesByDay,
      salesByCategory,
      topProducts: topProducts.slice(0, 5),
    };
  },
});

// API quản lý người dùng
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.userId);
  },
});

export const updateUserStatus = mutation({
  args: { 
    userId: v.id("users"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Cập nhật trạng thái người dùng, thực tế trường status có thể không tồn tại
    // Thay vào đó, chúng ta có thể xử lý theo dạng "active" hoặc "inactive" với isAnonymous
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, { 
        isAnonymous: args.status === "inactive" // Đặt isAnonymous = true nếu status là inactive
      });
    }
    return { success: true };
  },
});

export const toggleUserStatus = mutation({
  args: { 
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Khi isActive = false, chúng ta đặt isAnonymous = true để khóa tài khoản
    await ctx.db.patch(args.userId, { 
      isAnonymous: !args.isActive
    });
    return { success: true };
  },
});

export const deleteUser = mutation({
  args: { 
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Trước khi xóa người dùng, bạn có thể muốn kiểm tra nếu người dùng có đơn hàng
    // và ngăn xóa nếu có đơn hàng liên quan
    const userOrders = await ctx.db
      .query("orders")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (userOrders) {
      // Nếu người dùng có đơn hàng, không xóa tài khoản mà chỉ đặt trạng thái là vô hiệu
      await ctx.db.patch(args.userId, { isAnonymous: true });
      return { success: true, message: "Người dùng đã bị vô hiệu hóa vì có đơn hàng liên quan" };
    }
    
    // Nếu không có đơn hàng, xóa tài khoản
    await ctx.db.delete(args.userId);
    
    return { success: true };
  },
});

// Quản lý sản phẩm
export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const products = await ctx.db.query("products").collect();
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        const category = await ctx.db.get(product.categoryId);
        return { ...product, category };
      })
    );
    
    return productsWithCategory;
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.id("categories"),
    basePrice: v.number(),
    imageUrl: v.optional(v.string()),
    isAvailable: v.boolean(),
    ingredients: v.optional(v.array(v.string())),
    nutritionInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const slug = args.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    return await ctx.db.insert("products", {
      ...args,
      slug,
    });
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    basePrice: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    ingredients: v.optional(v.array(v.string())),
    nutritionInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const { productId, ...updates } = args;
    
    // Cập nhật slug nếu tên thay đổi
    if (updates.name) {
      const slug = updates.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      (updates as any).slug = slug;
    }
    
    await ctx.db.patch(productId, updates);
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.productId);
  },
});

// Quản lý danh mục
export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("categories").collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const slug = args.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    return await ctx.db.insert("categories", {
      ...args,
      slug,
    });
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const { categoryId, ...updates } = args;
    
    if (updates.name) {
      const slug = updates.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      (updates as any).slug = slug;
    }
    
    await ctx.db.patch(categoryId, updates);
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Kiểm tra xem có sản phẩm nào đang sử dụng danh mục này không
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    
    if (products.length > 0) {
      throw new Error("Không thể xóa danh mục đang có sản phẩm");
    }
    
    await ctx.db.delete(args.categoryId);
  },
});

// Quản lý Topping
export const getAllToppings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("toppings").collect();
  },
});

export const createTopping = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("toppings", args);
  },
});

export const updateTopping = mutation({
  args: {
    toppingId: v.id("toppings"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const { toppingId, ...updates } = args;
    await ctx.db.patch(toppingId, updates);
  },
});

export const deleteTopping = mutation({
  args: { toppingId: v.id("toppings") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Kiểm tra xem topping có đang được liên kết với sản phẩm nào không
    const productToppings = await ctx.db
      .query("productToppings")
      .filter((q) => q.eq(q.field("toppingId"), args.toppingId))
      .collect();
    
    if (productToppings.length > 0) {
      // Xóa tất cả liên kết trước khi xóa topping
      for (const pt of productToppings) {
        await ctx.db.delete(pt._id);
      }
    }
    
    await ctx.db.delete(args.toppingId);
  },
});

// Quản lý liên kết sản phẩm và topping
export const getProductToppings = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const productToppings = await ctx.db
      .query("productToppings")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    
    const toppings = await Promise.all(
      productToppings.map(async (pt) => {
        const topping = await ctx.db.get(pt.toppingId);
        return { ...pt, topping };
      })
    );
    
    return toppings;
  },
});

export const addToppingToProduct = mutation({
  args: {
    productId: v.id("products"),
    toppingId: v.id("toppings"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Kiểm tra xem liên kết đã tồn tại chưa
    const existing = await ctx.db
      .query("productToppings")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("toppingId"), args.toppingId))
      .first();
    
    if (existing) {
      throw new Error("Topping đã được thêm vào sản phẩm này");
    }
    
    return await ctx.db.insert("productToppings", {
      productId: args.productId,
      toppingId: args.toppingId,
    });
  },
});

export const removeToppingFromProduct = mutation({
  args: {
    productId: v.id("products"),
    toppingId: v.id("toppings"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const productTopping = await ctx.db
      .query("productToppings")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("toppingId"), args.toppingId))
      .first();
    
    if (!productTopping) {
      throw new Error("Không tìm thấy liên kết giữa sản phẩm và topping");
    }
    
    await ctx.db.delete(productTopping._id);
  },
});

// Quản lý đơn hàng
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const orders = await ctx.db.query("orders").order("desc").collect();
    
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const user = order.userId ? await ctx.db.get(order.userId) : null;
        const orderItems = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        
        return {
          ...order,
          user,
          itemCount: orderItems.length,
        };
      })
    );
    
    return ordersWithDetails;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    await ctx.db.patch(args.orderId, {
      orderStatus: args.status,
    });
  },
});

// Upload file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Seed data function
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Tạo danh mục
    const categories = [
      {
        name: "Trà Sữa",
        description: "Trà sữa thơm ngon, đậm đà",
        slug: "tra-sua",
        isActive: true,
      },
      {
        name: "Chè",
        description: "Chè truyền thống Việt Nam",
        slug: "che",
        isActive: true,
      },
      {
        name: "Nước Ép",
        description: "Nước ép trái cây tươi ngon",
        slug: "nuoc-ep",
        isActive: true,
      },
      {
        name: "Cà Phê",
        description: "Cà phê rang xay thơm ngon",
        slug: "ca-phe",
        isActive: true,
      },
    ];

    const categoryIds = [];
    for (const category of categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();
      
      if (!existing) {
        const id = await ctx.db.insert("categories", category);
        categoryIds.push(id);
      } else {
        categoryIds.push(existing._id);
      }
    }

    // Tạo sản phẩm
    const products = [
      {
        name: "Trà Sữa Truyền Thống",
        description: "Trà sữa đậm đà với hương vị truyền thống",
        categoryId: categoryIds[0],
        basePrice: 35000,
        isAvailable: true,
        slug: "tra-sua-truyen-thong",
        ingredients: ["Trà đen", "Sữa tươi", "Đường"],
      },
      {
        name: "Trà Sữa Matcha",
        description: "Trà sữa matcha Nhật Bản thơm ngon",
        categoryId: categoryIds[0],
        basePrice: 45000,
        isAvailable: true,
        slug: "tra-sua-matcha",
        ingredients: ["Matcha", "Sữa tươi", "Đường"],
      },
      {
        name: "Chè Đậu Đỏ",
        description: "Chè đậu đỏ nước cốt dừa thơm ngon",
        categoryId: categoryIds[1],
        basePrice: 25000,
        isAvailable: true,
        slug: "che-dau-do",
        ingredients: ["Đậu đỏ", "Nước cốt dừa", "Đường phèn"],
      },
      {
        name: "Nước Ép Cam",
        description: "Nước ép cam tươi 100% tự nhiên",
        categoryId: categoryIds[2],
        basePrice: 30000,
        isAvailable: true,
        slug: "nuoc-ep-cam",
        ingredients: ["Cam tươi"],
      },
      {
        name: "Cà Phê Đen",
        description: "Cà phê đen đậm đà, thơm ngon",
        categoryId: categoryIds[3],
        basePrice: 20000,
        isAvailable: true,
        slug: "ca-phe-den",
        ingredients: ["Cà phê rang xay"],
      },
    ];

    const productIds = [];
    for (const product of products) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", product.slug))
        .first();
      
      if (!existing) {
        const id = await ctx.db.insert("products", product);
        productIds.push(id);
      } else {
        productIds.push(existing._id);
      }
    }

    // Tạo tùy chọn sản phẩm
    const options = [
      // Size options
      { productId: productIds[0], optionGroup: "size", optionValue: "M", priceAdjustment: 0, isDefault: true },
      { productId: productIds[0], optionGroup: "size", optionValue: "L", priceAdjustment: 5000, isDefault: false },
      { productId: productIds[1], optionGroup: "size", optionValue: "M", priceAdjustment: 0, isDefault: true },
      { productId: productIds[1], optionGroup: "size", optionValue: "L", priceAdjustment: 5000, isDefault: false },
      
      // Sugar options
      { productId: productIds[0], optionGroup: "sugar", optionValue: "50%", priceAdjustment: 0, isDefault: false },
      { productId: productIds[0], optionGroup: "sugar", optionValue: "70%", priceAdjustment: 0, isDefault: true },
      { productId: productIds[0], optionGroup: "sugar", optionValue: "100%", priceAdjustment: 0, isDefault: false },
      
      // Ice options
      { productId: productIds[0], optionGroup: "ice", optionValue: "Ít đá", priceAdjustment: 0, isDefault: false },
      { productId: productIds[0], optionGroup: "ice", optionValue: "Bình thường", priceAdjustment: 0, isDefault: true },
      { productId: productIds[0], optionGroup: "ice", optionValue: "Nhiều đá", priceAdjustment: 0, isDefault: false },
    ];

    for (const option of options) {
      const existing = await ctx.db
        .query("productOptions")
        .withIndex("by_product", (q) => q.eq("productId", option.productId))
        .filter((q) => 
          q.and(
            q.eq(q.field("optionGroup"), option.optionGroup),
            q.eq(q.field("optionValue"), option.optionValue)
          )
        )
        .first();
      
      if (!existing) {
        await ctx.db.insert("productOptions", option);
      }
    }

    // Tạo topping
    const toppings = [
      { name: "Trân châu đen", price: 5000, isAvailable: true },
      { name: "Trân châu trắng", price: 5000, isAvailable: true },
      { name: "Thạch dừa", price: 7000, isAvailable: true },
      { name: "Pudding", price: 8000, isAvailable: true },
    ];

    const toppingIds = [];
    for (const topping of toppings) {
      const existing = await ctx.db
        .query("toppings")
        .filter((q) => q.eq(q.field("name"), topping.name))
        .first();
      
      if (!existing) {
        const id = await ctx.db.insert("toppings", topping);
        toppingIds.push(id);
      } else {
        toppingIds.push(existing._id);
      }
    }

    // Liên kết sản phẩm với topping
    for (const productId of productIds.slice(0, 2)) { // Chỉ trà sữa có topping
      for (const toppingId of toppingIds) {
        const existing = await ctx.db
          .query("productToppings")
          .withIndex("by_product", (q) => q.eq("productId", productId))
          .filter((q) => q.eq(q.field("toppingId"), toppingId))
          .first();
        
        if (!existing) {
          await ctx.db.insert("productToppings", {
            productId,
            toppingId,
          });
        }
      }
    }

    return { success: true, message: "Dữ liệu mẫu đã được tạo thành công!" };
  },
});
