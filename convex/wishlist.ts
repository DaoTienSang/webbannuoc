import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Lấy danh sách yêu thích của user
export const getWishlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const wishlistItems = await ctx.db
      .query("wishlistItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Lấy thông tin chi tiết sản phẩm
    const wishlistWithDetails = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    return wishlistWithDetails.filter(item => item.product);
  },
});

// Thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập để thêm vào danh sách yêu thích");
    }

    // Kiểm tra xem sản phẩm đã có trong wishlist chưa
    const existingItem = await ctx.db
      .query("wishlistItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existingItem) {
      throw new Error("Sản phẩm đã có trong danh sách yêu thích");
    }

    return await ctx.db.insert("wishlistItems", {
      userId,
      productId: args.productId,
    });
  },
});

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập");
    }

    const wishlistItem = await ctx.db
      .query("wishlistItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (!wishlistItem) {
      throw new Error("Sản phẩm không có trong danh sách yêu thích");
    }

    await ctx.db.delete(wishlistItem._id);
  },
});

// Kiểm tra sản phẩm có trong wishlist không
export const isInWishlist = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const wishlistItem = await ctx.db
      .query("wishlistItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    return !!wishlistItem;
  },
});
