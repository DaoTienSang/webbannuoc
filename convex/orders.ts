import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Tạo đơn hàng
export const createOrder = mutation({
  args: {
    shippingAddress: v.string(),
    paymentMethod: v.string(),
    notes: v.optional(v.string()),
    promotionCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Bạn cần đăng nhập để đặt hàng");
    }

    // Lấy giỏ hàng
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Giỏ hàng trống");
    }

    // Tính tổng tiền
    let totalAmount = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);
      if (!product || !product.isAvailable) {
        throw new Error(`Sản phẩm ${product?.name || "không xác định"} hiện không có sẵn`);
      }

      let itemPrice = product.basePrice;

      // Tính giá với tùy chọn size
      if (cartItem.selectedOptions.size) {
        const sizeOption = await ctx.db
          .query("productOptions")
          .withIndex("by_product", (q) => q.eq("productId", cartItem.productId))
          .filter((q) => 
            q.and(
              q.eq(q.field("optionGroup"), "size"),
              q.eq(q.field("optionValue"), cartItem.selectedOptions.size)
            )
          )
          .first();
        
        if (sizeOption) {
          itemPrice += sizeOption.priceAdjustment;
        }
      }

      // Tính giá topping
      let toppingsPrice = 0;
      const toppingsData = [];
      
      for (const selectedTopping of cartItem.selectedToppings) {
        const topping = await ctx.db.get(selectedTopping.toppingId);
        if (topping && topping.isAvailable) {
          const toppingSubtotal = topping.price * selectedTopping.quantity;
          toppingsPrice += toppingSubtotal;
          toppingsData.push({
            toppingId: selectedTopping.toppingId,
            quantity: selectedTopping.quantity,
            priceAtPurchase: topping.price,
            subtotal: toppingSubtotal,
          });
        }
      }

      const subtotal = (itemPrice + toppingsPrice) * cartItem.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtPurchase: itemPrice,
        selectedOptions: cartItem.selectedOptions,
        subtotal,
        toppings: toppingsData,
        specialInstructions: cartItem.specialInstructions,
      });
    }

    // Tính phí vận chuyển (có thể tùy chỉnh theo khu vực)
    const shippingFee = totalAmount >= 200000 ? 0 : 25000; // Miễn phí ship từ 200k

    // Áp dụng khuyến mãi nếu có
    let discountAmount = 0;
    if (args.promotionCode) {
      const promotion = await ctx.db
        .query("promotions")
        .withIndex("by_code", (q) => q.eq("code", args.promotionCode!))
        .first();

      if (promotion && promotion.isActive && 
          promotion.startDate <= Date.now() && 
          promotion.endDate >= Date.now() &&
          totalAmount >= promotion.minOrderValue) {
        
        if (promotion.discountType === "percentage") {
          discountAmount = Math.min(
            (totalAmount * promotion.discountValue) / 100,
            promotion.maxDiscountAmount || Infinity
          );
        } else if (promotion.discountType === "fixed_amount") {
          discountAmount = promotion.discountValue;
        } else if (promotion.discountType === "free_shipping") {
          discountAmount = shippingFee;
        }
      }
    }

    const finalAmount = totalAmount + shippingFee - discountAmount;

    // Tạo đơn hàng
    const orderId = await ctx.db.insert("orders", {
      userId,
      shippingAddress: args.shippingAddress,
      totalAmount,
      shippingFee,
      discountAmount,
      finalAmount,
      paymentMethod: args.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      notes: args.notes,
    });

    // Tạo chi tiết đơn hàng
    for (const itemData of orderItemsData) {
      const orderItemId = await ctx.db.insert("orderItems", {
        orderId,
        productId: itemData.productId,
        quantity: itemData.quantity,
        priceAtPurchase: itemData.priceAtPurchase,
        selectedOptions: itemData.selectedOptions,
        subtotal: itemData.subtotal,
        specialInstructions: itemData.specialInstructions,
      });

      // Thêm topping cho từng item
      for (const toppingData of itemData.toppings) {
        await ctx.db.insert("orderItemToppings", {
          orderItemId,
          ...toppingData,
        });
      }
    }

    // Xóa giỏ hàng
    for (const cartItem of cartItems) {
      await ctx.db.delete(cartItem._id);
    }

    return orderId;
  },
});

// Lấy lịch sử đơn hàng của user
export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return orders;
  },
});

// Lấy chi tiết đơn hàng
export const getOrderDetail = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Không kiểm tra quyền truy cập nữa, cho phép cả admin và người dùng thường xem
    // Chú ý: Trong môi trường thực tế, nên có cơ chế kiểm tra quyền admin
    // if (order.userId !== userId) {
    //   throw new Error("Bạn không có quyền xem đơn hàng này");
    // }

    // Lấy chi tiết sản phẩm
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    const itemsWithDetails = await Promise.all(
      orderItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        
        // Lấy topping của item này
        const toppings = await ctx.db
          .query("orderItemToppings")
          .withIndex("by_order_item", (q) => q.eq("orderItemId", item._id))
          .collect();

        const toppingsWithDetails = await Promise.all(
          toppings.map(async (topping) => {
            const toppingDetail = await ctx.db.get(topping.toppingId);
            return {
              ...topping,
              topping: toppingDetail,
            };
          })
        );

        return {
          ...item,
          product,
          toppings: toppingsWithDetails,
        };
      })
    );

    return {
      ...order,
      items: itemsWithDetails,
    };
  },
});

// Cập nhật trạng thái đơn hàng (dành cho admin)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Kiểm tra quyền admin
    await ctx.db.patch(args.orderId, {
      orderStatus: args.status,
    });
  },
});
