
<a href="https://webpack.github.io">Webpack</a> -- один из самых мощных и гибких инструментов для сборки frontend.

Вместе с тем, он достаточно сложен, а документация оставляет желать много лучшего.

Поэтому я записал этот скринкаст о том, как его использовать.

Особое внимание я постарался уделить пониманию того, как он работает, и что представляет собой сборка, 
поскольку без него любой нюанс влечёт долгое путешествие по форумам в поисках "рецепта". Который вполне можно сделать и самостоятельно.

Полезного просмотра!

## Выпуски скринкаста

Часть выпусков уже записана, часть -- планируется к записи. Оставьте свой email в форме внизу, чтобы узнавать об обновлениях.

[warn header="Babel 5"]
Скринкаст почти везде, где подключен Babel, использует модуль `babel-loader` версии 5, который ставится через `npm i babel-loader@5`.

Шестая версия Babel, хоть ставится по умолчанию, но пока не является production ready. Скринкаст будет обновлён, когда её допилят.
[/warn]
 



## Часть 1: Введение

<no-typography>

<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="01-intro"><a href="#" data-video-id="kLMjOd-x0aQ">Введение</a></li>
</ol>
</div>

</no-typography>

## Часть 2: Простая сборка

<no-typography>

<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="02-simple-1"><a href="#" data-video-id="z8p27oR5VmU">Простой конфиг</a></li>
<li class="lessons-list__lesson" data-mnemo="02-simple-2"><a href="#" data-video-id="AUS-QEp4NUo">Внешний доступ к модулям</a></li>
<li class="lessons-list__lesson" data-mnemo="02-simple-3"><a href="#" data-video-id="85zatjhaOkE">Пересборка при изменениях</a></li>
<li class="lessons-list__lesson" data-mnemo="02-simple-4"><a href="#" data-video-id="v9gtHkynU5E">Source maps</a></li>
<li class="lessons-list__lesson" data-mnemo="02-simple-5"><a href="#" data-video-id="5XZqeuWkQ4o">Окружение, NODE_ENV</a></li>
<li class="lessons-list__lesson" data-mnemo="02-simple-6"><a href="#" data-video-id="J-Q7PcfyiGU">Babel.JS</a></li>
<li class="lessons-list__lesson" data-mnemo="02-simple-7"><a href="#" data-video-id="vkK-h1bgUIE">Resoving</a></li>
<li class="lessons-list__lesson" data-mnemo="02-simple-8"><a href="#" data-video-id="ZLrzAhhbt6s">Минификация</a></li>
</ol>
</div>
</no-typography>

## Часть 3: Несколько скриптов

<no-typography>

<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="03-multi-1"><a href="#" data-video-id="JYP0e7uwgG0">Несколько точек входа</a></li>
<li class="lessons-list__lesson" data-mnemo="03-multi-2"><a href="#" data-video-id="R0OxO-iJmws">NoErrorsPlugin</a></li>
<li class="lessons-list__lesson" data-mnemo="03-multi-3"><a href="#" data-video-id="pSKd2zkEAZM">CommonsChunkPlugin</a></li>
<li class="lessons-list__lesson" data-mnemo="03-multi-4"><a href="#" data-video-id="ohfdNMBS6x0">Информация о сборке</a></li>
<li class="lessons-list__lesson" data-mnemo="03-multi-5"><a href="#" data-video-id="aET3GxoHBug">Настройки CommonsChunkPlugin</a></li>
<li class="lessons-list__lesson" data-mnemo="03-multi-6"><a href="#" data-video-id="H7BSkKruevw">Общий код в common.js</a></li>
<li class="lessons-list__lesson" data-mnemo="03-multi-7"><a href="#" data-video-id="enlfe-6VQNM">Мульти-компиляция</a></li>
</ol>
</div>
</no-typography>


## Часть 4: Продвинутые require

<no-typography>

<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="04-require-1"><a href="#" data-video-id="Om6yGdU_YlQ">Динамический require</a></li>
<li class="lessons-list__lesson" data-mnemo="04-require-2"><a href="#" data-video-id="Fy16GeWZ6Oc">Объединение фрагментов</a></li>
<li class="lessons-list__lesson" data-mnemo="04-require-3"><a href="#" data-video-id="BE-MXZLDwN4">require(выражение)</a></li>
<li class="lessons-list__lesson" data-mnemo="04-require-4"><a href="#" data-video-id="qUfLCtLvOs0">require.context</a></li>
<li class="lessons-list__lesson" data-mnemo="04-require-5"><a href="#" data-video-id="fHvgKASUXH0">Динамический require.context</a></li>
<li class="lessons-list__lesson" data-mnemo="04-require-6"><a href="#" data-video-id="XY2NLKCrjJ4">ContextReplacementPlugin</a></li>
<li class="lessons-list__lesson" data-mnemo="04-require-7"><a href="#" data-video-id="vHRvO4jn6Oc">IgnorePlugin</a></li>
</ol>
</div>
</no-typography>

## Часть 5: Подключение библиотек

<no-typography>
<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="05-library-1"><a href="#" data-video-id="RdZkFNzST3c">CDN и сборка: externals</a></li>
<li class="lessons-list__lesson" data-mnemo="05-library-2"><a href="#" data-video-id="9VSVg38Afms">Локально: ProvidePlugin</a></li>
<li class="lessons-list__lesson" data-mnemo="05-library-3"><a href="#" data-video-id="EeLg1mTaz3U">Оптимизация: noParse, include</a></li>
<li class="lessons-list__lesson" data-mnemo="05-library-4"><a href="#" data-video-id="7LSEczQiCQA">Старые скрипты: пути и imports/exports</a></li>
<li class="lessons-list__lesson" data-mnemo="05-library-5"><a href="#" data-video-id="XV1M4Pwx-Ik">expose и script-loader</a></li>
</ol>
</div>
</no-typography>

## Часть 6: Стили и файлы

<no-typography>
<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="06-styles-assets-1"><a href="#" data-video-id="hkPwyt3lhbg">Компонент "меню", style-loader</a></li>
<li class="lessons-list__lesson" data-mnemo="06-styles-assets-2"><a href="#" data-video-id="k8LdbZcOvWs">CSS и file-loader</a></li>
<li class="lessons-list__lesson" data-mnemo="06-styles-assets-3"><a href="#" data-video-id="03qQYfKMBO8">url-loader</a></li>
<li class="lessons-list__lesson" data-mnemo="06-styles-assets-4"><a href="#" data-video-id="6WxoxUuSVA4">jade-loader</a></li>
<li class="lessons-list__lesson" data-mnemo="06-styles-assets-5"><a href="#" data-video-id="2s6-1VIVwPo">less, sass, stylus</a></li>
<li class="lessons-list__lesson" data-mnemo="06-styles-assets-6"><a href="#" data-video-id="62qYFgokzdU">ExtractTextPlugin</a></li>
</ol>
</div>
</no-typography>

## Часть 7: Длинное кеширование

<no-typography>
<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson" data-mnemo="07-caching-1"><a href="#" data-video-id="62qYFgokzdU">Повторение: пример конфига</a></li>
<li class="lessons-list__lesson" data-mnemo="07-caching-2"><a href="#" data-video-id="kxxFQZx3KOk">Настройки для кеширования</a></li>
</ol>
</div>
</no-typography>

## Планируется ещё 1 часть


<no-typography>

<div class="lessons-list lessons-list_screencast">
<ol class="lessons-list__lessons">
<li class="lessons-list__lesson">Live reload и Hot Module Replacement</li>
</ol>
</div>

</no-typography>
    
## Код

Код к большинству выпусков находится в здесь: [](https://github.com/iliakan/webpack-screencast), его также можно скачать и в виде [zip-файла](https://github.com/iliakan/webpack-screencast/archive/master.zip).
