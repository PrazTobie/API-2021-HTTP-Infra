# Labo HTTP Infra

1. [Partie 1: Serveur HTTP statique avec `apache httpd`](#partie-1-serveur-http-statique-avec-apache-httpd)
2. [Partie 2: Serveur HTTP dynamique avec `express.js`](#partie-2-serveur-http-dynamique-avec-expressjs)
3. [Partie 3: Proxy inversé avec apache (configuration statique)](#partie-3-proxy-inversé-avec-apache-configuration-statique)
4. [Partie 4: requêtes AJAX avec JQuery](#partie-4-requêtes-ajax-avec-jquery)
5. [Partie 5: Proxy inversé avec configuration dynamique](#partie-5-proxy-inversé-avec-configuration-dynamique)
6. [Parties additionnelles](#parties-additionnelles)

## Partie 1: Serveur HTTP statique avec `apache httpd`

Cette partie du labo se trouve sur la branche suivante: [fb-apache-static](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/fb-apache-static)

Le but de cette partie est de créer une image Docker permettant de créer un serveur HTTP statique. Nous avons choisi de suivre le webcast en faisant un serveur Apache HTTPD.

### Création du Dockerfile

Dans le dossier `docker-images/apache-php-image`, il y a le `Dockerfile` ainsi que le dossier `src` contenant tous les éléments à copier lors de la construction de l'image. Actuellement, seule une page html incluant une librairie CSS et contenant une mise en page basique avec une image est copiée. Le `Dockerfile` se base sur l'image [php:7.2-apache](https://hub.docker.com/layers/php/library/php/7.2-apache/images/sha256-25417b6c9c2e1a52b551ba89087f4d07c216f58784773c9e7a1710a1f6e2b4a1?context=explore) mettant donc à disposition un serveur Apache ainsi que PHP 7.2 et copie le contenu du dossier `src` vers le dossier `var/www/html`.

La seule différence notable avec le webcast est que notre image embarque une version plus récente bien que cela ne change pas grand chose.

### Construction de l'image

Pour construire l'image docker, il faut simplement se déplacer dans le dossier `docker-images/apache-php-image` et lancer la commande suivante:

```sh
docker build -t api/apache_php
```

### Création d'un container

Pour construire un container et remapper le port 80 sur le port 8080 de la machine à partir de l'image précédamment créée il faut lancer la commande suivante:

```sh
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

```sh
docker build -t api/express_node
```

### Création d'un container

Pour construire un container et remapper le port 3000 sur le port 3000 de la machine à partir de l'image précédamment créée il faut lancer la commande suivante:

```sh
docker run -p 3000:3000 api/express_node
```

Il suffit maintenant d'accèder au serveur depuis par exemple un navigateur: [localhost:3000](http://localhost:3000)

## Partie 3: Proxy inversé avec apache (configuration statique)

Cette partie du labo se trouve sur la branche suivante: [fb-apache-reverse-proxy](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/fb-apache-reverse-proxy)

Le but de cette partie est de créer une image Docker permettant de créer proxy inverse en utilisant apache permettant d'accèder aux deux serveurs web précédements créés selon l'url demdandée. La configuration des adresses IP sont statiques et seront gérées dynamiquement dans la prochaine partie.

### Création du Dockerfile

Dans le dossier `docker-images/apache-reverse-proxy` se trouvent le `Dockerfile` ainsi que les éléments à copier. Le `Dockerfile` est construit de la manière suivante:

1. Il se base sur l'image [php:7.2-apache](https://hub.docker.com/layers/php/library/php/7.2-apache/images/sha256-25417b6c9c2e1a52b551ba89087f4d07c216f58784773c9e7a1710a1f6e2b4a1?context=explore) mettant donc à disposition un serveur Apache ainsi que PHP 7.2.
2. Il copie le contenu du dossier `conf` dans un dossier `etc/apache2`.
3. Il lance les commandes `a2enmod proxy proxy_http` et `a2ensite 000-* 001-*` qui permettent respectivement d'activer le mode proxy et d'activer les hôtes virtuels des fichiers débutant par 000- et 001- qui sont en réalité les fichiers copiés précédemment.

Actuellement, les éléments à copier sont les fichiers `000-default.conf`, la configuration par défaut vide, et `001-reverse-proxy.conf`, notre configuration de proxy inversé. Le fichier `001-reverse-proxy.conf` marche sur le principe suivant:

```xml
<!-- Défini un hôte virtuel sur le port 80 -->
<VirtualHost *:80>

    <!-- Défini le nom du serveur sur lequel le reverse proxy va agir -->
    ServerName demo.api.ch

    <!-- Défini l'URL à rediriger ainsi que le serveur qui va la recevoir -->
    ProxyPass "/api/random" "http://172.17.0.3:3000/"
    ProxyPassReverse "/api/random" "http://172.17.0.3:3000/"

    <!-- Défini l'URL à rediriger ainsi que le serveur qui va la recevoir -->
    ProxyPass "/" "http://172.17.0.2:80/"
    ProxyPassReverse "/" "http://172.17.0.2:80/"

</VirtualHost>
```

### Construction de l'image

Pour construire l'image docker, il faut simplement se déplacer dans le dossier `docker-images/apache-reverse-proxy` et lancer la commande suivante:

```sh
docker build -t api/apache_rp
```

### Création d'un container

Il faut d'abord lancer les containers des serveurs statiques et dynamiques, pas besoin de remapper les ports car ils n'ont pas besoin d'être exposés sur la machine elle-même:

```sh
docker run api/apache_php
docker run api/express_node
```

Pour construire un container et remapper le port 80 sur le port 80 de la machine à partir de l'image précédamment créée il faut lancer la commande suivante:

```sh
docker run -p 3000:3000 api/apache_rp
```

**Notes importantes:**

* Comme la configuration est statique, il faut s'assurer que les adresses ip définies dans le fichier `001-reverse-proxy.conf` correspondent à celles attribuées aux containers des serveurs précédement créés.

* Il faut éditer le fichier des hôtes de votre machine pour lier l'adresse `172.0.0.1` au nom de serveur défini dans de fichier `001-reverse-proxy.conf` soit `demo.api.ch`.

## Partie 4: requêtes AJAX avec JQuery

Cette partie du labo se trouve sur la branche suivante: [fb-ajax](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/fb-ajax)

Le but de cette partie est de créer un script JS permettant de faire une requête HTTP sur le serveur web `express` depuis le serveur web `apache` et d'afficher le résultat dans une div. Contrairement à la donnée demandant d'utilisier JQuery pour faire une requête AJAX, nous avons choisi d'utiliser les API webs standards (en l'occurence fetch).

### Création du Dockerfile

Le dockerfile est le même que celui utilisé pour le serveur `apache`. La modification réside dans les fichiers à copier qui embarque maintenant le script `index.js`. Ce script marche sur le principe suivant:

```js
// Attendre que le DOM soit chargé
window.addEventListener('DOMContentLoaded', () => {
    // Récupérer la div qui contiendra le résultat
    const random = document.getElementById("random");
    // Fonction anonyme et asynchrone pour faire 
    // une requête HTTP se exécutée toutes les 3 secondes
    setInterval(async () => {
        // Faire une requête HTTP sur le serveur express
        // et récupérer le résultat en format JSON
        const res = await fetch("/api/random").then(res => res.json());
        // Remplacer le contenu de la div par le résultat de la requête
        random.innerText = res.random;
    }, 3000);
});
```

### Construction de l'image

L'image se construit de la même manière que pour le serveur `apache`.

### Création d'un container

La création du container se fait de la même manière que pour le serveur `apache`.

## Partie 5: Proxy inversé avec configuration dynamique

Cette partie du labo se trouve sur la branche suivante: [fb-dynamic-configuration](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/fb-dynamic-configuration)

Le but de cette partie est de créer une image Docker permettant de créer proxy inverse permettant d'accèder aux deux serveurs web précédements créés selon l'url demdandée. La configuration des adresses IP sont gérées dynamiquement.

### docker-compose

Cette partie est implémentée grâce à `docker-compose` qui permet de gérer la création de plusieurs containers en même temps.
Le reverse proxy dynamique est implémenté grâce au fait que `docker-compose` crée un network entre les containers et leur assigne un hostname, basé sur le nom du service dans le fichier `docker-compose.yml`, résolu automatiquement en adresse IP.

Notre configuration est la suivante: 

```yml
version: "3.9"
services:
  reverse-proxy: # Nom du service
    build: ./docker-images/apache-reverse-proxy # Emplacement du Dockerfile
    container_name: api-reverse-proxy # Nom du container
    image: api/reverse-proxy # Nom de l'image créée
    ports: # Port forwarding
      - "8080:80" 

  web:
    build: ./docker-images/apache-php-image
    container_name: api-php-server
    image: api/php-server

  api:
    build: ./docker-images/express-image
    container_name: api-express-server
    image: api/express-server
```

Dans notre cas, les services `web` et `api` seront accessible directement en tant qu'URL (par example `http://web/`).
Ce chagement est reflété dans la configuration du reverse proxy:

```xml
<VirtualHost *:80> 
    ServerName demo.api.ch 
 
    <!-- Préserve le header Host -->
    ProxyPreserveHost on 
 
    <!-- Remplacement de l'adresse IP statique par le hostname -->
    ProxyPass "/api/random" "http://api:3000/" 
    ProxyPassReverse "/api/random" "http://api:3000/" 
 
    <!-- Remplacement de l'adresse IP statique par le hostname -->
    ProxyPass "/" "http://web:80/" 
    ProxyPassReverse "/" "http://web:80/" 

</VirtualHost>
```

### Création des containers

Il suffit de se déplacer dans le dossier `docker-images` et de lancer la commande suivante:

```sh
docker-compose up
```

## Parties additionnelles

Cette partie du labo se trouve sur la branche suivante: [additional-steps](https://github.com/PrazTobie/API-2021-HTTP-Infra/tree/additional-steps)

Les parties suivante ont été implémentées grâce à [traefik](https://doc.traefik.io/traefik/):
* Load balancing: multiple server nodes
* Load balancing: round-robin vs sticky sessions
* Dynamic cluster management

`Traefik` gère par défaut le load balancing en mode round-robin et supporte l'ajout et le retrait dynamique de serveurs.

Ces fonctionalités ont été testées manuellement:

* Load balancing
    * Multiple server nodes
        * Lancement de plusieurs instances avec le paramètre `--scale` de `docker-compose up`
    * Round-robin
        * L'API change de serveur à chaque requête effectuée (visible dans les logs)
    * Sticky sessions
        * Rafraichir la page du navigateur (visible dans les logs)
* Dynamic cluster management
    * Stopper manuellement les différentes instances des services, tout en effectuant de nouvelles requêtes (visible dans les logs)

La partie `Management UI` a été implémentée grâce à [portainer](https://docs.portainer.io/v/ce-2.11/).

L'entièreté des configurations sont faite via le fichier `docker-compose.yml`.

```yml
version: "3.9"
services:
  traefik:
    image: "traefik:v2.5"
    container_name: "traefik"
    command:
      - "--providers.docker=true" # Active Docker comme provider de services
      - "--providers.docker.exposedbydefault=false" # Désactive l'exposition des conainers par défaut
      - "--entrypoints.web.address=:80" # Défini le port 80 comme point d'entrée
    ports:
      - "80:80" # Point d'entrée
      - "8080:8080" # Dashboard Traefik
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro" # Accès au socket docker de la machine hôte

  web:
    build: ./docker-images/apache-php-image
    image: api/php-server
    labels:
      - traefik.enable=true # Expose le service à Traefik
      - traefik.http.routers.web.rule=Host(`demo.api.ch`) # Gestion des requête sur l'hôte demo.api.ch
      - traefik.http.services.web.loadbalancer.server.port=80 # Port utilisé par le load balancer
      - traefik.http.services.web.loadbalancer.sticky.cookie=true # Active le cookie pour sticky session

  api: 
    build: ./docker-images/express-image
    image: api/express-server
    labels:
      - traefik.enable=true
      - traefik.http.routers.api.rule=(Host(`demo.api.ch`) && Path(`/api/random`)) # Gestion des requête sur l'hôte demo.api.ch au chemin /api/random
      - traefik.http.services.api.loadbalancer.server.port=3000
      - traefik.http.routers.api.middlewares=stripprefix # Middlewares
      - traefik.http.middlewares.stripprefix.stripprefix.prefixes=/api/random # Middleware pour retirer un partie de l'URL de la requête

  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro # Accès au socket docker de la machine hôte
      - ../portainer-data:/data # Données persistantes de Portainer stockées sur machine hôte
    ports:
      - 9000:9000 # UI Portainer
```

### Création des containers

Il suffit de se déplacer dans le dossier `docker-images` et de lancer la commande suivante:

```sh
docker-compose up --scale web=<instances> --scale api=<instances>
```

Où `<instances>` correspond au nombre d'instances désirées pour chaque service.
