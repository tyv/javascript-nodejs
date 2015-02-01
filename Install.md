
# Как поднять сайт локально

## 0. Операционная система

Сайт работает под MacOS, Unix (протестировано на Ubuntu, Debian), но не Windows. Сам код сайта написан более-менее универсально, но под Windows криво работают некоторые сторонние модули.

## 1. Поставьте Node.JS 0.11+

Нужна именно последняя версия.

Её можно найти по первой ссылке поисковика: [https://www.google.ru/search?q=node.js+latest+unstable]().

Внизу страницы будет список всевозможных пакетов для разных ОС.

*Если вы хотите одновременно иметь стабильную версию 0.10 и последнюю 0.11, можно использовать [NVM](https://github.com/creationix/nvm).*

## 2. Поставьте и запустите MongoDB.

Если у вас Mac, то проще всего сделать это через [MacPorts](http://www.macports.org/install.php) или [Homebrew](http://brew.sh), чтобы было проще ставить дополнительные пакеты.

Если через MacPorts, то:
```
sudo port install mongodb
sudo port load mondogb
```

## 3. Клонируйте репозитарий 

Предположу, что Git у вас уже стоит и вы умеете им пользоваться. 

Клонируйте только ветку `master`:
```
git clone -b master --single-branch https://github.com/iliakan/javascript-nodejs
```

## 4. Глобальные модули

Поставьте глобальные модули:

```
npm install -g mocha bunyan gulp nodemon  
```

## 5. Системные пакеты

Для работы нужны Nginx, GraphicsMagick, ImageMagick (обычно используется GM, он лучше, но иногда IM).

```
sudo port install ImageMagick GraphicsMagick 
sudo port install nginx +debug+gzip_static+realip

sudo port load nginx
```

## 6. Конфигурация Nginx

Если в системе ранее не стоял nginx, то ставим настройки для сайта:

Например:
```
./gulp config:nginx --prefix /opt/local/etc/nginx --root /js/javascript-nodejs --env development --clear 
```

Здесь `--prefix` -- место для конфигов nginx, обычно `/etc/nginx`, в случае MacPorts это `/opt/local/etc/nginx`.
В параметр `--root` запишите место установки сайта.

Опция `--clear` полностью удалит старые конфиги nginx.

Если уже есть nginx, то можно без `--clear`. 
Эта команда копирует файлы из директории nginx (с минимальной шаблонизацией) в указанную директорию, 
если в ней есть важные nginx-конфиги, то конечно хорошо бы, чтобы они не были потёрты.

У меня в sites-enabled есть и другие сайты. 
 
## 7. `npm install`

В директории, в которую клонировали, запустите:

```
npm install
```

## 8. База

Репозитарий учебника импортируется командой
 
```
./gulp tutorial:import --root /js/javascript-tutorial
```
Репозитарий до окончания работы над первым релизом сайта приватный, доступ предоставлю по запросу. 
Сайт поднимется и без учебника, но статей на нём не будет.

## 9. Запуск сайта

Запуск сайта в режиме разработки:
```
./dev
```

Это поднимет сразу и сайт и механизмы автосборки стилей-скриптов и livereload.

# TroubleShooting

Если что-то не работает -- [пишите issue](https://github.com/iliakan/javascript-nodejs/issues/new).


