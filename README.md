<div align="center">

# 📞 Ansolari — Garages

**Une démonstration interactive de l’accueil téléphonique pour les garages automobiles.**

Page de présentation en français pour découvrir Ansolari, parcourir une simulation de prise de rendez-vous et préparer une demande de démonstration.

![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Tests-Playwright-2EAD33)
![Statut](https://img.shields.io/badge/Statut-Démonstration_privée-orange)

[Présentation](#-présentation) · [Fonctionnalités](#-fonctionnalités) · [Démarrer](#démarrer) · [Hébergement](#hébergement)

</div>

---

## 🎯 Présentation

Ce dépôt contient la **landing page Ansolari destinée aux garages automobiles**. Elle présente le parcours envisagé pour un assistant téléphonique : accueil du client, qualification de la demande, proposition d’un créneau et récapitulatif.

Il s’agit d’une démonstration frontend indépendante. Ce dépôt ne contient pas le backend vocal Ansolari et ne se connecte ni à Twilio, ni à OpenAI, ni à un agenda réel.

Astro génère le HTML statique ; deux composants React apportent les interactions de la simulation et du formulaire. Le contenu et l’identité visuelle de la version initiale ont été conservés lors de la migration vers cette architecture.

## ✨ Fonctionnalités

### Présentation du service

- Accroche et aperçu illustré d’un appel traité par Ansolari.
- Navigation vers la démonstration et la section contact.
- Mise en page adaptée aux écrans mobiles et aux ordinateurs.
- Contenu statique lisible même lorsque JavaScript est désactivé.

Les indications commerciales affichées, comme « 24/7 » et « < 2 s », présentent la proposition de service ; elles ne constituent pas des performances mesurées par cette application.

### Simulation d’appel

- Démarrage d’une conversation scénarisée avec un garage fictif.
- Trois motifs proposés : révision annuelle, contrôle technique et diagnostic de panne.
- Choix parmi quatre créneaux prédéfinis.
- Conversation textuelle progressive, chronomètre et indicateur d’étapes.
- Résumé du motif, du véhicule fictif et du rendez-vous sélectionné.
- Redémarrage de la simulation avec annulation des transitions en attente.

> Aucun appel, message ou rendez-vous réel n’est créé. Les répliques, le véhicule et les créneaux sont des données de démonstration définies dans le code.

### Formulaire de démonstration

- Saisie du garage, du prénom et de l’email professionnel.
- Sélection du besoin principal avec Radix UI Select.
- Validation des champs requis et indication des erreurs.
- Confirmation locale « Votre demande est prête ».

Le formulaire n’envoie et ne stocke aucune donnée. Son bouton reste désactivé tant que React n’est pas chargé, pour éviter une soumission HTML involontaire.

## 🛠️ Stack technique

| Usage | Technologies |
| --- | --- |
| Génération du site | Astro 7, sortie statique |
| Interactions | React 19, TypeScript 6 |
| Sélecteur du formulaire | Radix UI Select |
| Identité visuelle | CSS personnalisé, logos SVG |
| Vérification des sources | Astro Check et TypeScript |
| Tests navigateur | Playwright, profils ordinateur et mobile sous Chromium |

## Démarrer

Node.js **22.19 ou supérieur** requis (la version 22 est indiquée dans `.nvmrc`). Avec nvm installé :

```sh
nvm install
nvm use
npm ci
npm run dev
```

Ouvrir l’adresse affichée dans le terminal, normalement http://localhost:4321. Le projet doit être lancé avec Astro et non en ouvrant un fichier HTML directement ou avec Live Server.

## Commandes

```sh
npm run check       # Vérification Astro et TypeScript
npm run build       # Vérification puis génération de dist/
npm run preview     # Aperçu du build généré
npx playwright install chromium
npm run test:e2e    # Parcours sur ordinateur et mobile (build requis)
```

## Modifier la page

- `src/pages/index.astro` : composition de la landing page.
- `src/layouts/Layout.astro` : document HTML, langue et métadonnées SEO.
- `src/components/` : en-tête, hero, démonstration, contact et pied de page.
- `src/components/CallDemo.tsx` : simulation, choix, chronomètre et résumé. Les transitions en attente sont annulées au redémarrage.
- `src/components/ContactForm.tsx` : formulaire privé et validation native accessible.
- `src/styles/global.css` : styles, animations et adaptation aux écrans mobiles.
- `tests/landing.spec.ts` : tests des parcours, des redémarrages et du formulaire.

## Hébergement

Exécuter `npm ci` puis `npm run build` avec Node 22.19+ et publier **`dist/`** sur un hébergement statique. Aucun serveur Node n’est nécessaire pour servir le résultat.

`dist/` est généré et ignoré pour les nouveaux fichiers ; ne pas le modifier à la main. Les anciens `index.html`, `script.js` et `styles.css` à la racine ont été remplacés par les sources dans `src/`.

## Fonctionnement privé

La simulation n’effectue aucun appel réel et ne crée aucun rendez-vous. Le formulaire prépare seulement un état de confirmation local : aucune requête, aucun stockage et aucune réservation réelle. Le bouton du formulaire reste désactivé tant que React n’est pas chargé pour éviter un envoi HTML involontaire. Un service de réservation devra être connecté avant ouverture publique.


## 🗂️ Structure du dépôt

```text
ansolari-garages-private/
├── public/
│   ├── images/                 # Logos SVG
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Hero.astro          # Présentation et aperçu illustré
│   │   ├── Demo.astro          # Section de démonstration
│   │   ├── CallDemo.tsx        # Conversation scénarisée interactive
│   │   ├── Contact.astro       # Section contact
│   │   ├── ContactForm.tsx     # Formulaire local
│   │   ├── SiteHeader.astro
│   │   └── SiteFooter.astro
│   ├── layouts/Layout.astro    # Document HTML et métadonnées
│   ├── pages/index.astro       # Composition de la page
│   └── styles/global.css       # Styles et responsive
├── tests/landing.spec.ts       # Parcours navigateur
├── astro.config.mjs
├── playwright.config.ts
└── package.json
```

## 🧪 Périmètre des tests

La suite Playwright vérifie le parcours complet de la simulation, le chronomètre, les redémarrages pendant les transitions, la validation du formulaire et l’absence de requête lors de sa soumission. Elle contrôle également la lisibilité sans JavaScript et l’absence de débordement horizontal dans le parcours testé.

Pour exécuter la suite à partir d’un build à jour :

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright démarre le serveur de prévisualisation sur `http://127.0.0.1:4321`. Ces tests valident la démonstration locale, pas un service téléphonique ou un parcours de réservation externe.

## 🚧 Avant une ouverture publique

Le parcours de demande doit être relié à un service réel avant de pouvoir recevoir des demandes de démonstration. La simulation pourra rester illustrative, avec son avertissement visible.

Le mot « private » dans le nom du dépôt ne protège pas un site publié : aucun mécanisme d’authentification n’est implémenté dans cette page. Pour limiter l’accès à une prévisualisation, la protection doit être configurée sur l’hébergement.

---

<div align="center">

**Ansolari** · Découvrir le parcours d’un appel, du premier échange au récapitulatif.

</div>
