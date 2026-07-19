"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ScannerClient({ products }: { products: any[] }) {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
        
        // Find product by SKU
        const product = products.find(p => p.sku === decodedText);
        if (product) {
          toast.success(`Produit trouvé : ${product.name}`);
          // On redirige vers les mouvements ou le produit
          router.push(`/products`);
        } else {
          toast.error(`Produit avec SKU ${decodedText} non trouvé.`);
        }
      },
      (errorMessage) => {
        // Ignore scan errors, they happen continuously until a QR is found
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [products, router]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scanner QR Code</h1>
        <p className="text-gray-500 mt-2">Scannez le QR Code (SKU) d'un produit pour l'identifier.</p>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div id="reader" className="w-full"></div>
        {scanResult && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
            <p className="text-sm text-gray-500">Dernier scan :</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{scanResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
