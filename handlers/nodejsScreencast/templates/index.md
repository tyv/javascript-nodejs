
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
<li class="lessons-list__lesson" data-mnemo="intro-1-about"><a href="#" data-video-id="ILpS4Fq3lmw">Введение в Node.JS, об этом скринкасте</a></li>
<li class="lessons-list__lesson" data-mnemo="intro-2-whatisnode"><a href="#" data-video-id="N-4p2_NEr9w">Что такое Node.JS? Почему Node.JS?</a></li>
<li class="lessons-list__lesson" data-mnemo="intro-3-install"><a href="#" data-video-id="5s9GamjYQpo">Установка и запуск</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="intro-4-docs"><a href="#" data-video-id="AYwWHMda7Yo">Исходники и документация</a></li>

<li class="lessons-list__lesson" data-mnemo="modules-1-intro"><a href="#" data-video-id="g740J-RyoR4">Модули для Node.JS</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="modules-2-module"><a href="#" data-video-id="xs6sSylr-88">Приёмы работы с модулями</a></li>

<li class="lessons-list__lesson" data-mnemo="npm-1-intro"><a href="#" data-video-id="fhwtUW9dXrA">Введение в NPM - менеджер пакетов для Node.JS</a></li>
<li class="lessons-list__lesson" data-mnemo="npm-2-package"><a href="#" data-video-id="CrevZgTc7ow">Структура пакета NPM</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="npm-3-global"><a href="#" data-video-id="6hUceqsmfCw">Глобальные модули</a></li>

<li class="lessons-list__lesson" data-mnemo="top-1-util"><a href="#" data-video-id="QBHzMp65iKg">Модуль util и наследование</a></li>
<li class="lessons-list__lesson" data-mnemo="top-2-console"><a href="#" data-video-id="cZQn_CaNsZk">Модуль console</a></li>
<li class="lessons-list__lesson" data-mnemo="top-3-inherit-error"><a href="#" data-video-id="5etqNwbCl1Y">Наследование от ошибок Error</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="top-4-eventemitter"><a href="#" data-video-id="oOgXm3voVno">События, EventEmitter и утечки памяти</a></li>

<li class="lessons-list__lesson" data-mnemo="server-1-intro"><a href="#" data-video-id="aHljHztKaQY">Node.JS как веб-сервер</a></li>
<li class="lessons-list__lesson" data-mnemo="server-2-echo"><a href="#" data-video-id="StQydypwACc">Эхо-сервер на Node.JS</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="server-3-docs"><a href="#" data-video-id="g0KuOQgVqmE">Документация к модулю http</a></li>

<li class="lessons-list__lesson" data-mnemo="dev-1-supervisor"><a href="#" data-video-id="2aViNktk1ck">Разработка, supervisor</a></li>
<li class="lessons-list__lesson" data-mnemo="dev-2-debug"><a href="#" data-video-id="COHIRHitRdc">Отладка скриптов под Node.JS</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="dev-3-log"><a href="#" data-video-id="ocmgia1lDIk">Логирование, модули debug и winston</a></li>

<li class="lessons-list__lesson" data-mnemo="event-loop-1-async"><a href="#" data-video-id="_kJeJaARUP4">Введение в асинхронную разработку</a></li>
<li class="lessons-list__lesson" data-mnemo="event-loop-2-inside"><a href="#" data-video-id="w4EHA9xqoNw">Событийный цикл, библиотека libUV</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="event-loop-3-timers"><a href="#" data-video-id="q7KfOnuINmo">Таймеры, process.nextTick, ref/unref</a></li>

<li class="lessons-list__lesson" data-mnemo="fs-1-fs"><a href="#" data-video-id="Z4MD8ocIwaE">Работа с файлами, модуль fs</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="fs-2-path"><a href="#" data-video-id="KlvJOz9GUjU">Безопасный путь к файлу в fs и path</a></li>

<li class="lessons-list__lesson" data-mnemo="streams-1-readable"><a href="#" data-video-id="1rbmO71wwyU">Потоки данных в Node.JS, fs.ReadStream</a></li>
<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="streams-2-net"><a href="#" data-video-id="_j0LoOXnOF4">Writable поток ответа res, метод pipe</a></li>

<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="long-poll-chat"><a href="#" data-video-id="R2pgKY376xI">Чат через long-polling, чтение POST</a></li>

<li class="lessons-list__lesson lessons-list__lesson_section-end" data-mnemo="domain"><a href="#" data-video-id="AP_rA_LwYcs">Домены, "асинхронный try..catch"</a></li>

<li class="lessons-list__lesson" data-mnemo="process-params"><a href="#" data-video-id="FlJCRX5Y0vg">Чтение параметров из командной строки и окружения</a></li>
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
<li class="lessons-list__lesson" data-mnemo="chat-1"><a href="#" data-video-id="2Xp9yj3UIAg">Создаём костяк сайта / Express: основы и Middleware</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-2"><a href="#" data-video-id="FKBkVr7FtbA">Улучшаем костяк сайта / Логгер, конфигурация, шаблонка для HTML</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-3"><a href="#" data-video-id="SIVHont3HDY">Улучшаем шаблонизацию / EJS: layout, block, partials</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-4"><a href="#" data-video-id="5a1eJcJ0aNg">Начинаем работать с базой / Основы MongoDB, native driver</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-5"><a href="#" data-video-id="E9V1zTGKRfY">Создаём модель для пользователя / Основы Mongoose</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-6"><a href="#" data-video-id="0Wq5VIx33rw">Делаем скрипт для создания тестовой базы / Async, организация кода</a> [обновлено]</li>
<li class="lessons-list__lesson" data-mnemo="chat-7"><a href="#" data-video-id="YZwAVRsa1O4">Веб-сервисы, работа с ошибками / Express, Mongoose</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-8"><a href="#" data-video-id="X3xy6uh8rcI">Сессии, отслеживание посетителей /Express/</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-9"><a href="#" data-video-id="N5YmtAr5O3U">Авторизация /Express, Mongoose, Async, EJS/</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-10"><a href="#" data-video-id="mnROS7mKuck">COMET: обзор подходов / WS.JS, Sock.JS, Socket.IO</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-11"><a href="#" data-video-id="nlA-3jIfT-Q">Чат на Express и Socket.IO</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-12"><a href="#" data-video-id="IgcBPjdr2fs">Опции Socket.IO и автореконнект</a></li>
<li class="lessons-list__lesson" data-mnemo="chat-13"><a href="#" data-video-id="A3TUXGI_iuM">Socket.IO + Express + авторизация</a></li>
</ol>
</div>
</no-typography>

Дополнительно:

<no-typography>
<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="mongo-install"><a href="#" data-video-id="fugXo7A5sNE">Установка MongoDB для Windows, пример работы</a></li>
</ol>
</div>
</no-typography>

## Код

Код к большинству выпусков находится в здесь: [](https://github.com/iliakan/nodejs-screencast), его также можно скачать и в виде [zip-файла](https://github.com/iliakan/nodejs-screencast/archive/master.zip).
