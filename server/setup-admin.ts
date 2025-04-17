import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function setupAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername('admin');

    if (!existingAdmin) {
      // Create admin user with properly hashed password
      const hashedPassword = await hashPassword('admin123');

      const adminUser = await storage.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@agrofix.com',
        role: 'admin'
      });

      console.log('Admin user created successfully:', adminUser.username);
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

export async function createProducts() {
  await storage.createProduct({
        name: 'Fresh Tomatoes',
        description: 'Premium quality, farm-fresh tomatoes',
        price: '45.00',
        imageUrl: 'https://images.unsplash.com/photo-1546470427-e26b1345496e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&w=480'
      });

  await storage.createProduct({
        name: 'Potatoes',
        description: 'Fresh farm potatoes, perfect for cooking',
        price: '25.00',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=360&w=480'
      });
}