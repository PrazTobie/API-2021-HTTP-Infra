# Labo HTTP Infra

1. [Partie 1: Serveur HTTP statique avec `apache httpd`](#partie-1-serveur-http-statique-avec-apache-httpd)
2. [Serveur HTTP dynamique avec `express.js`](#serveur-http-dynamique-avec-expressjs)

## Partie 1: Serveur HTTP statique avec `apache httpd`

Cette partie du labo se trouve sur la branche suivante: [fb-apache-static](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/fb-apache-static)

Le but de cette partie est de créer une image Docker permettant de créer un serveur HTTP statique. Nous avons choisi de suivre le webcast en faisant un serveur Apache HTTPD.

### Création du Dockerfile

Dans le dossier `docker-images/apache-php-image`, il y a le `Dockerfile` ainsi que le dossier `src` contenant tous les éléments à copier lors de la construction de l'image. Actuellement, seule une page html incluant une librairie CSS et contenant une mise en page basique avec une image est copiée. Le `Dockerfile` se base sur l'image [php:7.2-apache](https://hub.docker.com/layers/php/library/php/7.2-apache/images/sha256-25417b6c9c2e1a52b551ba89087f4d07c216f58784773c9e7a1710a1f6e2b4a1?context=explore) mettant donc à disposition un serveur Apache ainsi que PHP 7.2 et copie le contenu du dossier `src` vers le dossier `var/www/html`.

La seule différence notable avec le webcast est que notre image embarque une version plus récente bien que cela ne change pas grand chose.

### Construction de l'image

Pour construire l'image docker, il faut simplement se déplacer dans le dossier `docker-images/apache-php-image` et lancer la commande suivante:

```Dockerfile
docker build -t api/apache_php
```

### Création d'un container

Pour construire un container et remapper le port 80 sur le port 8080 de la machine à partir de l'image précédamment créée il faut lancer la commande suivante:

```Dockerfile
docker run -p 8080:80 api/apache_php
```

Il suffit maintenant d'accèder au serveur depuis un navigateur par exemple: [localhost:8080](http://localhost:8080)

## Partie 2: Serveur HTTP dynamique avec `express.js`

Cette partie du labo se trouve sur la branche suivante: [fb-express-dynamic](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/fb-express-dynamic)

Le but de cette partie est de créer une image Docker permettant de créer un serveur HTTP dynamique générant du contenu JSON. Nous avons choisi de suivre le webcast en faisant un serveur Node.js utilisant le framework express.js.

### Création du Dockerfile

Dans le dossier `docker-images/express-image` se trouvent le `Dockerfile` ainsi que les éléments à copier. Le `Dockerfile` est construit de la manière suivante:

1. Il se base sur l'image [node](https://hub.docker.com/layers/node/library/node/latest/images/sha256-154710438e4dbf4c6537a3826e580446e286bfded388e40e7a4d27dc3556d208?context=explore) mettant à disposition le runtime Node.js.
2. Il copie le contenu du dossier `src` dans un dossier `server`.
3. Il installe tous les modules nécéssaires et démmare le serveur.

Actuellement, les éléments à copier sont les fichiers `index.js` permettant de démarrer le serveur et `package.json` décrivant le projet Node.js. Le fichier `index.js` est basique et marche sur le principe suivant:

```js
// Import d'express et création du serveur
import express from "express";
const app = express();

// Ajout d'un point d'entré à la racine retournant un nombre à virgule
// aléatoire dans l'interval [0,1[ au format JSON
app.get("/", (req, res) => {
    res.json({ random: Math.random() });
});

// Le serveur écoute sur le port 3000
app.listen(3000);
```

### Construction de l'image

Pour construire l'image docker, il faut simplement se déplacer dans le dossier `docker-images/express-image` et lancer la commande suivante:

```Dockerfile
docker build -t api/express_node
```

### Création d'un container

Pour construire un container et remapper le port 3000 sur le port 3000 de la machine à partir de l'image précédamment créée il faut lancer la commande suivante:

```Dockerfile
docker run -p 3000:3000 api/express_node
```

Il suffit maintenant d'accèder au serveur depuis par exemple un navigateur: [localhost:3000](http://localhost:3000)