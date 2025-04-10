import { useState } from 'react';
import { Product } from '@shared/schema';
import { t } from '@/lib/translations';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface ProductCardProps {
  product: Product;
  onEdit: (productId: number) => void;
}

export default function ProductCard({ product, onEdit }: ProductCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleIncrement = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      const updatedQuantity = product.quantity + 1;
      await apiRequest('PATCH', `/api/products/${product.id}`, { quantity: updatedQuantity });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        description: t('quantityUpdated'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('quantityUpdateFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDecrement = async () => {
    if (isUpdating || product.quantity <= 0) return;
    try {
      setIsUpdating(true);
      const updatedQuantity = product.quantity - 1;
      await apiRequest('PATCH', `/api/products/${product.id}`, { quantity: updatedQuantity });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      if (updatedQuantity === 0) {
        toast({
          description: t('productOutOfStock'),
          variant: 'destructive',
        });
      } else {
        toast({
          description: t('quantityUpdated'),
        });
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('quantityUpdateFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Use default placeholder for non-existent images
  const productImage = product.image || 'https://via.placeholder.com/300x200/f3f4f6/a0aec0?text=Kein+Bild';
  
  return (
    <div className="bg-card dark:bg-card rounded-lg shadow-md overflow-hidden border border-border hover:shadow-lg transition-all">
      <div className="relative">
        <img 
          src={productImage}
          alt={product.name} 
          className="w-full h-40 sm:h-32 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x200/f3f4f6/a0aec0?text=Bild+Fehler';
          }}
        />
        <div className="absolute top-2 right-2 bg-background/80 dark:bg-background/60 backdrop-blur-sm p-2 rounded-full shadow">
          <button 
            className="text-foreground hover:text-primary transition-colors"
            onClick={() => onEdit(product.id)}
            aria-label={t('editProduct')}
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-base mb-2">{product.name}</h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground">{product.barcode}</span>
          </div>
          <div className="flex items-center bg-muted rounded-lg px-2 py-1">
            <button 
              className={`w-7 h-7 flex items-center justify-center ${
                product.quantity > 0 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800' 
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
              } rounded-full focus:outline-none transition-colors`}
              onClick={handleDecrement}
              disabled={isUpdating || product.quantity <= 0}
              aria-label={t('decrementQuantity')}
            >
              <i className="fas fa-minus text-xs"></i>
            </button>
            <span className="mx-2 text-sm font-medium">{product.quantity}</span>
            <button 
              className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 rounded-full focus:outline-none transition-colors"
              onClick={handleIncrement}
              disabled={isUpdating}
              aria-label={t('incrementQuantity')}
            >
              <i className="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
