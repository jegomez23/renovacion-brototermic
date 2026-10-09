# Apache de pruebas para el .htaccess de /dist (no se publica; ver tools/apache-pruebas/README.md)
# Versión fija para que la prueba sea repetible
FROM httpd:2.4.62

# Certificado autofirmado para probar también https:// con los 4 hosts
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/* \
 && openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
      -subj "/CN=brototermic.com" \
      -addext "subjectAltName=DNS:brototermic.com,DNS:www.brototermic.com,DNS:brototermic.es,DNS:www.brototermic.es" \
      -keyout /usr/local/apache2/conf/server.key \
      -out /usr/local/apache2/conf/server.crt

# Módulos que usa el .htaccess (los mismos que debe tener el hosting)
RUN sed -i \
      -e 's/^#\(LoadModule rewrite_module\)/\1/' \
      -e 's/^#\(LoadModule ssl_module\)/\1/' \
      -e 's/^#\(LoadModule socache_shmcb_module\)/\1/' \
      -e 's/^#\(LoadModule headers_module\)/\1/' \
      -e 's/^#\(LoadModule filter_module\)/\1/' \
      -e 's/^#\(LoadModule deflate_module\)/\1/' \
      -e 's/^#\(LoadModule expires_module\)/\1/' \
      /usr/local/apache2/conf/httpd.conf \
 && echo 'Include conf/extra/httpd-pruebas.conf' >> /usr/local/apache2/conf/httpd.conf

COPY httpd-pruebas.conf /usr/local/apache2/conf/extra/httpd-pruebas.conf
