export const kpiStats = {
  totalProducts: 124,
  totalStockValue: 12500000,
  lowStockItems: 8,
  outOfStockItems: 3,
  entriesToday: 450,
  exitsToday: 120,
};

export const recentMovements = [
  {
    id: "1",
    product: "Ciment Dangote 42.5R",
    type: "entry",
    quantity: 500,
    unit: "sacs",
    date: "15/07/2026",
    user: "Soke Bahtera Abr",
    status: "completed",
  },
  {
    id: "2",
    product: "Fer à béton 10mm",
    type: "exit",
    quantity: 150,
    unit: "barres",
    date: "15/07/2026",
    user: "Angelina Carol",
    status: "completed",
  },
  {
    id: "3",
    product: "Tôles Bac Alu 0.35mm",
    type: "exit",
    quantity: 50,
    unit: "feuilles",
    date: "14/07/2026",
    user: "Soke Bahtera Abr",
    status: "completed",
  },
  {
    id: "4",
    product: "Peinture Acrylique Blanc",
    type: "entry",
    quantity: 200,
    unit: "seaux",
    date: "14/07/2026",
    user: "Angelina Carol",
    status: "pending",
  },
  {
    id: "5",
    product: "Clous ordinaires 70mm",
    type: "exit",
    quantity: 25,
    unit: "kg",
    date: "13/07/2026",
    user: "Soke Bahtera Abr",
    status: "completed",
  },
];

export const lowStockProducts = [
  {
    id: "101",
    name: "Sable fin de construction",
    stock: 0,
    minStock: 10,
    unit: "tonnes",
    status: "out_of_stock",
  },
  {
    id: "102",
    name: "Ciment Bélier 32.5",
    stock: 12,
    minStock: 50,
    unit: "sacs",
    status: "low_stock",
  },
  {
    id: "103",
    name: "Fil de fer recuit",
    stock: 5,
    minStock: 20,
    unit: "kg",
    status: "low_stock",
  },
  {
    id: "104",
    name: "Brouette métallique",
    stock: 0,
    minStock: 5,
    unit: "pièces",
    status: "out_of_stock",
  },
  {
    id: "105",
    name: "Pointe en acier 50mm",
    stock: 8,
    minStock: 15,
    unit: "kg",
    status: "low_stock",
  },
];

export const stockChartData = [
  { name: "09 Jui", entries: 400, exits: 240 },
  { name: "10 Jui", entries: 300, exits: 139 },
  { name: "11 Jui", entries: 200, exits: 980 },
  { name: "12 Jui", entries: 278, exits: 390 },
  { name: "13 Jui", entries: 189, exits: 480 },
  { name: "14 Jui", entries: 239, exits: 380 },
  { name: "15 Jui", entries: 349, exits: 430 },
];

export const categories = [
  { id: "c1", name: "Matériaux de construction", description: "Ciment, fer, sable, etc.", productCount: 45 },
  { id: "c2", name: "Quincaillerie", description: "Clous, vis, boulons, outillages...", productCount: 120 },
  { id: "c3", name: "Peinture et Finitions", description: "Peintures, vernis, enduits", productCount: 30 },
  { id: "c4", name: "Outils et Équipements", description: "Gros outillage et équipement lourd", productCount: 15 },
  { id: "c5", name: "Plomberie", description: "Tuyaux, raccords, robinetterie", productCount: 50 },
];

export const products = [
  {
    id: "p1",
    name: "Ciment Dangote 42.5R",
    sku: "CIM-DANG-001",
    category: "Matériaux de construction",
    description: "Ciment gris polyvalent pour tous travaux de maçonnerie.",
    purchasePrice: 4200,
    sellPrice: 4800,
    stock: 250,
    minStock: 50,
    unit: "sacs",
    image: null,
    status: "in_stock"
  },
  {
    id: "p2",
    name: "Fer à béton 10mm",
    sku: "FER-10MM-002",
    category: "Matériaux de construction",
    description: "Fer à béton haute adhérence pour structures.",
    purchasePrice: 2100,
    sellPrice: 2500,
    stock: 120,
    minStock: 100,
    unit: "barres",
    image: null,
    status: "in_stock"
  },
  {
    id: "101",
    name: "Sable fin de construction",
    sku: "SAB-FIN-003",
    category: "Matériaux de construction",
    description: "Sable fin pour mortier et crépissage.",
    purchasePrice: 15000,
    sellPrice: 20000,
    stock: 0,
    minStock: 10,
    unit: "tonnes",
    image: null,
    status: "out_of_stock"
  },
  {
    id: "102",
    name: "Ciment Bélier 32.5",
    sku: "CIM-BEL-004",
    category: "Matériaux de construction",
    description: "Ciment pour travaux courants.",
    purchasePrice: 4000,
    sellPrice: 4500,
    stock: 12,
    minStock: 50,
    unit: "sacs",
    image: null,
    status: "low_stock"
  },
  {
    id: "p5",
    name: "Peinture Acrylique Blanc",
    sku: "PNT-ACR-BLC",
    category: "Peinture et Finitions",
    description: "Peinture acrylique blanche pour intérieur/extérieur.",
    purchasePrice: 12000,
    sellPrice: 15000,
    stock: 45,
    minStock: 20,
    unit: "seaux",
    image: null,
    status: "in_stock"
  }
];

export const allMovements = [
  ...recentMovements.map(m => ({
    ...m,
    fournisseur: m.type === "entry" ? "Cimenterie d'Afrique" : null,
    motif: m.type === "exit" ? "Vente" : null,
    observation: "Mouvement régulier"
  })),
  {
    id: "6",
    product: "Sable fin de construction",
    type: "exit",
    quantity: 15,
    unit: "tonnes",
    date: "12/07/2026",
    user: "Angelina Carol",
    status: "completed",
    fournisseur: null,
    motif: "Consommation interne",
    observation: "Utilisé pour le chantier 2"
  }
];

export const users = [
  { id: "u1", name: "Soke Bahtera Abr", email: "admin@stockflow.africa", phone: "+225 0102030405", role: "Administrateur", status: "Actif" },
  { id: "u2", name: "Angelina Carol", email: "manager@stockflow.africa", phone: "+225 0506070809", role: "Gestionnaire", status: "Actif" },
  { id: "u3", name: "Kouassi Jean", email: "magasin@stockflow.africa", phone: "+225 0708091011", role: "Magasinier", status: "Actif" },
  { id: "u4", name: "Touré Fatima", email: "vendeur@stockflow.africa", phone: "+225 0809101112", role: "Vendeur", status: "Inactif" },
];
