import express, { type Express, type Request, type Response, type Router, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Categories endpoints
  apiRouter.get("/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Abrufen der Kategorien" });
    }
  });

  apiRouter.post("/categories", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Fehler beim Erstellen der Kategorie" });
    }
  });

  // Products endpoints
  apiRouter.get("/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      
      // Filter by category if provided
      const categorySlug = req.query.category as string | undefined;
      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug);
        if (category) {
          const filteredProducts = products.filter(product => product.categoryId === category.id);
          return res.json(filteredProducts);
        }
        return res.json([]);
      }
      
      // Filter by search term if provided
      const search = req.query.search as string | undefined;
      if (search && search.trim() !== '') {
        const searchTerm = search.toLowerCase();
        const filteredProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) || 
          product.barcode.toLowerCase().includes(searchTerm)
        );
        return res.json(filteredProducts);
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Abrufen der Produkte" });
    }
  });

  apiRouter.get("/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Ungültige Produkt-ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produkt nicht gefunden" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Abrufen des Produkts" });
    }
  });
  
  apiRouter.get("/products/barcode/:barcode", async (req: Request, res: Response) => {
    try {
      const barcode = req.params.barcode;
      const product = await storage.getProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ message: "Produkt mit diesem Barcode nicht gefunden" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Abrufen des Produkts" });
    }
  });

  apiRouter.post("/products", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      // Check if product with barcode already exists
      const existingProduct = await storage.getProductByBarcode(validatedData.barcode);
      if (existingProduct) {
        return res.status(409).json({ message: "Produkt mit diesem Barcode existiert bereits" });
      }
      
      const newProduct = await storage.createProduct(validatedData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Fehler beim Erstellen des Produkts" });
    }
  });

  apiRouter.patch("/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Ungültige Produkt-ID" });
      }
      
      // Partial validation of fields that are present
      const updates: Record<string, any> = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.barcode !== undefined) updates.barcode = req.body.barcode;
      if (req.body.image !== undefined) updates.image = req.body.image;
      if (req.body.quantity !== undefined) updates.quantity = req.body.quantity;
      if (req.body.categoryId !== undefined) updates.categoryId = req.body.categoryId;
      
      // Validate the updates with a partial schema
      try {
        insertProductSchema.partial().parse(updates);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const error = fromZodError(validationError);
          return res.status(400).json({ message: error.message });
        }
      }
      
      // Check if attempting to update to an existing barcode
      if (updates.barcode) {
        const existingProduct = await storage.getProductByBarcode(updates.barcode);
        if (existingProduct && existingProduct.id !== id) {
          return res.status(409).json({ message: "Produkt mit diesem Barcode existiert bereits" });
        }
      }
      
      const updatedProduct = await storage.updateProduct(id, updates);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Produkt nicht gefunden" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Aktualisieren des Produkts" });
    }
  });

  apiRouter.delete("/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Ungültige Produkt-ID" });
      }
      
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Produkt nicht gefunden" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Löschen des Produkts" });
    }
  });

  // Import/Export endpoints
  apiRouter.get("/export", async (req: Request, res: Response) => {
    try {
      const data = await storage.exportData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Exportieren der Daten" });
    }
  });

  apiRouter.post("/import", async (req: Request, res: Response) => {
    try {
      // Define the schema for imported data
      const categorySchema = insertCategorySchema.extend({ id: z.number() });
      const productSchema = insertProductSchema.extend({ 
        id: z.number(),
        image: z.string().nullable().optional().transform(val => val === undefined ? null : val),
        quantity: z.number().optional().transform(val => val === undefined ? 0 : val),
        categoryId: z.number().nullable().optional().transform(val => val === undefined ? null : val)
      });
      
      const importSchema = z.object({
        categories: z.array(categorySchema),
        products: z.array(productSchema)
      });
      
      // Validate and transform the data
      const validatedData = importSchema.parse(req.body);
      await storage.importData(validatedData);
      res.status(200).json({ message: "Daten erfolgreich importiert" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Fehler beim Importieren der Daten" });
    }
  });

  // Mount the API router
  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
