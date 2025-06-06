import { query } from "./_generated/server";
import { v } from "convex/values";

// Lấy tất cả danh mục đang hoạt động
export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
}); 