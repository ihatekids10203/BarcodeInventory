import { t } from '@/lib/translations';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddProduct: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onAddProduct }: BottomNavProps) {
  const isActive = (tab: string) => activeTab === tab;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background dark:bg-card border-t border-border py-2 px-4 z-50 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <button 
          className={`flex flex-col items-center transition-colors ${
            isActive('products') 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`} 
          onClick={() => onTabChange('products')}
        >
          <i className="fas fa-box-open text-xl"></i>
          <span className="text-xs mt-1 font-medium">{t('products')}</span>
        </button>
        
        <button 
          className={`flex flex-col items-center transition-colors ${
            isActive('categories') 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`} 
          onClick={() => onTabChange('categories')}
        >
          <i className="fas fa-tags text-xl"></i>
          <span className="text-xs mt-1 font-medium">{t('categories')}</span>
        </button>
        
        <div className="flex justify-center -mt-10">
          <button 
            onClick={onAddProduct}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
            aria-label={t('addProduct')}
          >
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
        
        <button 
          className={`flex flex-col items-center transition-colors ${
            isActive('history') 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`} 
          onClick={() => onTabChange('history')}
        >
          <i className="fas fa-history text-xl"></i>
          <span className="text-xs mt-1 font-medium">{t('history')}</span>
        </button>
        
        <button 
          className={`flex flex-col items-center transition-colors ${
            isActive('profile') 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`} 
          onClick={() => onTabChange('profile')}
        >
          <i className="fas fa-user text-xl"></i>
          <span className="text-xs mt-1 font-medium">{t('profile')}</span>
        </button>
      </div>
    </nav>
  );
}
