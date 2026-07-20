import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-gray-800 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size="md" />
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 mt-12">
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-500 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <div className="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Présentation du Service</h2>
              <p>
                StockFlow AF est une solution Software as a Service (SaaS) conçue pour la gestion des stocks, la facturation et le suivi de l'inventaire pour les petites et moyennes entreprises (PME) opérant en Afrique. L'utilisation du service implique l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Accès au Service et Inscription</h2>
              <p>
                L'accès au service nécessite la création d'un compte utilisateur. Lors de l'inscription, vous vous engagez à fournir des informations exactes et à jour concernant votre entreprise. Vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Abonnements et Paiements</h2>
              <p>
                StockFlow AF propose différents plans tarifaires, incluant une version gratuite limitée (basée sur des quotas d'actions ou de produits) et des plans premium. Les paiements sont traités par nos partenaires sécurisés (ex: Flutterwave). En souscrivant à un plan payant, vous acceptez la facturation récurrente selon la période choisie (mensuelle ou annuelle).
              </p>
              <p>
                Les quotas du plan gratuit sont sujets à modification. En cas de dépassement de quota, l'accès à certaines fonctionnalités de création pourra être bloqué jusqu'à la mise à niveau vers un plan supérieur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Responsabilité des Données</h2>
              <p>
                Vous restez le propriétaire exclusif des données saisies dans StockFlow AF (produits, mouvements de stocks, informations clients). Nous nous engageons à mettre en œuvre des mesures de sécurité industrielles (chiffrement, sauvegardes) pour protéger ces données. Toutefois, StockFlow AF ne saurait être tenu responsable d'une perte de données résultant d'une erreur de l'utilisateur ou d'un cas de force majeure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Résiliation</h2>
              <p>
                Vous pouvez résilier votre compte et votre abonnement à tout moment depuis les paramètres de l'application. Aucun remboursement au prorata n'est effectué pour un mois ou une année entamée, sauf disposition légale contraire.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Modification des Conditions</h2>
              <p>
                Nous nous réservons le droit de modifier ces CGU à tout moment. Les utilisateurs seront informés de tout changement majeur par email ou via une notification dans l'application. La continuation de l'utilisation du service après modification vaut acceptation des nouvelles CGU.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">7. Contact</h2>
              <p>
                Pour toute question concernant ces conditions, veuillez nous contacter via le module de support intégré à l'application ou à l'adresse support prévue à cet effet.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
