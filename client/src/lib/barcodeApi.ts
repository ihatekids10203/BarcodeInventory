// Barcode API for fetching product details

/**
 * Fetches product information from a barcode using Open Food Facts API
 * @param barcode The product barcode to lookup
 * @returns Product information if found, or null if not found
 */
export async function lookupBarcode(barcode: string): Promise<{ 
  name?: string;
  image?: string;
} | null> {
  try {
    // Use Open Food Facts API to look up product information
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      console.error('Failed to fetch product data:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Check if product was found and has required data
    if (data.status === 1 && data.product) {
      const product = data.product;
      
      // Get product name (prefer German name if available)
      const name = product.product_name_de || product.product_name || null;
      
      // Get product image (front image preferred)
      const image = product.image_front_url || product.image_url || null;
      
      return {
        name: name,
        image: image,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product from barcode:', error);
    return null;
  }
}