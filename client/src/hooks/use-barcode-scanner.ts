import { useState, useCallback, useRef } from 'react';

interface UseBarcodeScanner {
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  isScanning: boolean;
  error: string | null;
}

export function useBarcodeScanner(onBarcodeDetected: (barcode: string) => void): UseBarcodeScanner {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to start the barcode scanner
  const startScanning = useCallback(async () => {
    try {
      setError(null);
      
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Ihr Browser unterstützt keine Kamerafunktion');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      setIsScanning(true);
      
      // Create a video element and add the stream
      const video = document.createElement('video');
      videoRef.current = video;
      video.srcObject = stream;
      
      // Load and initialize BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_39', 'code_128', 'qr_code', 'pdf417', 'data_matrix', 'upc_a', 'upc_e']
        });
        
        // Start video playback
        video.play();
        
        // Continuously detect barcodes
        const detectBarcode = async () => {
          if (!isScanning || !videoRef.current) return;
          
          try {
            const barcodes = await barcodeDetector.detect(video);
            
            if (barcodes.length > 0) {
              // Barcode detected
              const barcode = barcodes[0].rawValue;
              onBarcodeDetected(barcode);
              stopScanning();
            } else {
              // Continue scanning
              requestAnimationFrame(detectBarcode);
            }
          } catch (err) {
            console.error('Barcode detection error:', err);
            requestAnimationFrame(detectBarcode);
          }
        };
        
        detectBarcode();
      } else {
        // BarcodeDetector API not available
        stopScanning();
        throw new Error('Barcode-Scanning wird auf diesem Gerät nicht unterstützt');
      }
    } catch (err) {
      stopScanning();
      setError(err instanceof Error ? err.message : 'Fehler beim Zugriff auf die Kamera');
    }
  }, [onBarcodeDetected]);

  // Function to stop scanning
  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    
    setIsScanning(false);
  }, []);

  return { startScanning, stopScanning, isScanning, error };
}
