import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category_id: z.string().min(1, "La catégorie est requise"),
  price: z.number().min(0, "Le prix de vente ne peut pas être négatif"),
  purchase_price: z.number().min(0, "Le prix d'achat ne peut pas être négatif"),
  stock_actuel: z.number().min(0, "Le stock actuel ne peut pas être négatif"),
  stock_min: z.number().min(0, "Le stock minimum ne peut pas être négatif"),
  sku: z.string().min(3, "Le SKU doit contenir au moins 3 caractères"),
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category_id: z.string().min(1, "La catégorie est requise").optional(),
  price: z.number().min(0, "Le prix de vente ne peut pas être négatif").optional(),
  purchase_price: z.number().min(0, "Le prix d'achat ne peut pas être négatif").optional(),
  sku: z.string().min(3, "Le SKU doit contenir au moins 3 caractères"),
});
