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
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
      <div className="relative w-4/5 aspect-square max-w-[300px] border-2 border-white rounded-lg">
        <div className="absolute w-full h-[2px] bg-primary top-1/2 animate-[scan_2s_linear_infinite]"></div>
      </div>
      
      <div className="mt-8 text-white text-center">
        <p className="mb-4">{t('scanInstructions')}</p>
        <Button 
          variant="secondary" 
          onClick={onCancel}
          className="px-6 py-2 rounded-full font-medium"
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
}
