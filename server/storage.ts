import { products, Product, InsertProduct, orders, Order, InsertOrder, OrderStatus, users, User, InsertUser } from "@shared/schema";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import "dotenv/config";
import session from 'express-session';

// For TypeScript, specify types for product and order map
type ProductMap = Map<number, Product>;
type OrderMap = Map<number, Order>;

// Interface for CRUD operations
export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Order operations
  getAllOrders(): Promise<Order[]>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined>;

  // Email notification
  markOrderAsNotified(id: number): Promise<boolean>;

  // Session storage
  sessionStore: any;
}

// In-memory storage implementation (fallback)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private userId: number;
  private productId: number;
  private orderId: number;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.userId = 1;
    this.productId = 1;
    this.orderId = 1;

    // Initialize session store with dynamic import for ESM compatibility
    this.sessionStore = null; // Initialize as null first
    import('memorystore').then(memoryStoreModule => {
      const MemoryStore = memoryStoreModule.default(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // 24 hours
      });
    }).catch(err => {
      console.error('Failed to initialize memory session store:', err);
    });

    // Initialize with some sample products
    this.initializeSampleProducts();

    // Default admin user is now created in setup-admin.ts with proper password hashing
    // Don't create it here to avoid duplicates and password hashing issues
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const role = user.role || 'buyer'; // Default to 'buyer' if role is not provided
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      email: user.email,
      role: role,
      createdAt: now
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }

  // Order operations for user
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const allOrders = Array.from(this.orders.values());
    return allOrders.filter(order => order.userId === userId);
  }

  // Email notification
  async markOrderAsNotified(id: number): Promise<boolean> {
    const order = this.orders.get(id);
    if (!order) return false;

    order.emailNotified = true;
    this.orders.set(id, order);
    return true;
  }

  private initializeSampleProducts() {
    const sampleProducts: InsertProduct[] = [
        {
          name: 'Fresh Tomatoes',
          description: 'Premium quality, farm-fresh tomatoes',
          price: '25.00',
          imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8dG9tYXRvfHx8fHx8MTY4OTYzMDM2Mw&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
        },
        {
          name: 'Potatoes',
          description: 'Fresh farm potatoes, perfect for cooking',
          price: '45.00',
          imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8cG90YXRvfHx8fHx8MTY4OTYzMDQxMQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480'
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
  public sessionStore: any;

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

      // Initialize session store with PostgreSQL
      // Use dynamic import for ESM compatibility
      import('connect-pg-simple').then(pgSessionModule => {
        const PgSession = pgSessionModule.default(session);
        this.sessionStore = new PgSession({
          conObject: {
            connectionString: connectionString,
            ssl: { rejectUnauthorized: false }
          },
          createTableIfMissing: true,
          tableName: 'session'
        });
      }).catch(err => {
        console.error('Failed to initialize session store:', err);
      });

      // Initialize the database with sample products if empty
      this.initPromise = this.initialize();
    } catch (error) {
      console.error("Failed to initialize Neon database connection:", error);
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    try {
      console.log('Initializing NeonDB database connection...');

      // Try to create tables directly with SQL if they don't exist
      try {
        // Verify database connection with a simple query
        const testResult = await this.client`SELECT 1 as test`;
        console.log('Database connection test result:', testResult);

        // Check if tables exist
        const tables = await this.client`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        `;

        console.log('Database tables:', tables);

        const hasProductsTable = tables.some(table => table.table_name === 'products');
        const hasOrdersTable = tables.some(table => table.table_name === 'orders');
        const hasUsersTable = tables.some(table => table.table_name === 'users');

        // Create tables if they don't exist
        if (!hasProductsTable || !hasOrdersTable || !hasUsersTable) {
          console.log('Creating database tables...');
          // Create tables directly with SQL for simplicity
          if (!hasProductsTable) {
            await this.client`
              CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                image_url TEXT
              )
            `;
            console.log('Products table created');
          }

          if (!hasOrdersTable) {
            try {
              // Create enum type first
              await this.client`CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'delivered')`;
            } catch (enumError) {
              console.log('Enum type already exists or other error:', enumError);
            }

            await this.client`
              CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                delivery_address TEXT NOT NULL,
                delivery_city TEXT NOT NULL,
                delivery_pincode TEXT NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                status order_status NOT NULL DEFAULT 'pending',
                items JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
              )
            `;
            console.log('Orders table created');
          }

          if (!hasUsersTable) {
            try {
              // Create user role enum type first
              await this.client`CREATE TYPE user_role AS ENUM ('buyer', 'admin')`;
            } catch (enumError) {
              console.log('User role enum type already exists or other error:', enumError);
            }

            await this.client`
              CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                email TEXT NOT NULL,
                role user_role NOT NULL DEFAULT 'buyer',
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
              )
            `;
            console.log('Users table created');

            // Admin user is now created in setup-admin.ts
            console.log('Database initialized successfully');
          }
        }

        // Check if products table is empty and add sample data if needed
        const productCount = await this.client`SELECT COUNT(*) FROM products`;
        console.log('Product count:', productCount);

        if (productCount[0].count === '0' || productCount[0].count === 0) {
          console.log('Initializing database with sample products...');
          // Add sample products
          await this.client`
            INSERT INTO products (name, description, price, image_url)
            VALUES 
              ('Fresh Tomatoes', 'Premium quality, farm-fresh tomatoes', 45, 'https://images.unsplash.com/photo-1546470427-e26b1345496e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&w=480'),
              ('Potatoes', 'Fresh farm potatoes, perfect for cooking', 25, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&w=480'),
              ('Onions', 'Premium quality red onions', 30, 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&w=480'),
              ('Carrots', 'Fresh and crunchy organic carrots', 40, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2Fycm90fHx8fHx8MTY4OTYzMDUyMg&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=480')
          `;
          console.log('Sample products added to database');
        }
      } catch (dbError) {
        console.error('Error setting up database tables:', dbError);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database', error);
      this.initialized = true; // Still mark as initialized to prevent further attempts
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
        totalAmount: Number(order.totalAmount),
        userId: order.userId === null ? undefined : order.userId,
        emailNotified: order.emailNotified === null ? undefined : order.emailNotified
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
        totalAmount: Number(order.totalAmount),
        userId: order.userId === null ? undefined : order.userId,
        emailNotified: order.emailNotified === null ? undefined : order.emailNotified
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
        totalAmount: Number(newOrder.totalAmount),
        userId: newOrder.userId === null ? undefined : newOrder.userId,
        emailNotified: newOrder.emailNotified === null ? undefined : newOrder.emailNotified
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
        totalAmount: Number(updatedOrder.totalAmount),
        userId: updatedOrder.userId === null ? undefined : updatedOrder.userId,
        emailNotified: updatedOrder.emailNotified === null ? undefined : updatedOrder.emailNotified
      };
    } catch (error) {
      console.error(`Error updating order status ${id}:`, error);
      throw error;
    }
  }

  // Order operations for user
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      const result = await this.db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId));

      return result.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        userId: order.userId === null ? undefined : order.userId,
        emailNotified: order.emailNotified === null ? undefined : order.emailNotified
      }));
    } catch (error) {
      console.error(`Error getting orders for user ${userId}:`, error);
      throw error;
    }
  }

  // Email notification
  async markOrderAsNotified(id: number): Promise<boolean> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .update(orders)
        .set({ emailNotified: true })
        .where(eq(orders.id, id))
        .returning({ id: orders.id });

      return result.length > 0;
    } catch (error) {
      console.error(`Error marking order ${id} as notified:`, error);
      throw error;
    }
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    await this.ensureInitialized();
    try {
      const result = await this.db
        .insert(users)
        .values({
          ...user,
          createdAt: new Date()
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (result.length === 0) return undefined;
      return result[0];
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (result.length === 0) return undefined;
      return result[0];
    } catch (error) {
      console.error(`Error getting user by username ${username}:`, error);
      throw error;
    }
  }
}

// Choose the appropriate storage implementation based on environment
const useNeonDB = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
export const storage = useNeonDB ? new NeonDBStorage() : new MemStorage();