import { useState } from 'react';
import { t } from '@/lib/translations';

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isUpdating?: boolean;
}

export default function QuantityControl({ 
  quantity, 
  onIncrement, 
  onDecrement, 
  isUpdating = false 
}: QuantityControlProps) {
  return (
    <div className="flex items-center bg-muted/60 dark:bg-muted/30 rounded-lg px-2 py-1">
      <button 
        className={`w-7 h-7 flex items-center justify-center rounded-full focus:outline-none transition-colors ${
          quantity > 0 
            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800' 
            : 'bg-muted text-muted-foreground dark:bg-muted/40'
        }`}
        onClick={onDecrement}
        disabled={isUpdating || quantity <= 0}
        aria-label={t('decrementQuantity')}
      >
        <i className="fas fa-minus text-xs"></i>
      </button>
      
      <span className="mx-2 text-sm font-medium min-w-[24px] text-center">
        {quantity}
      </span>
      
      <button 
        className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 rounded-full focus:outline-none transition-colors"
        onClick={onIncrement}
        disabled={isUpdating}
        aria-label={t('incrementQuantity')}
      >
        <i className="fas fa-plus text-xs"></i>
      </button>
    </div>
  );
}