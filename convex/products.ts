import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Lấy tất cả danh mục
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();

    // Lấy thêm thông tin danh mục
    const category = await ctx.db.get(args.categoryId);

    return {
      category,
      products,
    };
  },
});

// Lấy chi tiết sản phẩm
export const getProductDetail = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    // Lấy các tùy chọn của sản phẩm
    const options = await ctx.db
      .query("productOptions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    // Lấy các topping có thể chọn
    const productToppings = await ctx.db
      .query("productToppings")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const toppingsResults = await Promise.all(
      productToppings.map(async (pt) => {
        const topping = await ctx.db.get(pt.toppingId);
        return topping;
      })
    );
    const toppings = toppingsResults.filter(Boolean);

    // Lấy đánh giá
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isApproved"), true))
      .collect();

    // Tính điểm trung bình
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      product,
      options: options.reduce((acc, option) => {
        if (!acc[option.optionGroup]) {
          acc[option.optionGroup] = [];
        }
        acc[option.optionGroup].push(option);
        return acc;
      }, {} as Record<string, typeof options>),
      toppings: toppings,
      reviews,
      averageRating,
      reviewCount: reviews.length,
    };
  },
});

// Tìm kiếm sản phẩm
export const searchProducts = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    // Simplified search that only looks at product names
    const searchTerm = args.searchTerm.toLowerCase();
    return await ctx.db
      .query("products")
      .filter((q) => 
        q.eq(q.field("isAvailable"), true)
      )
      .collect()
      .then(products => 
        products.filter(product => 
          product.name.toLowerCase().includes(searchTerm)
        )
    );
  },
});

// Lấy sản phẩm nổi bật (có thể dựa trên số lượng bán hoặc đánh giá)
export const getFeaturedProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .order("desc")
      .take(8);
  },
});

// Thêm đánh giá sản phẩm
export const addReview = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập để đánh giá sản phẩm");
    }

    return await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: userId,
      rating: args.rating,
      comment: args.comment,
      isApproved: false, // Cần admin duyệt
    });
  },
});

// Thêm dữ liệu mẫu
export const addSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // Thêm danh mục
    const categories = [
      {
        name: "Trà Sữa",
        description: "Các loại trà sữa thơm ngon",
        slug: "tra-sua",
        isActive: true,
      },
      {
        name: "Cà Phê",
        description: "Cà phê Việt Nam đậm đà",
        slug: "ca-phe",
        isActive: true,
      },
      {
        name: "Nước Ép",
        description: "Nước ép trái cây tươi mát",
        slug: "nuoc-ep",
        isActive: true,
      },
      {
        name: "Trà Trái Cây",
        description: "Trà trái cây tự nhiên",
        slug: "tra-trai-cay",
        isActive: true,
      }
    ];

    // Define a proper type for categoryIds
    const categoryIds: Record<string, Id<"categories">> = {};
    
    // Insert categories and store their IDs
    for (const category of categories) {
      // Kiểm tra xem danh mục đã tồn tại chưa
      const existingCategories = await ctx.db
        .query("categories")
        .withIndex("by_slug", q => q.eq("slug", category.slug))
        .collect();
      
      if (existingCategories.length === 0) {
        const categoryId = await ctx.db.insert("categories", category);
        categoryIds[category.slug] = categoryId;
      } else {
        categoryIds[category.slug] = existingCategories[0]._id;
      }
    }

    // Define products with proper typing
    const productTemplates = [
      {
        name: "Trà Sữa Truyền Thống",
        description: "Trà sữa truyền thống ngon nhất Việt Nam",
        categorySlug: "tra-sua",
        basePrice: 25000,
        isAvailable: true,
        slug: "tra-sua-truyen-thong",
      },
      {
        name: "Trà Sữa Matcha",
        description: "Trà sữa matcha đậm đà hương vị Nhật Bản",
        categorySlug: "tra-sua",
        basePrice: 30000,
        isAvailable: true,
        slug: "tra-sua-matcha",
      },
      {
        name: "Cà Phê Đen Đá",
        description: "Cà phê đen đá đậm đà hương vị Việt Nam",
        categorySlug: "ca-phe",
        basePrice: 20000,
        isAvailable: true,
        slug: "ca-phe-den-da",
      },
      {
        name: "Cà Phê Sữa Đá",
        description: "Cà phê sữa đá thơm ngon, béo ngậy",
        categorySlug: "ca-phe",
        basePrice: 25000,
        isAvailable: true,
        slug: "ca-phe-sua-da",
      },
      {
        name: "Nước Ép Cam",
        description: "Nước ép cam tươi mát, giàu vitamin C",
        categorySlug: "nuoc-ep",
        basePrice: 35000,
        isAvailable: true,
        slug: "nuoc-ep-cam",
      },
      {
        name: "Nước Ép Dứa",
        description: "Nước ép dứa tươi mát, giàu enzyme",
        categorySlug: "nuoc-ep",
        basePrice: 35000,
        isAvailable: true,
        slug: "nuoc-ep-dua",
      },
      {
        name: "Trà Đào",
        description: "Trà đào thơm ngon, thanh mát",
        categorySlug: "tra-trai-cay",
        basePrice: 30000,
        isAvailable: true,
        slug: "tra-dao",
      },
      {
        name: "Trà Vải",
        description: "Trà vải thơm ngon, thanh mát",
        categorySlug: "tra-trai-cay",
        basePrice: 30000,
        isAvailable: true,
        slug: "tra-vai",
      },
    ];

    // Thêm các sản phẩm
    for (const template of productTemplates) {
      // Kiểm tra xem sản phẩm đã tồn tại chưa
      const existingProducts = await ctx.db
        .query("products")
        .withIndex("by_slug", q => q.eq("slug", template.slug))
        .collect();
      
      if (existingProducts.length === 0) {
        // Create a properly typed product object
        const product = {
          name: template.name,
          description: template.description,
          categoryId: categoryIds[template.categorySlug],
          basePrice: template.basePrice,
          isAvailable: template.isAvailable,
          slug: template.slug,
        };
        
        await ctx.db.insert("products", product);
      }
    }

    // Thêm các tùy chọn sản phẩm
    const productOptions = [
      { optionGroup: "size", optionValue: "M", priceAdjustment: 0, isDefault: true },
      { optionGroup: "size", optionValue: "L", priceAdjustment: 5000, isDefault: false },
      { optionGroup: "size", optionValue: "XL", priceAdjustment: 10000, isDefault: false },
      { optionGroup: "sugar", optionValue: "100%", priceAdjustment: 0, isDefault: true },
      { optionGroup: "sugar", optionValue: "70%", priceAdjustment: 0, isDefault: false },
      { optionGroup: "sugar", optionValue: "50%", priceAdjustment: 0, isDefault: false },
      { optionGroup: "sugar", optionValue: "30%", priceAdjustment: 0, isDefault: false },
      { optionGroup: "sugar", optionValue: "0%", priceAdjustment: 0, isDefault: false },
      { optionGroup: "ice", optionValue: "100%", priceAdjustment: 0, isDefault: true },
      { optionGroup: "ice", optionValue: "70%", priceAdjustment: 0, isDefault: false },
      { optionGroup: "ice", optionValue: "50%", priceAdjustment: 0, isDefault: false },
      { optionGroup: "ice", optionValue: "30%", priceAdjustment: 0, isDefault: false },
      { optionGroup: "ice", optionValue: "0%", priceAdjustment: 0, isDefault: false },
    ];

    // Lấy tất cả sản phẩm
    const allProducts = await ctx.db.query("products").collect();
    
    // Thêm tùy chọn cho từng sản phẩm
    for (const product of allProducts) {
      for (const option of productOptions) {
        // Kiểm tra xem tùy chọn đã tồn tại chưa
        const existingOptions = await ctx.db
          .query("productOptions")
          .withIndex("by_product", q => q.eq("productId", product._id))
          .collect();
        
        const optionExists = existingOptions.some(
          o => o.optionGroup === option.optionGroup && o.optionValue === option.optionValue
        );
        
        if (!optionExists) {
          await ctx.db.insert("productOptions", {
            productId: product._id,
            ...option
          });
        }
      }
    }

    return {
      success: true,
      message: "Đã thêm dữ liệu mẫu thành công!",
      categoriesAdded: Object.keys(categoryIds).length,
      productsAdded: productTemplates.length
    };
  },
});

// Get related products from the same category
export const getRelatedProducts = query({
  args: { 
    categoryId: v.id("categories"),
    currentProductId: v.id("products")
  },
  handler: async (ctx, args) => {
    // Get up to 3 products from the same category, excluding the current product
    const relatedProducts = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.neq(q.field("_id"), args.currentProductId))
      .order("desc")
      .take(3);
    
    return relatedProducts;
  },
});
