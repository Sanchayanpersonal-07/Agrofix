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
        password: await hashPassword('admin123'),
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