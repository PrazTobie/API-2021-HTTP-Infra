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
