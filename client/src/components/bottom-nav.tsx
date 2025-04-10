import { t } from '@/lib/translations';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddProduct: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onAddProduct }: BottomNavProps) {
  const isActive = (tab: string) => activeTab === tab;
  
  return (
    <nav className="bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-between items-center">
        <button 
          className={`flex flex-col items-center ${isActive('products') ? 'text-primary' : 'text-gray-500'}`} 
          onClick={() => onTabChange('products')}
        >
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1">{t('products')}</span>
        </button>
        
        <button 
          className={`flex flex-col items-center ${isActive('categories') ? 'text-primary' : 'text-gray-500'}`} 
          onClick={() => onTabChange('categories')}
        >
          <i className="fas fa-list text-xl"></i>
          <span className="text-xs mt-1">{t('categories')}</span>
        </button>
        
        <div className="flex justify-center -mt-8">
          <button 
            onClick={onAddProduct}
            className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
            aria-label={t('addProduct')}
          >
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
        
        <button 
          className={`flex flex-col items-center ${isActive('history') ? 'text-primary' : 'text-gray-500'}`} 
          onClick={() => onTabChange('history')}
        >
          <i className="fas fa-history text-xl"></i>
          <span className="text-xs mt-1">{t('history')}</span>
        </button>
        
        <button 
          className={`flex flex-col items-center ${isActive('profile') ? 'text-primary' : 'text-gray-500'}`} 
          onClick={() => onTabChange('profile')}
        >
          <i className="fas fa-user text-xl"></i>
          <span className="text-xs mt-1">{t('profile')}</span>
        </button>
      </div>
    </nav>
  );
}
