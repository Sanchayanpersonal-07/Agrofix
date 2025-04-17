import { products, Product, InsertProduct, orders, Order, InsertOrder, OrderStatus } from "@shared/schema";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import "dotenv/config";

// For TypeScript, specify types for product and order map
type ProductMap = Map<number, Product>;
type OrderMap = Map<number, Order>;

// Interface for CRUD operations
export interface IStorage {
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order operations
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined>;
}

// In-memory storage implementation (fallback)
export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private productId: number;
  private orderId: number;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.productId = 1;
    this.orderId = 1;
    
    // Initialize with some sample products
    this.initializeSampleProducts();
  }

  private initializeSampleProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: 'Fresh Tomatoes',
        description: 'Premium quality, farm-fresh tomatoes',
        price: '45',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8dG9tYXRvfHx8fHx8MTY4OTYzMDM2Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
      },
      {
        name: 'Potatoes',
        description: 'Fresh farm potatoes, perfect for cooking',
        price: '25',
        imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8cG90YXRvfHx8fHx8MTY4OTYzMDQxMQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
      },
      {
        name: 'Onions',
        description: 'Premium quality red onions',
        price: '30',
        imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8b25pb258fHx8fHwxNjg5NjMwNDYz&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
      },
      {
        name: 'Carrots',
        description: 'Fresh and crunchy organic carrots',
        price: '40',
        imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2Fycm90fHx8fHx8MTY4OTYzMDUyMg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
      }
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      id, 
      name: product.name,
      description: product.description || null,
      price: product.price,
      imageUrl: product.imageUrl || null 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct: Product = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const newOrder: Order = { 
      id, 
      ...order,
      status: 'pending',
      createdAt: now
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder: Order = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

// Neon Postgres storage implementation
export class NeonDBStorage implements IStorage {
  private db;
  private client;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  
  constructor() {
    try {
      const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('No database connection string provided');
      }
      
      // Initialize Neon database connection with postgres.js
      this.client = postgres(connectionString, {
        ssl: 'require',
        max: 10, // Maximum number of connections
        idle_timeout: 20, // Timeout in seconds
      });
      
      // Create Drizzle ORM instance with postgres.js client
      this.db = drizzle(this.client);
      
      // Initialize the database with sample products if empty
      this.initPromise = this.initialize();
    } catch (error) {
      console.error("Failed to initialize Neon database connection:", error);
      throw error;
    }
  }
  
  private async initialize(): Promise<void> {
    try {
      // Check if products table is empty
      const existingProducts = await this.getAllProducts();
      
      if (existingProducts.length === 0) {
        console.log('Initializing database with sample products...');
        const sampleProducts: InsertProduct[] = [
          {
            name: 'Fresh Tomatoes',
            description: 'Premium quality, farm-fresh tomatoes',
            price: '45',
            imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8dG9tYXRvfHx8fHx8MTY4OTYzMDM2Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
          },
          {
            name: 'Potatoes',
            description: 'Fresh farm potatoes, perfect for cooking',
            price: '25',
            imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8cG90YXRvfHx8fHx8MTY4OTYzMDQxMQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
          },
          {
            name: 'Onions',
            description: 'Premium quality red onions',
            price: '30',
            imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8b25pb258fHx8fHwxNjg5NjMwNDYz&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
          },
          {
            name: 'Carrots',
            description: 'Fresh and crunchy organic carrots',
            price: '40',
            imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2Fycm90fHx8fHx8MTY4OTYzMDUyMg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
          }
        ];
        
        // Insert sample products
        for (const product of sampleProducts) {
          await this.createProduct(product);
        }
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database', error);
      throw error;
    }
  }
  
  private async ensureInitialized() {
    if (!this.initialized && this.initPromise) {
      await this.initPromise;
    }
  }
  
  // Product operations
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('Fetching all products from database...');
      
      // Try direct SQL query first to ensure we can access the data
      try {
        const rawResult = await this.client`SELECT * FROM products`;
        console.log('Raw SQL query result:', rawResult);
      } catch (sqlError) {
        console.error('Direct SQL query failed:', sqlError);
      }
      
      const result = await this.db.select().from(products);
      console.log('Products retrieved from database:', result);
      
      // If no products found via ORM, fallback to direct SQL
      if (!result || result.length === 0) {
        console.log('No products found via ORM, trying direct SQL');
        const rawProducts = await this.client`SELECT * FROM products`;
        
        // Map raw products to our Product type
        return rawProducts.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          imageUrl: p.image_url
        }));
      }
      
      // Convert decimal strings to numbers for client consistency
      const formattedProducts = result.map(product => ({
        ...product,
        price: Number(product.price)
      }));
      
      console.log('Formatted products:', formattedProducts);
      return formattedProducts;
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    try {
      const result = await this.db.select().from(products).where(eq(products.id, id));
      if (result.length === 0) return undefined;
      
      const product = result[0];
      return {
        ...product,
        price: Number(product.price)
      };
    } catch (error) {
      console.error(`Error getting product ${id}:`, error);
      throw error;
    }
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    await this.ensureInitialized();
    try {
      const result = await this.db.insert(products).values(product).returning();
      const newProduct = result[0];
      return {
        ...newProduct,
        price: Number(newProduct.price)
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
  
  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .update(products)
        .set(product)
        .where(eq(products.id, id))
        .returning();
      
      if (result.length === 0) return undefined;
      
      const updatedProduct = result[0];
      return {
        ...updatedProduct,
        price: Number(updatedProduct.price)
      };
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .delete(products)
        .where(eq(products.id, id))
        .returning({ id: products.id });
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
  
  // Order operations
  async getAllOrders(): Promise<Order[]> {
    try {
      const result = await this.db.select().from(orders);
      return result.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount)
      }));
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    try {
      const result = await this.db.select().from(orders).where(eq(orders.id, id));
      if (result.length === 0) return undefined;
      
      const order = result[0];
      return {
        ...order,
        totalAmount: Number(order.totalAmount)
      };
    } catch (error) {
      console.error(`Error getting order ${id}:`, error);
      throw error;
    }
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .insert(orders)
        .values({
          ...order,
          status: 'pending',
          createdAt: new Date()
        })
        .returning();
      
      const newOrder = result[0];
      return {
        ...newOrder,
        totalAmount: Number(newOrder.totalAmount)
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
  
  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();
      
      if (result.length === 0) return undefined;
      
      const updatedOrder = result[0];
      return {
        ...updatedOrder,
        totalAmount: Number(updatedOrder.totalAmount)
      };
    } catch (error) {
      console.error(`Error updating order status ${id}:`, error);
      throw error;
    }
  }
}

// Choose the appropriate storage implementation based on environment
const useNeonDB = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
export const storage = useNeonDB ? new NeonDBStorage() : new MemStorage();
