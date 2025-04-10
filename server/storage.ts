import { 
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private categoryCurrentId: number;
  private productCurrentId: number;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.categoryCurrentId = 1;
    this.productCurrentId = 1;
    
    // Initialize with default categories
    this.initDefaultCategories();
  }

  private async initDefaultCategories() {
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

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.barcode === barcode
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Import/Export
  async exportData(): Promise<{ categories: Category[], products: Product[] }> {
    return {
      categories: Array.from(this.categories.values()),
      products: Array.from(this.products.values())
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
    // Clear existing data
    this.categories.clear();
    this.products.clear();
    
    // Reset IDs
    this.categoryCurrentId = 1;
    this.productCurrentId = 1;
    
    // Import categories
    if (data.categories && data.categories.length) {
      for (const category of data.categories) {
        this.categories.set(category.id, category);
        this.categoryCurrentId = Math.max(this.categoryCurrentId, category.id + 1);
      }
    }
    
    // Import products
    if (data.products && data.products.length) {
      for (const rawProduct of data.products) {
        // Normalize the product to ensure all required fields are present
        const product: Product = {
          id: rawProduct.id,
          name: rawProduct.name,
          barcode: rawProduct.barcode,
          image: 'image' in rawProduct ? rawProduct.image ?? null : null,
          quantity: 'quantity' in rawProduct ? rawProduct.quantity ?? 1 : 1,
          categoryId: 'categoryId' in rawProduct ? rawProduct.categoryId ?? null : null,
        };
        
        this.products.set(product.id, product);
        this.productCurrentId = Math.max(this.productCurrentId, product.id + 1);
      }
    }
  }
}

export const storage = new MemStorage();
