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
