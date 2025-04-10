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
    <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center justify-between shadow-md">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">{t('appTitle')}</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-primary-foreground/20 focus:bg-primary-foreground/20 transition-colors"
            aria-label={t('menu')}
          >
            <i className="fas fa-ellipsis-h text-lg"></i>
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
      </div>
    </header>
  );
}
