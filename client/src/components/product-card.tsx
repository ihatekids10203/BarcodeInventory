import { useState } from 'react';
import { Product } from '@shared/schema';
import { t } from '@/lib/translations';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import QuantityControl from '@/components/quantity-control';

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
          <QuantityControl 
            quantity={product.quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            isUpdating={isUpdating}
          />
        </div>
      </div>
    </div>
  );
}
