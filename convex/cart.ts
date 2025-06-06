import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Lấy giỏ hàng của user
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Lấy thông tin chi tiết sản phẩm và topping
    const cartWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        
        const toppingsDetails = await Promise.all(
          item.selectedToppings.map(async (st) => {
            const topping = await ctx.db.get(st.toppingId);
            return {
              ...topping,
              quantity: st.quantity,
            };
          })
        );

        // Tính giá sản phẩm với các tùy chọn
        let itemPrice = product?.basePrice || 0;
        
        // Thêm phí cho size nếu có
        if (item.selectedOptions.size) {
          const sizeOption = await ctx.db
            .query("productOptions")
            .withIndex("by_product", (q) => q.eq("productId", item.productId))
            .filter((q) => 
              q.and(
                q.eq(q.field("optionGroup"), "size"),
                q.eq(q.field("optionValue"), item.selectedOptions.size)
              )
            )
            .first();
          
          if (sizeOption) {
            itemPrice += sizeOption.priceAdjustment;
          }
        }

        // Thêm giá topping
        const toppingsPrice = toppingsDetails.reduce(
          (sum, topping) => sum + (topping?.price || 0) * topping.quantity,
          0
        );

        const totalPrice = (itemPrice + toppingsPrice) * item.quantity;

        return {
          ...item,
          product,
          toppings: toppingsDetails,
          itemPrice,
          toppingsPrice,
          totalPrice,
        };
      })
    );

    return cartWithDetails;
  },
});

// Thêm sản phẩm vào giỏ hàng
export const addToCart = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    selectedOptions: v.object({
      size: v.optional(v.string()),
      sugar: v.optional(v.string()),
      ice: v.optional(v.string()),
    }),
    selectedToppings: v.array(v.object({
      toppingId: v.id("toppings"),
      quantity: v.number(),
    })),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
    }

    // Kiểm tra xem sản phẩm với cùng tùy chọn đã có trong giỏ chưa
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existingItem && 
        JSON.stringify(existingItem.selectedOptions) === JSON.stringify(args.selectedOptions) &&
        JSON.stringify(existingItem.selectedToppings) === JSON.stringify(args.selectedToppings) &&
        existingItem.specialInstructions === args.specialInstructions) {
      // Cập nhật số lượng
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
      return existingItem._id;
    } else {
      // Thêm mới
      return await ctx.db.insert("cartItems", {
        userId,
        productId: args.productId,
        quantity: args.quantity,
        selectedOptions: args.selectedOptions,
        selectedToppings: args.selectedToppings,
        specialInstructions: args.specialInstructions,
      });
    }
  },
});

// Cập nhật số lượng trong giỏ hàng
export const updateCartItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập");
    }

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, {
        quantity: args.quantity,
      });
    }
  },
});

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập");
    }

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    }

    await ctx.db.delete(args.cartItemId);
  },
});

// Xóa toàn bộ giỏ hàng
export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập");
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(
      cartItems.map((item) => ctx.db.delete(item._id))
    );
  },
});
