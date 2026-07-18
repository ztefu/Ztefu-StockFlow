# Projet StockFlow - Documentation & Contexte pour l'IA

Ce document résume le contexte complet, l'architecture, les fonctionnalités et les choix de design de l'application **StockFlow**. Son but est de fournir un contexte immédiat à toute future session ou modèle IA travaillant sur ce projet.

## 1. À Propos du Projet
- **Nom de l'application** : StockFlow
- **Type** : Application SaaS de gestion des stocks et de l'inventaire.
- **Objectif** : Fournir une interface premium, intuitive et réactive pour gérer les produits, les mouvements de stocks (entrées/sorties), les utilisateurs et analyser les données via des rapports et tableaux de bord.

## 2. Technologies Utilisées
- **Framework Principal** : Next.js (App Router) / React
- **Langage** : TypeScript (`.tsx`)
- **Style & UI** : 
  - Tailwind CSS (pour le style)
  - Lucide React (pour les icônes)
  - React Hot Toast (pour les notifications)
- **Graphiques** : Recharts
- **État et Données** : Actuellement gérés localement via `useState` avec des données simulées (`mock-data.ts`). Aucune base de données ni backend réel n'est encore implémenté.

## 3. Structure des Fichiers (Principaux)
Le projet suit la structure standard de Next.js App Router :
```
src/
├── app/
│   ├── (dashboard)/            # Toutes les pages nécessitant la barre latérale
│   │   ├── dashboard/page.tsx  # Tableau de bord principal (KPIs, graphiques)
│   │   ├── products/           # Catalogue produits (liste, nouveau produit)
│   │   ├── categories/         # Gestion des catégories
│   │   ├── stock/              # Mouvements de stock
│   │   │   ├── entries/        # Formulaire d'entrée de stock
│   │   │   ├── exits/          # Formulaire de sortie de stock
│   │   │   └── movements/      # Historique global (Grand livre)
│   │   ├── alerts/             # Alertes de stock faible
│   │   ├── reports/            # Rapports et analyses (graphiques)
│   │   ├── users/              # Administration des utilisateurs
│   │   ├── settings/           # Paramètres de l'application
│   │   ├── help/               # Aide et support
│   │   └── profile/            # Page de profil de l'utilisateur connecté
│   ├── layout.tsx              # Layout racine
│   └── globals.css             # Styles globaux (Tailwind)
├── components/
│   ├── layout/
│   │   └── sidebar.tsx         # Barre latérale de navigation (Menu, Dark mode, Profil)
│   └── ui/
│       └── date-picker.tsx     # Composant calendrier sur-mesure
└── lib/
    └── data/
        └── mock-data.ts        # Données simulées pour toute l'application
```

## 4. Fonctionnalités Implémentées
1. **Navigation & Layout** : Sidebar responsive (tiroir sur mobile, fixe sur desktop), sélecteur de mode sombre/clair, menu déroulant de profil utilisateur.
2. **Dashboard** : Vue d'ensemble avec KPIs (Total produits, Valeur du stock, Alertes) et graphiques.
3. **Produits** : Liste avec recherche/filtre, ajout, modification (via modale interactive), suppression, et affichage des détails complets.
4. **Catégories** : Liste, ajout, modification (modale) et suppression.
5. **Gestion des Stocks** : 
   - Enregistrement des entrées et sorties avec un calendrier personnalisé (`DatePicker`).
   - Historique complet consultable et filtrable.
6. **Analyses & Rapports** : Graphiques interactifs (Recharts) qui réagissent aux changements de période (ex: "Cette semaine", "Ce mois-ci").
7. **Alertes** : Suivi des ruptures de stock et stocks faibles avec possibilité de marquer les alertes comme résolues via une modale.
8. **Utilisateurs** : Liste de l'équipe, création de compte, modification des rôles (modale), désactivation/activation de compte.
9. **Profil** : Page dédiée pour gérer les informations personnelles du compte connecté.
10. **Responsivité** : L'interface utilise toute la largeur de l'écran (`w-full`) et tous les tableaux sont protégés contre l'écrasement sur mobile grâce à un scroll horizontal (`overflow-x-auto`).

## 5. Choix de Design & Esthétique (Règles strictes)
- **Style SaaS Premium** : Utilisation de cartes avec bords très arrondis (`rounded-2xl`), de bordures subtiles (`border-gray-100 / dark:border-gray-800`), et d'ombres douces (`shadow-sm`, `hover:shadow-md`).
- **Pleine Largeur** : L'application n'utilise plus de conteneurs restrictifs (`max-w-7xl mx-auto`). Le contenu s'étend toujours sur `w-full`.
- **Mode Sombre** : Prise en charge native via les classes Tailwind `dark:`. Les arrière-plans en mode sombre utilisent souvent des couleurs de surface spécifiques (ex: `dark:bg-dark-surface`).
- **Composants Personnalisés** : Privilégier la création de composants personnalisés (ex: `DatePicker`) plutôt que les inputs natifs des navigateurs pour garantir un rendu parfait sur iOS, Android, et Desktop.
- **Modales pour les actions** : Les actions secondaires comme l'édition d'une ligne ou l'affichage de détails utilisent des fenêtres superposées (modales) avec un fond assombri (`backdrop-blur-sm`).

## 6. Instructions pour les Modèles IA Futurs
- **Lisez ce fichier** en premier pour comprendre l'état actuel de l'application avant de suggérer des modifications.
- **Règles de Code** : Utilisez React Hooks (`useState`, `useEffect`). Ne cassez jamais le responsive design. Tous les tableaux doivent être enveloppés dans un div `overflow-x-auto`.
- **Données** : Si vous ajoutez une fonctionnalité, utilisez d'abord des données simulées dans `mock-data.ts`.
- **Esthétique** : Appliquez les mêmes classes Tailwind (ex: `bg-white dark:bg-dark-surface rounded-2xl p-6 border...`) pour maintenir l'harmonie visuelle. Ne faites **jamais** de designs basiques.
- **Langue** : Toute l'interface et le texte destiné à l'utilisateur doivent être en français.
