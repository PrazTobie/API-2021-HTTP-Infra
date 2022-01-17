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
    ports:
      - 9000:9000 # UI Portainer
```

### Création des containers

Il suffit de se déplacer dans le dossier `docker-images` et de lancer la commande suivante:

```sh
docker-compose up --scale web=<instances> --scale api=<instances>
```

Où `<instances>` correspond au nombre d'instances désirées pour chaque service.
