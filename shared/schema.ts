import { pgTable, text, serial, integer, decimal, json, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const orderStatusEnum = pgEnum('order_status', ['pending', 'in_progress', 'delivered']);
export const userRoleEnum = pgEnum('user_role', ['buyer', 'admin']);

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default('buyer'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  userId: integer("userid").references(() => users.id),
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
  emailNotified: boolean("email_notified").default(false),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});
export const userSchema = createInsertSchema(users);

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
  createdAt: true,
  userId: true, 
  emailNotified: true
}).extend({
  items: z.array(orderItemSchema),
  userId: z.number().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'delivered'])
});

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Valid email is required"),
  role: z.enum(['buyer', 'admin']).default('buyer')
});

// Types
export type User = {
  id: number;
  username: string;
  password: string; // This is hashed in the database
  email: string;
  role: 'buyer' | 'admin';
  createdAt: Date;
};
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string | number; // Allow both string and number to handle conversion
  imageUrl: string | null;
};
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type OrderItem = z.infer<typeof orderItemSchema>;

export type Order = {
  id: number;
  userId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  totalAmount: string | number; // Allow both string and number to handle conversion
  status: OrderStatus;
  items: unknown;
  createdAt: Date;
  emailNotified?: boolean;
};
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderStatus = 'pending' | 'in_progress' | 'delivered';
