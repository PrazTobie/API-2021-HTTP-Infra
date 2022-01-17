Partie 1: Serveur HTTP statique avec apache httpd
Cette partie du labo se trouve sur la branche suivante: fb-apache-static

Le but de cette partie est de créer une image Docker permettant de créer un serveur HTTP statique. Nous avons choisi de suivre le webcast en faisant un serveur Apache HTTPD.

Création du Dockerfile
Dans le dossier docker-images/apache-php-image, il y a le Dockerfile ainsi que le dossier src contenant tous les éléments à copier lors de la construction de l'image. Actuellement, seule une page html incluant une librairie CSS et contenant une mise en page basique avec une image est copiée. Le Dockerfile se base sur l'image php:7.2-apache mettant donc à disposition un serveur Apache ainsi que PHP 7.2 et copie le contenu du dossier src vers le dossier var/www/html.

La seule différence notable avec le webcast est que notre image embarque une version plus récente bien que cela ne change pas grand chose.

Construction de l'image
Pour construire l'image docker, il faut simplement se déplacer dans le dossier docker-images/apache-php-image et lancer la commande suivante:

docker build -t api/apache_php
Création d'un container
Pour construire un container et remapper le port 80 sur le port 8080 de la machine à partir de l'image précédamment créée il faut lancer la commande suivante:

docker run -p 8080:80 api/apache_php
Il suffit maintenant d'accèder au serveur depuis un navigateur par exemple: localhost:8080