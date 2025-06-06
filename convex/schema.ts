import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Bảng cài đặt hệ thống
  settings: defineTable({
    id: v.string(),
    data: v.any(),
  }).index("by_setting_id", ["id"]),

  // Bảng danh mục sản phẩm
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    slug: v.string(),
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  // Bảng sản phẩm
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.id("categories"),
    basePrice: v.number(),
    imageUrl: v.optional(v.string()),
    isAvailable: v.boolean(),
    slug: v.string(),
    ingredients: v.optional(v.array(v.string())),
    nutritionInfo: v.optional(v.string()),
  })
    .index("by_category", ["categoryId"])
    .index("by_slug", ["slug"])
    .index("by_availability", ["isAvailable"]),

  // Bảng tùy chọn sản phẩm (size, đường, đá)
  productOptions: defineTable({
    productId: v.id("products"),
    optionGroup: v.string(), // "size", "sugar", "ice"
    optionValue: v.string(), // "M", "70%", "50%"
    priceAdjustment: v.number(),
    isDefault: v.boolean(),
  }).index("by_product", ["productId"]),

  // Bảng topping
  toppings: defineTable({
    name: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    isAvailable: v.boolean(),
  }),

  // Bảng liên kết sản phẩm và topping
  productToppings: defineTable({
    productId: v.id("products"),
    toppingId: v.id("toppings"),
  }).index("by_product", ["productId"]),

  // Bảng địa chỉ giao hàng
  addresses: defineTable({
    userId: v.id("users"),
    recipientName: v.string(),
    phoneNumber: v.string(),
    streetAddress: v.string(),
    ward: v.optional(v.string()),
    district: v.string(),
    city: v.string(),
    isDefault: v.boolean(),
  }).index("by_user", ["userId"]),

  // Bảng đơn hàng
  orders: defineTable({
    userId: v.optional(v.id("users")),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    shippingAddress: v.string(),
    totalAmount: v.number(),
    shippingFee: v.number(),
    discountAmount: v.number(),
    finalAmount: v.number(),
    paymentMethod: v.string(), // "COD", "VNPay", "Momo"
    paymentStatus: v.string(), // "pending", "paid", "failed"
    orderStatus: v.string(), // "pending", "confirmed", "preparing", "shipping", "delivered", "cancelled"
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["orderStatus"]),

  // Bảng chi tiết đơn hàng
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    priceAtPurchase: v.number(),
    selectedOptions: v.object({
      size: v.optional(v.string()),
      sugar: v.optional(v.string()),
      ice: v.optional(v.string()),
    }),
    subtotal: v.number(),
    specialInstructions: v.optional(v.string()),
  }).index("by_order", ["orderId"]),

  // Bảng topping đã chọn trong đơn hàng
  orderItemToppings: defineTable({
    orderItemId: v.id("orderItems"),
    toppingId: v.id("toppings"),
    quantity: v.number(),
    priceAtPurchase: v.number(),
    subtotal: v.number(),
  }).index("by_order_item", ["orderItemId"]),

  // Bảng khuyến mãi
  promotions: defineTable({
    code: v.string(),
    description: v.string(),
    discountType: v.string(), // "percentage", "fixed_amount", "free_shipping"
    discountValue: v.number(),
    maxDiscountAmount: v.optional(v.number()),
    minOrderValue: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    usageLimit: v.optional(v.number()),
    userUsageLimit: v.number(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  // Bảng đánh giá sản phẩm
  reviews: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    isApproved: v.boolean(),
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"]),

  // Bảng giỏ hàng
  cartItems: defineTable({
    userId: v.id("users"),
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
  }).index("by_user", ["userId"]),

  // Bảng danh sách yêu thích
  wishlistItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
