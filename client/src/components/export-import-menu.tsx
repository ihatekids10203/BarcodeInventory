import { useRef } from 'react';
import { t } from '@/lib/translations';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface ExportImportMenuProps {
  onExport: () => void;
  onImport: () => void;
  onSettings: () => void;
  onClose: () => void;
}

export default function ExportImportMenu({ onExport, onImport, onSettings, onClose }: ExportImportMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Handle export data
  const handleExport = async () => {
    try {
      const response = await fetch('/api/export');
      if (!response.ok) throw new Error(t('exportError'));
      
      const data = await response.json();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lager-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        description: t('exportSuccess'),
      });
      
      onExport();
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('exportError'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle import data
  const handleImportClick = () => {
    fileInputRef.current?.click();
    onImport();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          await apiRequest('POST', '/api/import', jsonData);
          
          // Refresh data
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
          
          toast({
            description: t('importSuccess'),
          });
        } catch (error) {
          toast({
            title: t('error'),
            description: error instanceof Error ? error.message : t('importError'),
            variant: 'destructive',
          });
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('importError'),
        variant: 'destructive',
      });
    }
    
    // Reset the input
    e.target.value = '';
  };
  
  return (
    <div className="absolute right-4 top-16 bg-white shadow-lg rounded-lg z-20 w-48">
      <div className="py-2">
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-100" 
          onClick={handleExport}
        >
          <i className="fas fa-download mr-2 text-primary"></i>{t('exportData')}
        </button>
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-100" 
          onClick={handleImportClick}
        >
          <i className="fas fa-upload mr-2 text-primary"></i>{t('importData')}
        </button>
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-100" 
          onClick={onSettings}
        >
          <i className="fas fa-cog mr-2 text-primary"></i>{t('settings')}
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
    </div>
  );
}
