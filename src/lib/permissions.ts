// Map of roles to allowed paths
export const rolePermissions = {
  Administrateur: ["*"], // Super user, has access to everything
  Gestionnaire: [
    "/dashboard",
    "/products",
    "/categories",
    "/stock/entries",
    "/stock/exits",
    "/stock/movements",
    "/alerts",
    "/reports",
    "/profile",
    "/help", // Help page is accessible to everyone usually
  ],
  Magasinier: [
    "/dashboard",
    "/products",
    "/categories",
    "/stock/entries",
    "/stock/exits",
    "/stock/movements",
    "/alerts",
    "/profile",
    "/help",
  ],
  Vendeur: [
    "/dashboard",
    "/products",
    "/stock/exits",
    "/profile",
    "/help",
  ]
};

export type Role = keyof typeof rolePermissions;

export function hasPermission(role: string, pathname: string): boolean {
  if (!role || !(role in rolePermissions)) return false;

  const allowedPaths = rolePermissions[role as Role];

  // Administrateur has access to everything
  if (allowedPaths.includes("*")) return true;

  // Exact match or subpath match (e.g., /products/new is covered by /products)
  return allowedPaths.some(allowedPath => 
    pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)
  );
}
