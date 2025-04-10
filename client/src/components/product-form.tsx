import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { insertProductSchema, Product, Category } from '@shared/schema';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  productId?: number | null;
  onScanBarcode: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

// Extend the product schema for the form
const productFormSchema = insertProductSchema.extend({
  image: z.string().optional(),
}).refine(data => data.barcode.trim() !== '', {
  message: t('barcodeRequired'),
  path: ['barcode'],
}).refine(data => data.name.trim() !== '', {
  message: t('nameRequired'),
  path: ['name'],
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductForm({ productId, onScanBarcode, onCancel, onSuccess }: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch product data if editing
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Setup form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      barcode: '',
      quantity: 1,
      categoryId: undefined,
      image: undefined,
    },
  });
  
  // Load product data into form when available
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        barcode: product.barcode,
        quantity: product.quantity,
        categoryId: product.categoryId,
        image: product.image,
      });
      
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [product, form]);
  
  // Handle form submission
  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (productId) {
        // Update existing product
        await apiRequest('PATCH', `/api/products/${productId}`, values);
        toast({
          description: t('productUpdated'),
        });
      } else {
        // Create new product
        await apiRequest('POST', '/api/products', values);
        toast({
          description: t('productCreated'),
        });
      }
      
      // Invalidate queries and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onSuccess();
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('productSaveError'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        form.setValue('image', result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle barcode input from scanner
  const updateBarcodeValue = (barcode: string) => {
    form.setValue('barcode', barcode);
  };
  
  const handleQuantityChange = (action: 'increment' | 'decrement') => {
    const currentValue = form.getValues('quantity') || 0;
    const newValue = action === 'increment' ? currentValue + 1 : Math.max(0, currentValue - 1);
    form.setValue('quantity', newValue);
  };
  
  return (
    <div className="absolute inset-0 bg-white z-10 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onCancel} className="text-primary p-0">
          <i className="fas fa-arrow-left mr-2"></i>{t('back')}
        </Button>
        <h2 className="text-lg font-medium">
          {productId ? t('editProduct') : t('addProduct')}
        </h2>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Upload */}
          <div className="mb-4">
            <div className="relative bg-gray-100 h-48 rounded-lg flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={t('productImage')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <i className="fas fa-camera text-gray-400 text-2xl mb-2"></i>
                  <p className="text-sm text-gray-500">{t('addPhoto')}</p>
                </div>
              )}
              <input
                type="file"
                id="imageUpload"
                className="absolute inset-0 opacity-0"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          
          {/* Barcode Field */}
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('barcode')}</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('barcodePlaceholder')}
                      className="pr-10"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onScanBarcode}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary h-auto p-1"
                  >
                    <i className="fas fa-barcode"></i>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Product Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('productName')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('productNamePlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category Field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('category')}</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Quantity Field */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('quantity')}</FormLabel>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleQuantityChange('decrement')}
                    className="w-10 h-10 p-0 rounded-l-lg"
                  >
                    <i className="fas fa-minus"></i>
                  </Button>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      className="w-16 h-10 rounded-none text-center"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleQuantityChange('increment')}
                    className="w-10 h-10 p-0 rounded-r-lg"
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button type="submit" className="w-full py-3 rounded-lg font-medium">
              {t('save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
