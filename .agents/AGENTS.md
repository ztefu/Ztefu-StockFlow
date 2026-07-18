# StockFlow Africa - Design System & UI Guidelines

Ce fichier définit les règles strictes d'interface utilisateur et de design system à appliquer pour TOUTES les nouvelles pages et composants de l'application StockFlow.

## 1. Philosophie Générale
- **Style Visuel** : Moderne, épuré, type "SaaS premium".
- **Langue** : L'interface doit être strictement en **Français**.
- **Mode Sombre** : Prise en charge obligatoire via les classes `dark:`. Toujours définir une couleur claire et son équivalent sombre.

## 2. Typographie & Couleurs
- **Titres Principaux (H1)** : `text-3xl font-bold text-gray-900 dark:text-white`
- **Titres de Cartes (H3)** : `text-lg font-bold text-gray-900 dark:text-white`
- **Textes Secondaires** : `text-sm text-gray-500`
- **Couleur Primaire (Action)** : Utiliser `bg-primary` pour les boutons principaux, `text-primary` pour les textes d'action.

## 3. Structure des Cartes (Cards)
Tout conteneur principal (liste, stats, tableau) doit utiliser cette structure exacte :
- `bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800`
- **Espacement interne** : Utiliser `p-6` de manière cohérente.

## 4. Animations & Interactions (Desktop & Mobile)
Le feedback visuel est crucial pour l'UX.
- **Cartes de données (Hover & Active state)** : Toujours ajouter ces classes sur les conteneurs principaux pour qu'ils réagissent au survol (PC) et au toucher (Mobile) :
  `hover:shadow-md hover:-translate-y-1 active:shadow-md active:-translate-y-1 transition-all duration-200`
- **Boutons "Action Secondaire" (ex: Voir tout)** : 
  `inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white active:bg-primary active:text-white rounded-lg transition-colors`
- **Boutons "Action Principale" (ex: Nouveau Mouvement)** :
  `px-4 py-2 bg-primary hover:bg-primary-dark active:scale-95 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-primary/30`

## 5. Responsivité & Mobile
L'application doit être parfaite sur mobile.
- **En-têtes de pages** : Doivent passer en colonne et se centrer sur mobile, et rester alignés à gauche/droite sur desktop :
  `flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-0`
  Avec le texte en `text-center md:text-left`.
- **Tableaux et Graphiques (Éviter l'écrasement)** : Ne laissez jamais un tableau s'écraser sur mobile.
  1. Conteneur parent : `overflow-x-auto`
  2. Élément enfant (table/chart) : `min-w-[700px]` (ou valeur appropriée) pour forcer le scroll horizontal plutôt que la compression du texte.
