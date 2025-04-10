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
    <div className="p-4 sm:p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">{t('products')}</h2>
        <div className="relative w-full md:w-auto md:min-w-[260px]">
          <Input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 h-11 rounded-full shadow-sm bg-background border-border"
          />
          <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          {searchTerm && (
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className="whitespace-nowrap px-5 py-2 h-auto rounded-full text-sm shadow-sm"
            onClick={() => handleCategorySelect(null)}
          >
            {t('all')}
          </Button>
          
          {categoriesLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-24 h-10 rounded-full" />
            ))
          ) : (
            categories?.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="whitespace-nowrap px-5 py-2 h-auto rounded-full text-sm shadow-sm"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-card dark:bg-card rounded-lg shadow-md overflow-hidden border border-border">
              <Skeleton className="w-full h-40 sm:h-32" />
              <div className="p-4">
                <Skeleton className="w-3/4 h-6 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="w-1/3 h-4" />
                  <Skeleton className="w-1/4 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={onEditProduct}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <i className="fas fa-search text-4xl text-muted-foreground opacity-50 mb-4"></i>
          <h3 className="text-xl font-medium mb-2">
            {t('noProductsFound')}
          </h3>
          <p className="text-muted-foreground max-w-xs">
            {searchTerm ? t('noSearchResults') : t('noProductsInCategory')}
          </p>
        </div>
      )}
    </div>
  );
}
