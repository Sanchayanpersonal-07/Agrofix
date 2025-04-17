import { pgTable, text, serial, integer, decimal, json, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for order status
export const orderStatusEnum = pgEnum('order_status', ['pending', 'in_progress', 'delivered']);

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryPincode: text("delivery_pincode").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  items: json("items").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const productSchema = createInsertSchema(products);

export const orderItemSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  total: z.number(),
  imageUrl: z.string().optional(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  status: true, 
  createdAt: true 
}).extend({
  items: z.array(orderItemSchema)
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum.enum
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderStatus = 'pending' | 'in_progress' | 'delivered';
