/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as http from "../http.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as router from "../router.js";
import type * as storage from "../storage.js";
import type * as wishlist from "../wishlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  cart: typeof cart;
  categories: typeof categories;
  http: typeof http;
  orders: typeof orders;
  products: typeof products;
  router: typeof router;
  storage: typeof storage;
  wishlist: typeof wishlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
