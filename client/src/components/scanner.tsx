import { useEffect, useRef } from 'react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/translations';

interface ScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onCancel: () => void;
}

export default function Scanner({ onBarcodeDetected, onCancel }: ScannerProps) {
  const { startScanning, stopScanning, isScanning, error } = useBarcodeScanner(onBarcodeDetected);
  const { toast } = useToast();
  
  // Start scanner when component mounts
  useEffect(() => {
    startScanning().catch((err) => {
      toast({
        title: t('barcodeScanError'),
        description: err.message,
        variant: 'destructive',
      });
    });
    
    // Clean up when component unmounts
    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning, toast]);
  
  // Show error if any
  useEffect(() => {
    if (error) {
      toast({
        title: t('barcodeScanError'),
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  return (
    <div className="fixed inset-0 bg-black/90 dark:bg-black/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <h2 className="text-white text-xl font-medium text-center mb-2">{t('scanBarcode')}</h2>
        <p className="text-white/80 text-center text-sm max-w-xs mx-auto">{t('scanInstructions')}</p>
      </div>
      
      <div className="relative w-4/5 aspect-square max-w-[300px] border-2 border-white/30 rounded-xl overflow-hidden">
        <div className="absolute inset-0 border-4 border-primary/40 rounded-lg"></div>
        <div className="absolute w-full h-[3px] bg-primary top-1/2 animate-[scan_2s_ease-in-out_infinite]"></div>
        <div className="absolute left-0 top-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
        <div className="absolute right-0 top-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
        <div className="absolute left-0 bottom-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
        <div className="absolute right-0 bottom-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
      </div>
      
      <div className="mt-10 text-center">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="px-8 py-2 rounded-full font-medium text-white border-white/30 hover:bg-white/10"
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
}
