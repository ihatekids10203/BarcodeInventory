import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import ProductList from '@/components/product-list';
import ProductForm from '@/components/product-form';
import Scanner from '@/components/scanner';
import { t } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';

// State management for views
type ViewState = 'productList' | 'productForm' | 'scanner';
type TabState = 'products' | 'categories' | 'history' | 'profile';

export default function Home() {
  const [activeView, setActiveView] = useState<ViewState>('productList');
  const [activeTab, setActiveTab] = useState<TabState>('products');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Reset form when switching to add product
  const handleAddProduct = () => {
    setEditingProductId(null);
    setActiveView('productForm');
  };
  
  // Set product ID when editing existing product
  const handleEditProduct = (productId: number) => {
    setEditingProductId(productId);
    setActiveView('productForm');
  };
  
  // Show scanner view
  const handleScanBarcode = () => {
    setActiveView('scanner');
  };
  
  // Handle barcode detection
  const handleBarcodeDetected = useCallback((barcode: string) => {
    setScannedBarcode(barcode);
    setActiveView('productForm');
    toast({
      description: `${t('barcode')}: ${barcode}`,
    });
  }, [toast]);
  
  // Handle form completion
  const handleFormSuccess = () => {
    setActiveView('productList');
    setEditingProductId(null);
    setScannedBarcode(null);
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabState);
    // Only products tab is implemented in this version
    if (tab !== 'products') {
      toast({
        description: `${tab} ${t('feature')} noch nicht implementiert`,
      });
    }
  };
  
  // Mock handlers for export/import menu
  const handleExport = () => {
    // Implementation handled in ExportImportMenu component
  };
  
  const handleImport = () => {
    // Implementation handled in ExportImportMenu component
  };
  
  const handleSettings = () => {
    toast({
      description: `${t('settings')} noch nicht implementiert`,
    });
  };
  
  // Create a reference to the form's updateBarcodeValue function
  const updateBarcodeValueRef = useRef<(barcode: string) => void>();
  
  // When scanned barcode changes, pass it to the form
  useEffect(() => {
    if (scannedBarcode && activeView === 'productForm' && updateBarcodeValueRef.current) {
      // Call the form's barcode update function
      updateBarcodeValueRef.current(scannedBarcode);
    }
  }, [scannedBarcode, activeView]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onExport={handleExport}
        onImport={handleImport}
        onSettings={handleSettings}
      />
      
      <div className="flex-1 overflow-hidden relative">
        <div className={`${activeView === 'productList' ? 'block' : 'hidden'}`}>
          <ProductList onEditProduct={handleEditProduct} />
        </div>
        
        {activeView === 'productForm' && (
          <ProductForm
            productId={editingProductId}
            onScanBarcode={handleScanBarcode}
            onCancel={() => setActiveView('productList')}
            onSuccess={handleFormSuccess}
            onBarcodeHandler={(handler) => {
              updateBarcodeValueRef.current = handler;
            }}
          />
        )}
        
        {activeView === 'scanner' && (
          <Scanner
            onBarcodeDetected={handleBarcodeDetected}
            onCancel={() => setActiveView('productForm')}
          />
        )}
      </div>
      
      {activeView === 'productList' && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddProduct={handleAddProduct}
        />
      )}
    </div>
  );
}
