import { query } from "./_generated/server";
import { v } from "convex/values";

// Get a URL for the given storage ID
export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get multiple URLs for the given storage IDs
export const getBatchImageUrls = query({
  args: { storageIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const urls: Record<string, string | null> = {};
    
    for (const storageId of args.storageIds) {
      urls[storageId] = await ctx.storage.getUrl(storageId);
    }
    
    return urls;
  },
}); 