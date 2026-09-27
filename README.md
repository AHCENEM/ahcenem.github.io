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

## Tester en local

Ouvrir le dossier dans VS Code, puis `index.html` avec l'extension **Live Server** (un serveur est nécessaire : `fetch` ne lit pas les fichiers ouverts en `file://`).
