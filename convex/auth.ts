import { v } from "convex/values";
import { defineTable } from "convex/server";
import { query, mutation } from "./_generated/server";

// Bỏ qua authentication để giải quyết vấn đề đăng nhập
// Tạo bảng users độc lập
export const usersTable = defineTable({
  name: v.string(),
  email: v.optional(v.string()),
  createdAt: v.number(),
});

// Đơn giản hóa: tạo một người dùng anonymous khi đăng nhập
export const signInAnonymously = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name: "Khách hàng",
      createdAt: Date.now()
    });
    
    return { userId };
  },
});

// Kiểm tra người dùng đăng nhập
export const getUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});
