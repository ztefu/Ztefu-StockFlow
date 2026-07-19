"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, QrCode, X } from "lucide-react";
import toast from "react-hot-toast";
import { createProduct } from "../actions";
import { QRCodeSVG } from "qrcode.react";

interface Category {
  id: string;
  name: string;
}

export default function NewProductClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sku, setSku] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createProduct(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Produit ajouté avec succès !");
        router.push("/products");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Link href="/products" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nouveau Produit</h1>
          </div>
        </div>
        <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto">
          <Link 
            href="/products"
            className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </Link>
          <button 
            form="new-product-form"
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <form id="new-product-form" className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={handleSave}>
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Informations Générales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du produit *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: Ciment Dangote 42.5R"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Référence (SKU) *</label>
                  <input 
                    type="text" 
                    name="sku"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ex: CIM-DANG-001"
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie *</label>
                  <select name="category_id" required className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none">
                    <option value="">Sélectionner...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  name="description"
                  rows={4}
                  placeholder="Détails du produit..."
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tarification & Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix d'achat (FCFA) *</label>
                <input 
                  type="number"
                  step="0.01"
                  name="cost_price"
                  placeholder="0"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix de vente (FCFA) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  name="price"
                  placeholder="0"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock initial *</label>
                <input 
                  type="number" 
                  name="stock_actuel"
                  required
                  placeholder="0"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock minimum *</label>
                <input 
                  type="number" 
                  name="stock_min"
                  required
                  placeholder="10"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unité *</label>
                <select name="unit" className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none">
                  <option value="pièce">Pièce</option>
                  <option value="carton">Carton</option>
                  <option value="sacs">Sacs</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="kg">Kg</option>
                  <option value="litres">Litres</option>
                  <option value="m2">m²</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Latérale */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Média</h3>
            
            <input 
              type="file" 
              name="image"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group">
                <img src={imagePreview} alt="Aperçu" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-2 bg-white text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Cliquez pour uploader</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP jusqu'à 5MB</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">QR Code</h3>
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              {sku ? (
                <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
                  <QRCodeSVG value={sku} size={120} level="M" />
                </div>
              ) : (
                <QrCode className="w-32 h-32 text-gray-300 dark:text-gray-600 mb-4" />
              )}
              <p className="text-sm text-center text-gray-500">
                {sku ? "Ce QR Code contient le SKU." : "Saisissez un SKU pour générer le QR Code."}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
