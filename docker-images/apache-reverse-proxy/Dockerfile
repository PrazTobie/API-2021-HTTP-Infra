FROM php:5.6-apache

RUN apt-get update && apt-get install -y nano dos2unix

COPY apache2-foreground /usr/local/bin/
COPY conf/ /etc/apache2

RUN cd /usr/local/bin/ && dos2unix apache2-foreground

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*