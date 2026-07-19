"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, StopCircle } from "lucide-react";

export default function ScannerClient({ products }: { products: any[] }) {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanResult(decodedText);
          stopScanner(); // Stop after successful scan
          
          const product = products.find(p => p.sku === decodedText);
          if (product) {
            toast.success(`Produit trouvé : ${product.name}`);
            router.push(`/products`);
          } else {
            toast.error(`Produit avec SKU ${decodedText} non trouvé.`);
          }
        },
        (errorMessage) => {
          // Ignore frequent scan errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner", err);
      toast.error("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scanner QR Code</h1>
        <p className="text-gray-500 mt-2">Scannez le QR Code (SKU) d'un produit pour l'identifier.</p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-6">
          {!isScanning ? (
            <button 
              onClick={startScanner}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all shadow-sm shadow-primary/30 active:scale-95"
            >
              <Camera className="w-5 h-5" />
              Démarrer le scanner
            </button>
          ) : (
            <button 
              onClick={stopScanner}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-sm shadow-red-500/30 active:scale-95"
            >
              <StopCircle className="w-5 h-5" />
              Arrêter le scanner
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl bg-black/5 relative">
          <div id="reader" className="w-full min-h-[300px] flex items-center justify-center">
            {!isScanning && (
              <div className="text-gray-400 flex flex-col items-center gap-3">
                <Camera className="w-10 h-10 opacity-50" />
                <p className="text-sm font-medium">Caméra désactivée</p>
              </div>
            )}
          </div>
        </div>
        
        {scanResult && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-center">
            <p className="text-sm text-gray-500 mb-1">Dernier scan :</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{scanResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
