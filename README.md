# Portfolio d'Ahcene Madjour

Site : **https://ahcenem.github.io**

Data Analyst · Développeur Web. Ce site présente mes projets data en études de cas (question métier, données, démarche, résultat chiffré, recommandation) et mes projets web.

## Ce que montre le site

- **Projets chargés en direct depuis l'API GitHub** : tous mes dépôts publics apparaissent automatiquement, classés Data ou Web d'après leurs topics ou leur langage.
- **Études de cas** dans `data/projects.json`, rattachées aux dépôts par leur nom. Ce fichier sert aussi de secours si l'API GitHub ne répond pas.
- **Graphiques Chart.js** : prix médian au m² par arrondissement de Paris (données exportées de mon notebook) et tableau de bord « Mon GitHub en données ».
- Thème clair et sombre, responsive de 320 à 1440 px, accessible au clavier et aux lecteurs d'écran.

## Technologies

HTML, CSS (Grid, Flexbox, variables), JavaScript (fetch, API GitHub), Chart.js. Sans framework, sans étape de compilation.

## Structure

```
index.html                         page unique
css/style.css                      styles, organisés par sections
js/main.js                         thème clair / sombre, menu mobile
js/projets.js                      API GitHub, cartes projets, filtres
js/graphiques.js                   graphiques Chart.js
data/projects.json                 études de cas + dépôts de secours
data/prix_m2_arrondissement.json   prix médian au m² (export du notebook)
assets/                            photo, image d'aperçu, polices, CV
```

## Publier un nouveau projet

Le site lit l'API GitHub à chaque visite : **un dépôt public apparaît tout seul**, sans modifier le code (comptez jusqu'à quelques minutes, le temps que l'API GitHub se mette à jour).

Chemin dans le code (`js/projets.js`) :

1. `chargerProjets` lit `data/projects.json`, puis `chargerDepotsGithub` appelle l'API `users/AHCENEM/repos` (100 dépôts maximum).
2. `estAffiche` garde tous les dépôts publics, sauf `AHCENEM` et `ahcenem.github.io` (liste `depotsExclus`).
3. `trouverCategorie` classe le dépôt : topic `data` ou `web` d'abord, sinon le langage (Jupyter Notebook, Python, R, SQL → Data ; PHP, HTML, JavaScript, CSS, TypeScript → Web ; langage inconnu → Data).
4. `creerProjet` fabrique le projet (titre tiré du nom, description, langage, lien, date) et le complète avec son étude de cas si `data/projects.json` en contient une pour ce nom de dépôt.
5. `afficherDepots` affiche les cartes, met à jour les filtres, le chiffre de l'accueil et « Mon GitHub en données ».

**Si l'API échoue** (limite de 60 appels par heure, pas de réseau), le site affiche la liste `depots` de `data/projects.json` avec un message.

### Checklist

1. **Rendre le dépôt public** sur GitHub : il apparaît sur le site.
2. **Remplir le champ « About »** du dépôt (roue dentée à droite de la page du dépôt) :
   - une **description** d'une phrase : elle s'affiche sur la carte (sinon « Description à venir. ») ;
   - un topic **`data`** ou **`web`** si le langage ne suffit pas à classer le projet (par exemple un projet Power BI, sans langage reconnu, est classé Data par défaut).
3. **Facultatif, pour une étude de cas complète** : dans `data/projects.json`, ajouter un objet à la liste `etudes` avec `"depot": "nom-exact-du-depot"` et les champs voulus : `titre`, `question`, `donnees`, `demarche`, `chiffres`, `resultat`, `recommandation`, `outils`, `liens` (projet data) ou `besoin`, `realisation`, `securite` (projet web). Les champs absents ne s'affichent pas.
4. **Mettre à jour le fichier de secours** : copier le nouveau dépôt dans la liste `depots` de `data/projects.json` (`name`, `description`, `language`, `topics`, `html_url`, `pushed_at`), pour qu'il reste visible même si l'API GitHub ne répond pas.
5. Si 3 ou 4 : commit et push du dépôt `ahcenem.github.io`.

Pour **cacher** un dépôt public du site : ajouter son nom (en minuscules) à `depotsExclus` dans `js/projets.js`.

## Tester en local

Ouvrir le dossier dans VS Code, puis `index.html` avec l'extension **Live Server** (un serveur est nécessaire : `fetch` ne lit pas les fichiers ouverts en `file://`).
