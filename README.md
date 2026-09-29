# Ansolari — landing page garages

Landing page française migrée vers Astro 7, React 19 et TypeScript. Le contenu et l’identité visuelle de la version initiale sont conservés. Astro génère le HTML statique ; les deux composants React gèrent la simulation d’appel et le formulaire.

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

Exécuter `npm ci` puis `npm run build` avec Node 22.19+ et publier **`dist/`** sur un hébergement statique. La configuration existante `.openai/hosting.json` pointe déjà vers ce dossier. Aucun serveur Node n’est nécessaire pour servir le résultat.

`dist/` est généré et ignoré pour les nouveaux fichiers ; ne pas le modifier à la main. Les anciens `index.html`, `script.js` et `styles.css` à la racine ont été remplacés par les sources dans `src/`.

## Fonctionnement privé

La simulation n’effectue aucun appel réel et ne crée aucun rendez-vous. Le formulaire prépare seulement un état de confirmation local : aucune requête, aucun stockage et aucune réservation réelle. Le bouton du formulaire reste désactivé tant que React n’est pas chargé pour éviter un envoi HTML involontaire. Un service de réservation devra être connecté avant ouverture publique.
