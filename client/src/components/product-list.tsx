import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, Category } from '@shared/schema';
import { t } from '@/lib/translations';
import ProductCard from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  onEditProduct: (productId: number) => void;
}

export default function ProductList({ onEditProduct }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch products with optional filter
  const productsQueryKey = selectedCategory 
    ? ['/api/products', { category: selectedCategory }]
    : searchTerm 
      ? ['/api/products', { search: searchTerm }]
      : ['/api/products'];
      
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: productsQueryKey,
  });
  
  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    setSearchTerm('');
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedCategory(null);
  };
  
  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">{t('products')}</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8 pr-4 py-2 rounded-lg"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-4">
        <div className="flex space-x-2 overflow-x-auto py-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm"
            onClick={() => handleCategorySelect(null)}
          >
            {t('all')}
          </Button>
          
          {categoriesLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-24 h-8 rounded-full" />
            ))
          ) : (
            categories?.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm"
                onClick={() => handleCategorySelect(category.slug)}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Product Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Skeleton className="w-full h-32" />
              <div className="p-3">
                <Skeleton className="w-3/4 h-5 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="w-1/3 h-4" />
                  <Skeleton className="w-1/4 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products?.length ? (
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={onEditProduct}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {t('noProductsFound')}
          </h3>
          <p className="text-gray-500 max-w-xs">
            {searchTerm ? t('noSearchResults') : t('noProductsInCategory')}
          </p>
        </div>
      )}
    </div>
  );
}
