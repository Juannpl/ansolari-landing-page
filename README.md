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
- Envoi via EmailJS, avec confirmation, état de chargement et possibilité de réessayer en cas d’erreur.

Les demandes sont transmises à EmailJS. Son bouton reste désactivé tant que React n’est pas chargé.

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
- `src/components/ContactForm.tsx` : formulaire EmailJS et validation accessible.
- `src/styles/global.css` : styles, animations et adaptation aux écrans mobiles.
- `tests/landing.spec.ts` : tests des parcours, des redémarrages et du formulaire.

## Hébergement

Exécuter `npm ci` puis `npm run build` avec Node 22.19+ et publier **`dist/`** sur un hébergement statique. Aucun serveur Node n’est nécessaire pour servir le résultat.

`dist/` est généré et ignoré pour les nouveaux fichiers ; ne pas le modifier à la main. Les anciens `index.html`, `script.js` et `styles.css` à la racine ont été remplacés par les sources dans `src/`.

## Fonctionnement privé

La simulation n’effectue aucun appel réel et ne crée aucun rendez-vous. Le formulaire transmet les demandes à EmailJS, sans réserver automatiquement de créneau. Le bouton du formulaire reste désactivé tant que React n’est pas chargé pour éviter un envoi HTML involontaire. Le service et le modèle d’e-mail doivent être configurés dans EmailJS.


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
│   │   ├── ContactForm.tsx     # Formulaire EmailJS
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

La suite Playwright vérifie le parcours complet de la simulation, le chronomètre, les redémarrages pendant les transitions, la validation du formulaire et le contenu des requêtes EmailJS et la reprise après un échec (réponses simulées). Elle contrôle également la lisibilité sans JavaScript et l’absence de débordement horizontal dans le parcours testé.

Pour exécuter la suite à partir d’un build à jour :

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright démarre le serveur de prévisualisation sur `http://127.0.0.1:4321`. Ces tests valident la démonstration locale, pas un service téléphonique ou un parcours de réservation externe.

## 🚧 Avant une ouverture publique

Configurer EmailJS avant de recevoir les demandes de démonstration. La simulation pourra rester illustrative, avec son avertissement visible.

Le mot « private » dans le nom du dépôt ne protège pas un site publié : aucun mécanisme d’authentification n’est implémenté dans cette page. Pour limiter l’accès à une prévisualisation, la protection doit être configurée sur l’hébergement.

---

<div align="center">

**Ansolari** · Découvrir le parcours d’un appel, du premier échange au récapitulatif.

</div>

## Configuration EmailJS

Le formulaire utilise l’API EmailJS directement depuis le navigateur et fonctionne sur tout hébergement statique. Il ne dépend pas de Netlify et ne nécessite pas de serveur supplémentaire.

1. Connecter un service d’envoi dans **Email Services** sur EmailJS.
2. Créer un modèle dans **Email Templates**, avec **To Email** fixé à `contact@ansolari.fr`, **Reply To** à `{{email}}` et un objet tel que `Demande de démonstration — {{garage}}`.
3. Utiliser ces variables dans le contenu du modèle :

```text
Garage : {{garage}}
Prénom : {{name}}
E-mail : {{email}}
Besoin : {{need}}
```

4. Copier `.env.example` vers `.env` et renseigner le Service ID, le Template ID et la Public Key. Ces trois identifiants sont publics et intégrés au site. Ne jamais y placer de clé privée ou de mot de passe SMTP.
5. Renseigner les mêmes variables dans l’environnement de build de l’hébergeur, puis reconstruire et redéployer `dist/`. En local, redémarrer Astro après modification de `.env`.
6. Autoriser le domaine du site dans les réglages EmailJS, puis vérifier la réception d’une demande réelle à `contact@ansolari.fr`.

Sans configuration, le formulaire affiche une erreur et propose le contact par e-mail ; aucune requête n’est envoyée. Les tests navigateur simulent EmailJS et n’envoient pas de vrais e-mails. Pour les exécuter sans compte configuré, construire avec des identifiants fictifs :

```sh
PUBLIC_RECAPTCHA_SITE_KEY=test_captcha PUBLIC_EMAILJS_TEMPLATE_OTP_ID=test_otp PUBLIC_EMAILJS_SERVICE_ID=test_service PUBLIC_EMAILJS_TEMPLATE_ID=test_template PUBLIC_EMAILJS_PUBLIC_KEY=test_public npm run build
npm run test:e2e
```

Ne pas publier ce build de test : reconstruire avec les identifiants réels avant déploiement.

Documentation : https://www.emailjs.com/docs/rest-api/send/.

### Vérification de l’adresse e-mail

Créer un second modèle EmailJS et renseigner `PUBLIC_EMAILJS_TEMPLATE_OTP_ID` dans `.env` et dans l’environnement de build. Son destinataire doit être `{{to_email}}` (le visiteur), avec `{{otp_code}}` dans le contenu. `{{name}}` et `{{first_name}}` sont disponibles pour la salutation. Le modèle principal garde `contact@ansolari.fr` comme destinataire.

Le code à six chiffres expire après dix minutes et peut être renvoyé après 60 secondes. Modifier les coordonnées annule la vérification précédente. La demande est envoyée après saisie du bon code. Comme dans le portfolio, cette vérification est effectuée dans le navigateur et peut être contournée ; une garantie côté serveur nécessite un backend.

### Protection contre les abus

Le formulaire exige reCAPTCHA v2 uniquement pour la demande finale, après saisie du code e-mail. Le code est envoyé sans CAPTCHA. Sans clé de site, aucun envoi n’est effectué ; le contact par e-mail reste disponible.

1. Créer une clé Google reCAPTCHA v2 « Je ne suis pas un robot », avec le domaine publié et `localhost` pour les essais.
2. Renseigner `PUBLIC_RECAPTCHA_SITE_KEY` (clé publique) dans `.env` et dans l’environnement de build.
3. **Dans le modèle de demande finale**, ouvrir Settings, activer **Enable reCAPTCHA V2 verification** et renseigner la clé secrète Google. Dans le modèle OTP, désactiver cette option pour permettre l’envoi du code avant le CAPTCHA. Cette étape impose le CAPTCHA côté EmailJS ; le code du site seul ne protège pas les appels directs à l’API.
4. Si disponible dans le compte EmailJS, restreindre les origines autorisées au site et aux adresses locales utilisées pour les tests.
5. Garder le destinataire du modèle principal fixé à `contact@ansolari.fr`. Éviter les variables utilisateur insérées comme HTML brut ou comme URL dans les modèles.

Les champs ont des limites de taille et sont validés avant l’envoi. Un code est invalidé après cinq erreurs. Le délai de 60 secondes et la vérification du code restent locaux, donc contournables : une vérification fiable nécessite un backend avec stockage du code, expiration et limitation des requêtes côté serveur. Le CAPTCHA réduit les abus, sans garantir l’absence totale de spam.

Les tests simulent le CAPTCHA et EmailJS ; ils ne prouvent pas la configuration effective des modèles. Après activation, vérifier qu’un appel sans `g-recaptcha-response` est rejeté pour le modèle de demande finale et que le parcours réel fonctionne. Le modèle OTP peut être appelé directement sans CAPTCHA ; le délai local ne le protège pas contre les abus via l’API.

Documentation : https://www.emailjs.com/docs/user-guide/adding-captcha-verification/.
