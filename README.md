# Atelier du livre

Transforme un PDF en livre interactif et exporte un fichier HTML autonome.

**Outil en ligne :** https://egalland.github.io/livre/

## Utilisation

1. Ouvrir `index.html` dans un navigateur récent, ou utiliser la page en ligne.
2. Choisir ou déposer un PDF ; ajouter un titre si souhaité.
3. Cliquer sur « Créer le livre » et vérifier l’aperçu.
4. Cliquer sur « Exporter le livre en HTML ».

Le livre exporté contient toutes ses pages et peut être ouvert sans connexion.
Sa taille s’adapte à la fenêtre avec une marge pour le feuilletage. Sur mobile,
une page est affichée à la fois ; sur ordinateur, le livre utilise des doubles pages.

## Confidentialité et limites

La conversion s’effectue dans le navigateur. Aucun PDF n’est envoyé à un serveur.
PDF.js, ses polices et ses ressources sont intégrés dans le fichier HTML.

- PDF jusqu’à 100 Mo et 250 pages ; les exports trop volumineux sont refusés.
- Les pages sont converties en images : le texte et les liens ne restent pas interactifs.
- Les PDF protégés par un mot de passe demandent ce mot de passe.
- Pas d’enregistrement automatique du PDF : après rechargement, il faut le réimporter.

## Développement

Le fichier `index.html` constitue l’application complète, sans installation ni compilation.
Il contient l’interface, le modèle du livre, le moteur PDF.js et ses ressources.

Vérification locale : `node scripts/check.mjs` (Node.js 18 ou supérieur).

Pour mettre à jour la page en ligne, recopier `index.html` dans le dossier
`livre/index.html` du dépôt `egalland/egalland.github.io`.

## Composants tiers

PDF.js 5.6.205 et ses composants sont accompagnés de leurs notices et licences
intégrées à la fin du fichier HTML. Ces notices doivent être conservées.
