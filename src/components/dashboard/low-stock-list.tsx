interface LowStockListProps {
  products: any[];
}

export function LowStockList({ products }: LowStockListProps) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md hover:-translate-y-1 active:shadow-md active:-translate-y-1 transition-all duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alertes de Stock</h3>
      </div>
      <div className="p-4">
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {product.status === "out_of_stock" ? (
                    <span className="flex w-3 h-3 bg-danger rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
                  ) : (
                    <span className="flex w-3 h-3 bg-warning rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Min: {product.minStock} {product.minStock > 1 ? `${product.unit}s` : product.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${product.status === "out_of_stock" ? "text-danger" : "text-warning"}`}>
                  {product.stock} <span className="text-xs font-normal opacity-80">{product.stock > 1 ? `${product.unit}s` : product.unit}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {product.status === "out_of_stock" ? "Rupture" : "Stock faible"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
