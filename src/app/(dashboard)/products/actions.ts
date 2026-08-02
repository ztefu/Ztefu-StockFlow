'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { ProductSchema, ProductUpdateSchema } from '@/lib/validations'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const purchase_price = parseFloat(formData.get('cost_price') as string)
  const stock_actuel = parseInt(formData.get('stock_actuel') as string, 10)
  const stock_min = parseInt(formData.get('stock_min') as string, 10)
  const sku = formData.get('sku') as string
  const image = formData.get('image') as File | null

  const validationResult = ProductSchema.safeParse({
    name,
    category_id,
    price: isNaN(price) ? 0 : price,
    purchase_price: isNaN(purchase_price) ? 0 : purchase_price,
    stock_actuel: isNaN(stock_actuel) ? 0 : stock_actuel,
    stock_min: isNaN(stock_min) ? 0 : stock_min,
    sku
  });

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const supabase = await createClient()

  // Get current user and their company_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: "Non authentifié" }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      company_id,
      companies (
        subscription_plan
      )
    `)
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  // Vérification des quotas
  const companyInfo = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies;
  const plan = companyInfo?.subscription_plan || 'Gratuit';

  if (plan === 'Gratuit' || plan === 'Pro') {
    const limit = plan === 'Gratuit' ? 50 : 2000;
    
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id);
      
    if (count !== null && count >= limit) {
      return { error: `Limite atteinte. Le plan ${plan} vous permet de gérer jusqu'à ${limit} produits. Veuillez mettre à niveau votre abonnement.` }
    }
  }

  let image_url = null

  // Handle image upload if a file was provided
  if (image && image.size > 0) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      return { error: "Type de fichier invalide. Seuls JPEG, PNG et WEBP sont autorisés." };
    }

    const fileExt = image.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, image)

    if (uploadError) {
      console.error("Erreur d'upload:", uploadError)
      return { error: "Erreur lors du téléchargement de l'image." }
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
      
    image_url = data.publicUrl
  }

  const finalStockActuel = isNaN(stock_actuel) ? 0 : stock_actuel;

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert([{ 
      name, 
      category_id, 
      company_id: profile.company_id,
      price: isNaN(price) ? 0 : price, 
      purchase_price: isNaN(purchase_price) ? 0 : purchase_price,
      stock_actuel: 0, // Set to 0, the stock movement trigger will add the initial quantity
      stock_min: isNaN(stock_min) ? 0 : stock_min, 
      sku,
      image_url
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message }
  }

  // If initial stock is greater than 0, create a stock movement
  if (finalStockActuel > 0 && newProduct) {
    await supabase.from('stock_movements').insert([{
      product_id: newProduct.id,
      user_id: userData.user.id,
      type: 'in',
      quantity: finalStockActuel,
      date: new Date().toISOString().split('T')[0],
      observation: 'Stock initial',
      status: 'completed',
      company_id: profile.company_id
    }]);
  }

  revalidatePath('/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const purchase_price = parseFloat(formData.get('cost_price') as string)
  const sku = formData.get('sku') as string

  const validationResult = ProductUpdateSchema.safeParse({
    name,
    category_id,
    price: isNaN(price) ? undefined : price,
    purchase_price: isNaN(purchase_price) ? undefined : purchase_price,
    sku
  });

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const supabase = await createClient()

  // Verify auth and get company_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: "Non authentifié" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  const updateData: any = { 
    name, 
    sku 
  }
  
  if (category_id) updateData.category_id = category_id
  if (!isNaN(price)) updateData.price = price
  if (!isNaN(purchase_price)) updateData.purchase_price = purchase_price

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', profile.company_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  // Verify auth and get company_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: "Non authentifié" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('company_id', profile.company_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}

export async function importProductsCSV(productsData: any[]) {
  const supabase = await createClient()

  // Verify auth and get company_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: "Non authentifié" }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      company_id,
      companies (
        subscription_plan
      )
    `)
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  // Vérification des quotas
  const companyInfo = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies;
  const plan = companyInfo?.subscription_plan || 'Gratuit';

  // L'import CSV n'est pas dispo sur Gratuit
  if (plan === 'Gratuit') {
    return { error: "L'import CSV n'est pas disponible sur le plan Gratuit. Passez à la version Pro !" }
  }

  if (plan === 'Pro') {
    const limit = 2000;
    
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id);
      
    if (count !== null && count + productsData.length > limit) {
      return { error: `L'importation de ces ${productsData.length} produits dépassera votre limite de ${limit} produits (Actuellement: ${count}). Veuillez mettre à niveau votre abonnement.` }
    }
  }

  // Get all existing categories for this company to map by name
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('company_id', profile.company_id);

  const categoryMap = new Map((categories || []).map(c => [c.name.toLowerCase().trim(), c.id]));

  const productsToInsert = [];
  const errors = [];

  for (let i = 0; i < productsData.length; i++) {
    const row = productsData[i];
    const rowNum = i + 2; // +1 for 0-index, +1 for header

    const name = row['Nom'] || row['nom'] || row['Name'];
    const sku = row['SKU'] || row['sku'];
    const catName = row['Categorie'] || row['Catégorie'] || row['categorie'];

    if (!name || !sku) {
      errors.push(`Ligne ${rowNum}: Nom et SKU sont requis.`);
      continue;
    }

    let category_id = null;
    if (catName) {
      const catSearch = catName.toLowerCase().trim();
      if (categoryMap.has(catSearch)) {
        category_id = categoryMap.get(catSearch);
      } else {
        errors.push(`Ligne ${rowNum}: La catégorie "${catName}" n'existe pas.`);
        continue;
      }
    } else {
      errors.push(`Ligne ${rowNum}: La catégorie est requise.`);
      continue;
    }

    productsToInsert.push({
      company_id: profile.company_id,
      name: String(name),
      sku: String(sku),
      category_id,
      price: parseFloat(row['Prix Vente'] || 0) || 0,
      purchase_price: parseFloat(row['Prix Achat'] || 0) || 0,
      stock_actuel: 0, // Set to 0, trigger will add initial stock
      stock_min: parseInt(row['Stock Min'] || 0) || 0,
    });
  }

  if (productsToInsert.length === 0) {
    return { error: "Aucun produit valide à importer.", details: errors };
  }

  const { data: insertedProducts, error: insertError } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select();

  if (insertError) {
    console.error("Erreur d'import:", insertError);
    return { error: "Erreur lors de l'insertion dans la base de données." };
  }

  if (insertedProducts && insertedProducts.length > 0) {
    const movementsToInsert = insertedProducts
      .map((p: any, index: number) => {
        // We need the original requested stock from productsToInsert to create the movement
        const requestedStock = parseInt(productsData[index]['Stock Actuel'] || 0) || 0;
        if (requestedStock > 0) {
          return {
            product_id: p.id,
            user_id: userData.user.id,
            type: 'in',
            quantity: requestedStock,
            date: new Date().toISOString().split('T')[0],
            observation: 'Stock initial (Import CSV)',
            status: 'completed',
            company_id: profile.company_id
          };
        }
        return null;
      })
      .filter(Boolean);

    if (movementsToInsert.length > 0) {
      await supabase.from('stock_movements').insert(movementsToInsert as any[]);
    }
  }

  revalidatePath('/products');
  return { 
    success: true, 
    importedCount: productsToInsert.length,
    errorsCount: errors.length,
    errors 
  };
}
