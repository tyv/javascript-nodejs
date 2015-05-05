
Вашему вниманию предлагается скринкаст по Node.JS на русском языке.

Его целью не является разбор всех-всех возможностей и модулей Node.JS, ведь многие из них используются очень редко.

С другой стороны, мы очень подробно разберём основные возможности и средства создания веб-сервисов,
включая внутренние особенности самого сервера Node.JS, важные для его работы.

Если вы -- разработчик, то вам наверняка известно: большинство полезной документации и скринкастов делается на английском.

Конечно, даже на английском много всего устаревшего, приходится порыться, но на русском -- всё гораздо хуже.
Многого просто нет. Хотелось бы поменять эту ситуацию, хотя бы в плане Node.JS.

## Часть 1: Изучаем Node.JS

Выпуски были записаны для Node 0.10.

Каждую запись можно просмотреть или скачать в низком и хорошем качестве.

<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="intro-1-about">[Введение в Node.JS, об этом скринкасте](http://www.youtube.com/watch?v=ILpS4Fq3lmw)</li>
<li class="lessons-list__lesson" data-mnemo="intro-2-whatisnode">[Что такое Node.JS? Почему Node.JS?](http://www.youtube.com/watch?v=N-4p2_NEr9w)</li>
<li class="lessons-list__lesson" data-mnemo="intro-3-install">[Установка и запуск](http://www.youtube.com/watch?v=5s9GamjYQpo)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="intro-4-docs">[Исходники и документация](http://www.youtube.com/watch?v=AYwWHMda7Yo)</li>

<li class="lessons-list__lesson" data-mnemo="modules-1-intro">[Модули для Node.JS](http://youtu.be/g740J-RyoR4)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="modules-2-module">[Приёмы работы с модулями](http://www.youtube.com/watch?v=xs6sSylr-88)</li>

<li class="lessons-list__lesson" data-mnemo="npm-1-intro">[Введение в NPM - менеджер пакетов для Node.JS](http://www.youtube.com/watch?v=fhwtUW9dXrA)</li>
<li class="lessons-list__lesson" data-mnemo="npm-2-package">[Структура пакета NPM](http://www.youtube.com/watch?v=CrevZgTc7ow)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="npm-3-global">[Глобальные модули](http://www.youtube.com/watch?v=6hUceqsmfCw)</li>

<li class="lessons-list__lesson" data-mnemo="top-1-util">[Модуль util и наследование](http://youtu.be/QBHzMp65iKg)</li>
<li class="lessons-list__lesson" data-mnemo="top-2-console">[Модуль console](http://www.youtube.com/watch?v=cZQn_CaNsZk)</li>
<li class="lessons-list__lesson" data-mnemo="top-3-inherit-error">[Наследование от ошибок Error](http://youtu.be/5etqNwbCl1Y)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="top-4-eventemitter">[События, EventEmitter и утечки памяти](http://youtu.be/oOgXm3voVno)</li>

<li class="lessons-list__lesson" data-mnemo="server-1-intro">[Node.JS как веб-сервер](http://youtu.be/aHljHztKaQY)</li>
<li class="lessons-list__lesson" data-mnemo="server-2-echo">[Эхо-сервер на Node.JS](http://youtu.be/StQydypwACc)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="server-3-docs">[Документация к модулю http](http://www.youtube.com/watch?v=g0KuOQgVqmE)</li>

<li class="lessons-list__lesson" data-mnemo="dev-1-supervisor">[Разработка, supervisor](http://www.youtube.com/watch?v=2aViNktk1ck)</li>
<li class="lessons-list__lesson" data-mnemo="dev-2-debug">[Отладка скриптов под Node.JS](http://www.youtube.com/watch?v=COHIRHitRdc)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="dev-3-log">[Логирование, модули debug и winston](http://youtu.be/ocmgia1lDIk)</li>

<li class="lessons-list__lesson" data-mnemo="event-loop-1-async">[Введение в асинхронную разработку](http://youtu.be/_kJeJaARUP4)</li>
<li class="lessons-list__lesson" data-mnemo="event-loop-2-inside">[Событийный цикл, библиотека libUV](http://youtu.be/w4EHA9xqoNw)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="event-loop-3-timers">[Таймеры, process.nextTick, ref/unref](http://youtu.be/q7KfOnuINmo)</li>

<li class="lessons-list__lesson" data-mnemo="fs-1-fs">[Работа с файлами, модуль fs](http://www.youtube.com/watch?v=Z4MD8ocIwaE)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="fs-2-path">[Безопасный путь к файлу в fs и path](http://www.youtube.com/watch?v=KlvJOz9GUjU)</li>

<li class="lessons-list__lesson" data-mnemo="streams-1-readable">[Потоки данных в Node.JS, fs.ReadStream](http://youtu.be/1rbmO71wwyU)</li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="streams-2-net">[Writable поток ответа res, метод pipe](http://youtu.be/_j0LoOXnOF4)</li>

<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="long-poll-chat">[Чат через long-polling, чтение POST](http://youtu.be/R2pgKY376xI)</li>

<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="domain">[Домены, "асинхронный try..catch"](http://youtu.be/AP_rA_LwYcs)</li>

<li class="lessons-list__lesson" data-mnemo="process-params">[Чтение параметров из командной строки и окружения](http://www.youtube.com/watch?v=FlJCRX5Y0vg)</li>
</ol>
</div>

## Часть 2: Создаём приложение

В этой части разные технологии и внешние модули, используемые при NodeJS-разработке будут описаны в контексте создания веб-приложения.

Веб-приложение -- сайт с чатом, посетителями, базой данных и авторизацией.

[smart header="Express 3 -> Express 4"]
Вторая часть записана с версией фреймворка express 3, сейчас уже express 4.
Устаревшие фичи express3 в скринкасте не используются, так что это единственное существенное отличие -- в express 4 многие библиотеки вынесены отдельно из фреймворка, см. [Migrating from 3.x to 4.x](https://github.com/visionmedia/express/wiki/Migrating-from-3.x-to-4.x).
Если вы хотите следовать скринкасту, то рекомендуется `npm i express@3`, переход на 4 будет для вас очевиден.

Вторую часть можно использовать и в качестве основы для перехода к более современным фреймворкам, таким как [KoaJS](http://koajs.com).
[/smart]

<no-typography>
<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="chat-1">[Создаём костяк сайта / Express: основы и Middleware](http://youtu.be/2Xp9yj3UIAg)</li>
<li class="lessons-list__lesson" data-mnemo="chat-2">[Улучшаем костяк сайта / Логгер, конфигурация, шаблонка для HTML](http://youtu.be/FKBkVr7FtbA)</li>
<li class="lessons-list__lesson" data-mnemo="chat-3">[Улучшаем шаблонизацию / EJS: layout, block, partials](http://youtu.be/SIVHont3HDY)</li>
<li class="lessons-list__lesson" data-mnemo="chat-4">[Начинаем работать с базой / Основы MongoDB, native driver](http://youtu.be/5a1eJcJ0aNg)</li>
<li class="lessons-list__lesson" data-mnemo="chat-5">[Создаём модель для пользователя / Основы Mongoose](http://youtu.be/E9V1zTGKRfY)</li>
<li class="lessons-list__lesson" data-mnemo="chat-6">[Делаем скрипт для создания тестовой базы / Async, организация кода](http://youtu.be/0Wq5VIx33rw) [обновлено]</li>
<li class="lessons-list__lesson" data-mnemo="chat-7">[Веб-сервисы, работа с ошибками / Express, Mongoose](https://www.youtube.com/watch?v=YZwAVRsa1O4)</li>
<li class="lessons-list__lesson" data-mnemo="chat-8">[Сессии, отслеживание посетителей /Express/](http://youtu.be/X3xy6uh8rcI)</li>
<li class="lessons-list__lesson" data-mnemo="chat-9">[Авторизация /Express, Mongoose, Async, EJS/](http://youtu.be/N5YmtAr5O3U)</li>
<li class="lessons-list__lesson" data-mnemo="chat-10">[COMET: обзор подходов / WS.JS, Sock.JS, Socket.IO](http://youtu.be/mnROS7mKuck)</li>
<li class="lessons-list__lesson" data-mnemo="chat-11">[Чат на Express и Socket.IO](http://youtu.be/nlA-3jIfT-Q)</li>
<li class="lessons-list__lesson" data-mnemo="chat-12">[Опции Socket.IO и автореконнект](http://youtu.be/IgcBPjdr2fs)</li>
<li class="lessons-list__lesson" data-mnemo="chat-13">[Socket.IO + Express + авторизация](http://youtu.be/A3TUXGI_iuM)</li>
</ol>
</div>
</no-typography>

Дополнительно:

<no-typography>
<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="mongo-install">[Установка MongoDB для Windows, пример работы](http://youtu.be/fugXo7A5sNE)</li>
</ol>
</div>
</no-typography>

## Код

Код к большинству выпусков находится в здесь: [](https://github.com/iliakan/nodejs-screencast), его также можно скачать и в виде [zip-файла](https://github.com/iliakan/nodejs-screencast/archive/master.zip).
