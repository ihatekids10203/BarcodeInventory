import { useState } from 'react';
import { t } from '@/lib/translations';
import ExportImportMenu from '@/components/export-import-menu';

interface HeaderProps {
  onExport: () => void;
  onImport: () => void;
  onSettings: () => void;
}

export default function Header({ onExport, onImport, onSettings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleMenuAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };
  
  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md">
      <h1 className="text-xl font-bold">{t('appTitle')}</h1>
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleMenu}
          className="p-2 rounded-full hover:bg-blue-600 transition-colors"
          aria-label={t('menu')}
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
      
      {isMenuOpen && (
        <ExportImportMenu 
          onExport={() => handleMenuAction(onExport)}
          onImport={() => handleMenuAction(onImport)}
          onSettings={() => handleMenuAction(onSettings)}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}
