# Document de Transfert Technique (Developer Hand-off) - Application LYLOO

## 1. Vue d'Ensemble du Projet
**LYLOO** est une application holistique de bien-être (Mental et Physique) développée sous forme de Single Page Application (SPA). Elle propose des activités (méditation, respiration, séances de sport, recettes), un suivi d'humeur, une boutique, et une partie communautaire.

L'application est à l'état de **Prototype Avancé / MVP**. Toute la logique UI/UX est implémentée, mais la persistance des données repose actuellement sur un service fictif (Mock) en mémoire locale.

---

## 2. Stack Technique
* **Frontend Framework** : React (v19)
* **Routing** : React Router DOM (v7) - Utilisation de `HashRouter` (optimisé pour les environnements statiques/iframes).
* **Build Tool** : Vite (v6)
* **Langage** : TypeScript (v5.x)
* **Styling** : Tailwind CSS (intégré avec des classes utilitaires et des variables CSS personnalisées).
* **Icônes** : `lucide-react`
* **Graphiques / Data Viz** : `recharts` (utilisé dans la page "Suivi" pour les bilans rythmiques).
* **Manipulation de Dates** : `date-fns`
* **Animations** : Transitions natives de Tailwind (`animate-in`, `fade-in`, `slide-in`), et `react-dom-confetti` pour les micro-interactions d'accomplissement.
* **IA Générative** : `@google/genai` (Intégrée dans la section /admin pour la génération automatique d'images depuis des descriptions).

---

## 3. Architecture et Structure des Fichiers
Le projet suit une architecture classique et modulaire pour React :

```text
/
├── components/          # Composants réutilisables
│   ├── ui/              # Primitives UI (Boutons, Inputs, Cartes, WaveHeader, Icônes SVG)
│   ├── ActivityDetail.tsx # Modal détaillée d'une activité 
│   ├── Layout.tsx       # Wrapper global (Navigation Bar, etc.)
│   └── Navigation.tsx   # Barre de navigation mobile/desktop
├── context/
│   └── AuthContext.tsx  # Gestion d'état global de l'authentification (actuellement mockée)
├── pages/               # Vues correspondant à chaque route
│   ├── Home.tsx         # Tableau de bord principal
│   ├── MentalWellness.tsx # Liste filtrable d'activités mentales
│   ├── PhysicalWellness.tsx # Liste filtrable d'activités physiques/recettes
│   ├── Community.tsx    # Flux de posts et challenges communautaires
│   ├── Suivi.tsx        # Historique, suivi d'humeur et graphiques Recharts
│   ├── Shop.tsx         # Boutique de produits bien-être
│   ├── Profile.tsx      # Paramètres utilisateur
│   ├── Admin.tsx        # Panel de gestion du contenu (CRUD activités/produits + IA)
│   ├── Auth.tsx         # Page de connexion
│   └── Onboarding.tsx   # Tunnel de setup initial du profil
├── services/
│   └── mockService.ts   # Cœur de la donnée actuelle. Simule un backend avec des tableaux en mémoire.
├── types.ts             # Définitions TypeScript globales des modèles de données
├── App.tsx              # Point d'entrée de l'application (Fournisseurs de contexte + Routeur)
├── index.tsx            # Point d'entrée React (montage sur le DOM)
└── vite.config.ts       # Configuration Vite
```

---

## 4. Modèles de Données Principaux (`types.ts`)
| Type | Description |
| :--- | :--- |
| **`UserProfile`** | Profil utilisateur (`email`, `objectifs`, préférences de `notifications`, `theme`, `role: 'user' \| 'admin'`). |
| **`Activity`** | Activité de bien-être. Contient le `type` (mental/physique), `categorie` (Yoga, Recettes...), la `dureeMinutes`, des `tags`, et éventuellement une `contentUrl` (lien YouTube). Pour les recettes, des champs `ingredients` et `instructions` s'ajoutent. |
| **`Session`** | Historique d'une activité complétée par un utilisateur, incluant l'humeur avant/après (`moodBefore/moodAfter`). |
| **`CommunityPost` / `Challenge`** | Éléments de la section communautaire gérant les réactions sociales (likes imbriqués, nombre de participants). |
| **`Product`** | Élément affiché dans la boutique (`Shop.tsx`). |

---

## 5. Gestion de la Donnée (Service Layer)
Actuellement, **aucune base de données distante** (Firebase, Supabase, PostgreSQL) n'est connectée. 
Toutes les interactions asynchrones de lecture/écriture, ainsi que les données statiques se font au travers de `services/mockService.ts`.

* L'objet `MockService` expose des méthodes asynchrones (ex: `getActivities()`, `saveActivity()`, `reactToPost()`).
* Les données sont stockées dans des tableaux variables (`export let MOCK_ACTIVITIES`, etc.). Ce qui signifie que toute création ou modification effectuée en jeu (comme depuis le panel `/admin`) est persistante le temps de la session du navigateur, mais **perdure à chaque rafraîchissement manuel de la page complète**.

---

## 6. Routage (React Router v7)
L'application repose sur un `<HashRouter>`. Les routes sont sécurisées via un composant `<ProtectedRoute>` (défini dans `App.tsx`) qui vérifie l'état d'authentification lu depuis le `AuthContext`. 
* Redirection automatique vers `/auth` si non connecté.
* Redirection interne prévue vers `/onboarding` pour les nouveaux utilisateurs.

---

## 7. Design System et UI
Le design system complet se concentre sur des tons terreux et apaisants.
Les couleurs primaires sont directement paramétrées ou appelées via Tailwind CSS.

### Couleurs Custom (Thème Lyloo) :
* `lyloo-beige` (Fond principal)
* `lyloo-anthracite` (Texte principal contrasté)
* `lyloo-vertEau`, `lyloo-vertPale` (Accents nature, boutons secondaires)
* `lyloo-orange`, `lyloo-terracotta` (Accents énergiques : recettes, sport intensif)

### Composants Mutualisés (`components/ui/LayoutComponents.tsx`) :
Ce fichier contient la majorité des primitives UI pour éviter la redondance Tailwind :
* `Button`, `Card`, `Input`, `Badge`, `Skeleton`, `Tooltip`.
* `WellnessCardImage` : Un wrapper d'image avec gestion de fallback si le lien d'image (`src`) est "cassé" ou vide, affichant un placeholder de marque.
* `WaveHeader` : L'en-tête responsive avec un SVG d'arrière-plan en forme de vague asymétrique, qui se réduit au scroll. Inclut la logique de barre de recherche, cloche de notifications et redirection de profil.

---

## 8. Intégrations Tierces 
### L'API YouTube
Dans `services/mockService.ts`, de nouvelles activités chargent des vidéos YouTube via la logique `contentUrl: 'https://www.youtube.com/watch?v=...'`. Le composant modal `ActivityDetail.tsx` lit cette URL pour diriger l'utilisateur vers la vidéo standard de YouTube, évitant ainsi les erreurs Iframe (Erreur 153 liées au bridage restrictif de certains diffuseurs YouTube).

### Génération IA de Visuels (Gemini)
Dans `pages/Admin.tsx`, une fonctionnalité permet à un utilisateur Admin de générer des bannières/images pour les nouvelles activités via Google Gemini (`@google/genai` modèle de génération d'image `gemini-2.5-flash-image`).
* **Note au développeur suivant** : Le rendu fait appel à `process.env.API_KEY`. Dans le cadre d'un export local via Vite, vous devrez ajuster ceci en `import.meta.env.VITE_GEMINI_API_KEY` ou relier cela à une Route Backend (Node/Express).

---

## 9. Next Steps pour le Prochain Développeur
Pour amener ce projet en production (Phase de Backend Implementation) :

1.  **Remplacer `AuthContext`** : Connecter à Firebase Auth, Auth0, ou Supabase Auth.
2.  **Remplacer `MockService` par une API Réelle** : 
    *   Mettre en place une base (ex: Firestore, PostgreSQL).
    *   Créer les schémas correspondants à `types.ts`.
    *   Réécrire le contenu de `services/mockService.ts` pour qu'il effectue de véritables appels `fetch()` ou SDK.
3.  **Hébergement des Imagerie** : Fournir un Bucket S3 (ou Firebase Storage) pour les téléchargements de photos et stocker des URLs pérennes, au lieu des URLs générées en base64 via Gemini, ou des URLs unsplash.
4.  **Optimisation SEO/SSR (Optionnelle)** : Si l'aspect public devient requis, envisager une migration de Vite SPA vers un framework comme Next.js ou Remix, bien que le build statique actuel de Vite soit très robuste pour une WebApp PWA/fermée.
5.  **Variables d'Environnement** : Gérer `.env.local` pour y sécuriser les futures clés d'API réseau.
6.  **Sécurité** : L'accès Admin est actuellement géré côté Front-End dans `Admin.tsx` (`if (user.role !== 'admin')`). Un backend devra sécuriser l'accès en écriture (RBAC) réel.
