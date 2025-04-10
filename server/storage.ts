import { 
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Import/Export
  exportData(): Promise<{ categories: Category[], products: Product[] }>;
  importData(data: { 
    categories: Category[], 
    products: (Product | (Omit<Product, 'image' | 'quantity' | 'categoryId'> & {
      image?: string | null;
      quantity?: number;
      categoryId?: number | null;
    }))[] 
  }): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default categories
    this.initDefaultCategories();
  }

  private async initDefaultCategories() {
    // Check if categories table is empty
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      const defaultCategories: InsertCategory[] = [
        { name: "Lebensmittel", slug: "lebensmittel" },
        { name: "Getränke", slug: "getranke" },
        { name: "Haushalt", slug: "haushalt" },
        { name: "Sonstiges", slug: "sonstiges" }
      ];
      
      for (const category of defaultCategories) {
        await this.createCategory(category);
      }
    }
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.barcode, barcode));
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    
    return result.length > 0;
  }

  // Import/Export
  async exportData(): Promise<{ categories: Category[], products: Product[] }> {
    const categoriesData = await db.select().from(categories);
    const productsData = await db.select().from(products);
    
    return {
      categories: categoriesData,
      products: productsData
    };
  }

  async importData(data: { 
    categories: Category[], 
    products: (Product | (Omit<Product, 'image' | 'quantity' | 'categoryId'> & {
      image?: string | null;
      quantity?: number;
      categoryId?: number | null;
    }))[] 
  }): Promise<void> {
    // Use a transaction to ensure atomic operation
    await db.transaction(async (tx) => {
      // Clear existing data
      await tx.delete(products);
      await tx.delete(categories);
      
      // Import categories
      if (data.categories && data.categories.length) {
        for (const category of data.categories) {
          await tx.insert(categories).values({
            id: category.id,
            name: category.name,
            slug: category.slug
          });
        }
      }
      
      // Import products
      if (data.products && data.products.length) {
        for (const rawProduct of data.products) {
          // Normalize the product to ensure all required fields are present
          await tx.insert(products).values({
            id: rawProduct.id,
            name: rawProduct.name,
            barcode: rawProduct.barcode,
            image: 'image' in rawProduct ? rawProduct.image ?? null : null,
            quantity: 'quantity' in rawProduct ? rawProduct.quantity ?? 1 : 1,
            categoryId: 'categoryId' in rawProduct ? rawProduct.categoryId ?? null : null,
          });
        }
      }
    });
  }
}

// Use the database storage implementation instead of in-memory storage
export const storage = new DatabaseStorage();
