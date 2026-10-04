# Informations à compléter avant une ouverture publique

Ce document est une préparation interne, pas une politique de confidentialité publiée ni une affirmation de conformité.

## Informations connues

- Projet : Ansolari.
- Porteur : Juan-Pablo LONDONO RAMIREZ ; aucune entreprise déclarée à ce stade.
- Contact : contact@ansolari.fr.
- Champs : garage, prénom, adresse e-mail et besoin principal.
- Finalité du formulaire : vérifier l’adresse et répondre à une demande de démonstration.
- EmailJS transmet le code au visiteur puis la demande à contact@ansolari.fr.
- Google reCAPTCHA est chargé après la saisie des six chiffres. Le code OTP lui-même est envoyé sans CAPTCHA.
- Hébergement actuel indiqué : Netlify ; migration envisagée.

## Mentions légales et confidentialité à rédiger

Confirmer les coordonnées de l’éditeur et celles de l’hébergeur, ainsi que les informations de publication applicables au statut réel du projet. Ne pas inventer de société, SIRET, adresse ou délai.

Pour la notice du formulaire, décider et documenter :

- Identité et coordonnées du responsable du traitement.
- Base légale correspondant à l’activité réelle.
- Destinataires, services utilisés et éventuels transferts de données hors UE : vérifier les contrats et paramètres EmailJS, fournisseur d’e-mail, Google et hébergeur.
- Durée ou critères de conservation et procédure de suppression, y compris dans la boîte mail et l’historique EmailJS.
- Moyens d’exercer les droits et possibilité de réclamation auprès de la CNIL.
- Caractère obligatoire des champs et conséquences d’une absence de réponse.
- Conditions de chargement de reCAPTCHA et information sur les traceurs : le chargement tardif ne suffit pas à garantir la conformité.

Publier ensuite les pages finalisées et leurs liens dans le footer et sous le formulaire.

Sources : https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel et https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence.

## Contenu à fournir

- Domaine public définitif : renseigner PUBLIC_SITE_URL avant le build ; le sitemap est désormais généré ; le déclarer aux moteurs après déploiement.
- Extrait audio réel, avec autorisations nécessaires, transcription et contrôle manuel de lecture. Aucun témoignage ni résultat chiffré ne doit être fabriqué.
- Témoignage ou cas client réel quand disponible.
- Tarifs, intégrations prises en charge et conditions de service confirmés.
- Délai de réponse réaliste avant de l’annoncer sur le site.

## Sécurité restant à vérifier en production

- reCAPTCHA imposé dans EmailJS pour le modèle de demande finale ; test réel du rejet d’un appel sans token.
- Origines autorisées dans EmailJS selon les possibilités du compte.
- OTP : code et limites dans le navigateur, donc contournables. Prévoir une API indépendante avec stockage serveur, expiration, nombre de tentatives et quotas par adresse/IP pour une protection fiable.
- Vérifier les en-têtes HTTP après déploiement ; les tests Astro locaux ne prouvent pas la configuration de l’hébergement.
