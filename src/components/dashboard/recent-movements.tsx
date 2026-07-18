import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight } from "lucide-react";

interface RecentMovementsProps {
  movements: any[];
}

export function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md hover:-translate-y-1 active:shadow-md active:-translate-y-1 transition-all duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Derniers Mouvements</h3>
        <Link 
          href="/stock/movements"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white active:bg-primary active:text-white rounded-lg transition-colors whitespace-nowrap"
        >
          Voir tout
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Produit</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Quantité</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Utilisateur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {movement.product}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    movement.type === 'in' 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {movement.type === 'in' ? 'Entrée' : 'Sortie'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {movement.type === 'in' ? '+' : '-'}{movement.quantity} <span className="text-gray-500 font-normal">{movement.quantity > 1 ? `${movement.unit}s` : movement.unit}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(movement.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {movement.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
