import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function ConfidentialitePage() {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Politique de Confidentialité</h1>
          <p className="text-gray-500 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <div className="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Collecte des Données</h2>
              <p>
                Dans le cadre de l'utilisation de StockFlow AF, nous sommes amenés à collecter des données personnelles et professionnelles :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Données d'identification (Nom, Email, Numéro de téléphone)</li>
                <li>Données de l'entreprise (Nom, Adresse, Informations de contact)</li>
                <li>Données d'utilisation et de connexion (Adresse IP, logs de connexion)</li>
                <li>Données métier (Produits, Mouvements de stock, Catégories)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Utilisation des Données</h2>
              <p>
                Les données collectées sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Fournir, gérer et améliorer notre service SaaS</li>
                <li>Assurer la sécurité de vos comptes et de vos données (authentification, détection d'activités suspectes)</li>
                <li>Vous contacter concernant votre abonnement, une assistance technique ou des mises à jour importantes</li>
                <li>Produire des statistiques anonymisées pour améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Sécurité et Hébergement</h2>
              <p>
                La sécurité de vos données est notre priorité. StockFlow AF utilise une infrastructure cloud sécurisée (Supabase/AWS) avec chiffrement en transit (HTTPS/TLS) et au repos. L'accès à vos données est strictement cloisonné : une entreprise ne peut en aucun cas accéder aux données d'une autre entreprise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Partage des Données</h2>
              <p>
                Nous ne vendons, ni ne louons vos données personnelles ou métier à des tiers. Vos données peuvent être partagées uniquement avec nos sous-traitants techniques (hébergement, passerelles de paiement comme Flutterwave, services d'envoi d'emails transactionnels) dans le strict cadre de la fourniture du service, avec des obligations de confidentialité strictes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Vos Droits</h2>
              <p>
                Conformément aux lois sur la protection des données applicables, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez exercer ces droits directement depuis les paramètres de votre compte ou en contactant notre support technique.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Cookies</h2>
              <p>
                Nous utilisons uniquement les cookies nécessaires au bon fonctionnement de l'application (maintien de la session utilisateur sécurisée). Nous n'utilisons pas de cookies de traçage publicitaire intrusifs sur l'espace d'administration.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">7. Contact</h2>
              <p>
                Pour toute question relative à la protection de vos données, veuillez nous contacter via notre service de support dédié à la confidentialité.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
