FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql && a2enmod rewrite headers
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html
RUN { echo 'display_errors=Off'; echo 'log_errors=On'; echo 'session.cookie_httponly=1'; } > /usr/local/etc/php/conf.d/production.ini
EXPOSE 80
