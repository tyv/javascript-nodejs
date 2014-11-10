/**
 * Функция возвращает окончание для множественного числа слова на основании числа и массива окончаний
 * @param  iNumber Integer Число на основе которого нужно сформировать окончание
 * @param  aEndings Array Массив слов или окончаний для чисел (1, 4, 5),
 *         например ['яблоко', 'яблока', 'яблок']
 * @return String
 */
function getNumEnding(iNumber, aEndings)
{
    var sEnding, i;
    iNumber = iNumber % 100;
    if (iNumber>=11 && iNumber<=19) {
        sEnding=aEndings[2];
    }
    else {
        i = iNumber % 10;
        switch (i)
        {
            case (1): sEnding = aEndings[0]; break;
            case (2):
            case (3):
            case (4): sEnding = aEndings[1]; break;
            default: sEnding = aEndings[2];
        }
    }
    return sEnding;
}

// ======================

function getRandomIdentifier(prefix) {
    return (prefix || '') + Math.random().toString(36).substr(2);
}

// ======================

(function ($) {
    $(document).ready(function () {
        ////////////////////////
        function positionDropdown() {
            var root = $('.dropdown.open');
            var content = $('.dropdown-cloned');
            var offsetRoot = $('body');
            var style = {};
            if (root.hasClass('down-left')) {
                style = {
                    position: 'absolute',
                    top: root.offset().top + root.outerHeight(),
                    right: $(window).width() - root.offset().left - root.outerWidth(),
                    "z-index": 9999
                }
            } else if (root.hasClass('down-right')) {
                style = {
                    position: 'absolute',
                    top: root.offset().top + root.outerHeight(),
                    left: root.offset().left,
                    "z-index": 9999
                }
            }
            if (root.hasClass('inherit-min-width')) {
                style['min-width'] = root.outerWidth();
            }
            content.css(style);
        }

        function closeAllDropdowns() {
            $('.dropdown-cloned').remove();
            $('.dropdown.open').removeClass('open');
            $(document).off('click', dropdownOuterClick);
            $(document).off('mousemove', dropdownOuterMove);
            $(document).off('touchstart', dropdownOuterClick);
            $(document).off('touchstart', dropdownOuterMove);
            $(window).off('resize', positionDropdown);
        }

        function dropdownOuterClick(e) {
            if ($(e.target).parents('.dropdown-cloned').length == 0 && !$(e.target).is('.dropdown-cloned')) {
                closeAllDropdowns();
            }
        }

        function dropdownOuterMove(e) {
            if (
                $(e.target).parents('.dropdown-cloned.dropdown__content_open_hover').length == 0
                    && !$(e.target).is('.dropdown-cloned.dropdown__content_open_hover')
                    && $(e.target).parents('.dropdown.dropdown_open_hover').length == 0
                ) {
                closeAllDropdowns();
            }
        }

        function initDropdowns() {
            $('.dropdown:not(.dropdown_open_hover):not(.dropdown_inited) .dropdown__toggle').click(function () {
                var root = $(this).parents('.dropdown');
                if (root.hasClass('open')) { closeAllDropdowns(); return; }
                closeAllDropdowns();
                var content = root.find('.dropdown__content').clone()
                    .show()
                    .addClass('dropdown-cloned');
                $('body').append(content);
                root.addClass('open');
                $(window).on('resize', positionDropdown);
                positionDropdown();
                $(document).bind('click touchstart', dropdownOuterClick);
                root.addClass('dropdown_inited');
                return false;
            });

            $('.dropdown.dropdown_open_hover:not(.dropdown_inited) .dropdown__toggle').mouseenter(function () {
                closeAllDropdowns();
                var root = $(this).parents('.dropdown');
                var content = root.find('.dropdown__content').clone()
                    .show()
                    .addClass('dropdown-cloned dropdown__content_open_hover');
                $('body').append(content);
                root.addClass('open');
                $(window).on('resize', positionDropdown);
                positionDropdown();
                $(document).bind('mousemove touchstart', dropdownOuterMove);
                root.addClass('dropdown_inited');
                return false;
            });
        }

        initDropdowns();

        ////////////////////////
        $('.search > .dropdown__toggle').click(function () {
            $('.dropdown-cloned.dropdown__content input[name="search_block_form"]').focus();
        });

        ////////////////////////

        // prevent focus/select
        $('.spoiler').on('click', '.spoiler__button', function(e) {
            $(e.delegateTarget).toggleClass('closed');
            return false;
        });


        // открытие окна с соц сетью при клике
        $('.social__soc').click(function() {
            var winHeight = 400, winWidth = 500;
            var params = 'scrollbars=no,status=no,location=no,toolbar=no,'
                         + 'menubar=no,width=' + winWidth + ',height=' + winHeight
                         + ',left=' + (screen.availWidth / 2 - winWidth / 2)
                         + ',top=' + (screen.availHeight / 2 - winHeight / 2);
            window.open($(this).attr('href'), 'share', params)
            return false;
        });

        // sticky-соц плашка
        ///////////////////////
        function updateSharing() {
            if ($('.social.aside.unfixed').offset().top - $(window).scrollTop() < 20) {
                $('.social.aside.unfixed').addClass('invisible');
                $('.social.aside.fixed').removeClass('invisible');

                if ($(document).scrollLeft() >= 0 && $(document).width() > $(window).width()) {
                    $('.social.aside.fixed').css('left', $('.social.aside.unfixed').offset().left
                        - parseInt($('.social.aside.unfixed').css('margin-left'))
                        - $(document).scrollLeft() + 'px');
                } else {
                    $('.social.aside.fixed').css('left', 'auto');
                }
            } else {
                $('.social.aside.fixed').addClass('invisible');
                $('.social.aside.unfixed').removeClass('invisible');
            }
        }

        var asideSocial = $('.social.aside');
        if (!asideSocial.data('handler') && asideSocial.length > 0) {
            asideSocial.addClass('unfixed').after(asideSocial.clone().removeClass('unfixed').addClass('fixed invisible'));
            updateSharing();
            $(window).scroll(updateSharing);
            $(window).resize(updateSharing);
            asideSocial.data('handler', true); // prevent from setting handler multiple times
        }


        // навигация по текущему уроку, sticky
        ///////////////////////
        function fixNavigation() {
            var sidebar = $('.sidebar');
            var fixedBlock = $('.sidebar .keep-visible.fixed');
            var unfixedBlock = $('.sidebar .keep-visible.unfixed');
            if ($(window).scrollTop() > ($('.sidebar__content').offset().top + $('.sidebar__content').height())) {
                unfixedBlock.addClass('invisible');
                fixedBlock.removeClass('invisible');

                if ($(document).scrollLeft() >= 0 && $(document).width() > $(window).width()) {
                    fixedBlock.css('left', unfixedBlock.offset().left - $(document).scrollLeft() + 'px');
                } else {
                    fixedBlock.css('left', 'auto');
                }

                // считаем видимую высоту сайдбара, вычитаем из нее смещение и высоту фиксированного блока
                // если меньше нуля — не помещается
                var diff = sidebar.offset().top
                    // + sidebarPaddingTop
                    + parseInt(sidebar.css('padding-top'))  // подразумеваем пиксели
                    + sidebar.height()
                    - $(window).scrollTop()
                    - parseInt(fixedBlock.css('top')) // подразумеваем пиксели
                    - fixedBlock.outerHeight();
                if (diff < 0) {
                    fixedBlock.addClass('invisible');
                } else {
                    fixedBlock.removeClass('invisible');
                }
            } else {
                unfixedBlock.removeClass('invisible');
                fixedBlock.addClass('invisible');
            }
        }

        if ($('.sidebar .keep-visible').length > 0) {
            $('.sidebar').append($('.sidebar .keep-visible')
                .addClass('unfixed')
                .clone()
                .removeClass('unfixed')
                .addClass('fixed invisible'));
            fixNavigation();
            $(window).on('scroll.sidebar', fixNavigation);
            $(window).on('resize.sidebar', fixNavigation);
        } else {
            $(window).off('.sidebar');
            $(window).off('.sidebar'); // FIXME: why two times?
        }

        // количество комментариев текущее
        ///////////////////////
        (function () {
            var s = document.createElement('script');
            s.src = 'http://learnjavascriptru.disqus.com/count.js';
            (document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
        }());

        // навигация ctrl <-   ->
        ///////////////////////
        $(document).keydown(function (e) {
            var back = $('.prev-next .prev-next__prev .prev-next__link').eq(0).attr('href');
            var forward = $('.prev-next .prev-next__next .prev-next__link').eq(0).attr('href');
            if (e.ctrlKey || e.metaKey) {
                switch (e.keyCode) {
                    case 37:
                        back && (document.location = back);
                        break;
                    case 39:
                        forward && (document.location = forward);
                        break;
                }
            }
        })

        // Для профиля карандашик справа от поля
        //////////////////////////////////////////////////////
        function startInlineEdit(jQInlineEditable) {
            jQInlineEditable.addClass('profile__inline-editable_editing');
            window.getSelection().removeAllRanges();
            // input[type='text'] is not enough, because 'text' is default type
            // if not set at all. So text input can have no type.
            jQInlineEditable.find('input:not(input[type]), input[type="text"], input[type="email"], select, textarea').first().focus();
        }

        function finishInlineEdit(jqInlineEditable) {
            jqInlineEditable.removeClass('profile__inline-editable_editing');
        }

        ////////// Demo //////////
        $('.profile').on('click', '.profile__inline-edit-trigger', function() {
            startInlineEdit($(this).parents('.profile__inline-editable'));
            return false;
        })

        $('.profile').on('dblclick', '.profile__item', function() {
            startInlineEdit($(this));
            return false;
        })

        $('.profile').on('click', '.profile__item-edit-cancel', function() {
            finishInlineEdit($(this).parents('.profile__inline-editable'))
            return false;
        })

        $('.profile').on('click', '.profile__submit', function() {
            var _self = this
            var form = $(_self).closest('form')
            $.post(form.attr('action'), form.serialize()).done(function (data){
                finishInlineEdit($(_self).parents('.profile__inline-editable'));
                $(_self).closest('tr').html(data)
            })
            return false;
        })
        //////////////////////////

        $('.profile__upic-upload').change(function() {
            $(this).parents('.profile__upic-change').submit();
        })


        // отзывы о курсах, слайдер с бендером
        //////////////////// will it leak with turbolinks or not?
        $('.slider').each(function(){
            var slider = $(this)
                , items = slider.find('.slider__items')
                , itemsList = items.find('.slider__item')
                , itemsCount = itemsList.length
                , animationDuration = 400
                , viewport
                , frames
                , frame1
                , frame2
                , frame3
                , currentItem;
            items.addClass('slider__items_hidden');
            items.wrap('<div class="slider__viewport"></div>');
            viewport = slider.find('.slider__viewport');
            viewport.append('<div class="slider__frames columns">' +
                                '<div class="slider__frame columns__col"></div>' +
                                '<div class="slider__frame columns__col"></div>' +
                                '<div class="slider__frame columns__col"></div>' +
                            '</div>');
            frames = slider.find('.slider__frames');
            frame1 = frames.find('.slider__frame:nth-child(1)');
            frame2 = frames.find('.slider__frame:nth-child(2)');
            frame3 = frames.find('.slider__frame:nth-child(3)');

            frames.css({ left: '-100%' });

            currentItem = getCurrentItem();
            frame2.append(itemsList.eq(currentItem).clone());
            itemsList.eq(currentItem).addClass('slider__item_current');
            fixButtons();

            slider.find('.slider__next').click(function(){
                slideTo(currentItem + 1);
            })

            slider.find('.slider__prev').click(function(){
                slideTo(currentItem - 1);
            })

            function slideTo(itemIndex) {
                var newHeight
                    , animateToPosition
                    , tmpFramel
                slider.find('.slider__prev, .slider__next').prop('disabled', true);
                items.find('.slider__item_current').removeClass('slider__item_current');
                if (itemIndex > currentItem) {
                    viewport.css({height: frame2.find('.slider__item').height()}); // setting height to current height
                    tmpFrame = frame3;
                    animateToPosition = '-200%';
                } else if (itemIndex < currentItem) {
                    viewport.css({height: frame2.find('.slider__item').height()}); // setting height to current height
                    tmpFrame = frame1;
                    animateToPosition = '0%';
                } else { // itemIndex == currentItem
                    return;
                }

                tmpFrame.append(itemsList.eq(itemIndex).clone());
                itemsList.eq(itemIndex).addClass('slider__item_current');

                // Two next animations run in parallel but not in sync,
                // it seems it shouldn't cause any serious problems
                frames.animate({left: animateToPosition}, animationDuration, function() {
                    frame2.find('.slider__item').remove();
                    frame2.append(tmpFrame.find('.slider__item'));
                    $(this).css({left: '-100%'});
                    slider.find('.slider__prev, .slider__next').prop('disabled', false)
                });
                viewport.animate({height: tmpFrame.find('.slider__item').height()}, animationDuration, function() {
                    $(this).height('auto');
                });

                currentItem = getCurrentItem();
                fixButtons();
            }

            function getCurrentItem() {
                var index = itemsList.index(items.find('.slider__item_current'));
                if (index == -1) {
                    return 0;
                } else {
                    return index;
                }
            }

            function fixButtons() {
                slider.find('.slider__prev, .slider__next').show();
                if (currentItem == 0) {
                    slider.find('.slider__prev').hide();
                }
                if (currentItem == itemsCount - 1) {
                    slider.find('.slider__next').hide();
                }
            }
        });

        // универсальное решение для любых табов (навигационных или в блоке кода)
        // .tabs is a container for all content and controls
        // There are .tabs__tab elements inside .tabs,
        // each of them should have .tabs__switch element inside.
        // This element will be moved to .tabs__switches container
        // that will be inserted before content inside .tabs
        // The .tabs__switch-control element will listen to clicks
        // and switch tabs. It can be placed inside .tabs__switch
        // or just added to it as .tabs__switch.tabs__switch-control
        // May be useful if only part of visible tab switch should
        // listen to clicks (e. g. only text inside tab switch).
        // No nested tabs allowed.
        $('.tabs').each(function() {
            var tabs = $(this)
                , switchesContainer
                , switchesList
                , tabsList
                , index;
            tabs.prepend('<div class="tabs__switches"></div>');
            switchesContainer = tabs.find('.tabs__switches');
            tabs.find('.tabs__switch').appendTo(switchesContainer)
            switchesList = switchesContainer.find('.tabs__switch-control');
            tabsList = tabs.find('.tabs__tab');

            if (tabs.find('.tabs__tab_current').length) {
                index = tabsList.index(tabs.find('.tabs__tab_current'));
                setCurrentTabSwitch(index);
            } else {
                tabsList.eq(0).addClass('tabs__tab_current');
                setCurrentTabSwitch(0);
            }

            switchesContainer.on('click', '.tabs__switch-control', function() {
                var clickedIndex = switchesList.index($(this));
                tabsList.removeClass('tabs__tab_current');
                tabsList.eq(clickedIndex).addClass('tabs__tab_current');
                setCurrentTabSwitch(clickedIndex);
            })

            function setCurrentTabSwitch(index) {
                var clickedItem = switchesList.eq(index);
                tabs.find('.tabs__switch_current').removeClass('tabs__switch_current');
                if (clickedItem.hasClass('tabs__switch')) {
                    clickedItem.addClass('tabs__switch_current')
                } else {
                    clickedItem.parents('.tabs__switch').eq(0).addClass('tabs__switch_current');
                }
            }

            tabs.addClass('tabs_inited');
        });

        // тоже со страницы с бендером и отзывами
        // Required elements:
        // .accordion>.accordion__item>(.accordion__switch+.accordion__content)
        // .accordion__item.accordion__item_open is open by default
        // No nested accordions allowed.
        $('.accordion').each(function() {
            var accordion = $(this);
            accordion.find('.accordion__content').wrapInner('<div class="accordion__content-inner"></div>');
            if (accordion.find('.accordion__item_open').length > 0) {
                accordion.find('.accordion__item:not(.accordion__item_open) .accordion__content').css({height: 0});
            } else {
                accordion.find('.accordion__item:gt(0)').find('.accordion__content').css({height: 0});
                accordion.find('.accordion__item').eq(0).addClass('accordion__item_open');
            }

            accordion.on('click', '.accordion__switch', function() {
                var currentItem = $(this)
                    , currentContent
                    , defaultHeight
                    , animationDuration = 400;
                if (currentItem.parents('.accordion__item_open').length == 0) { // item is closed now
                    currentContent = currentItem.parents('.accordion__item').find('.accordion__content');
                    defaultHeight = currentContent.css({height: 'auto'}).height();
                    currentContent.css({height: 0});
                    accordion.find('.accordion__item_open .accordion__content').animate({height: 0}, animationDuration, function () {
                        $(this).parents('.accordion__item_open').removeClass('accordion__item_open');
                    });
                    currentContent.animate({height: defaultHeight}, animationDuration, function () {
                        $(this).parents('.accordion__item').addClass('accordion__item_open');
                        $(this).css({height: 'auto'});
                    });
                }
            })

            accordion.addClass('accordion_inited');
        });



        // placeholder?
        // если будет нужен - стилизуемый placeholder
        function initCompactLabels() {
            $('.text-compact-label').not('.text-compact-label_inited').each(function() {
                var textCompactLabel = $(this)
                    , label = textCompactLabel.find('.text-compact-label__label')
                    , input = textCompactLabel.find('.text-compact-label__input .text-input__control');

                input.focus(function() {
                    label.hide();
                })

                input.blur(function() {
                    if (input.val() == '') {
                        label.show();
                    } else {
                        label.hide(); // if it is triggered to update dynamically added input
                    }
                })

                textCompactLabel.addClass('text-compact-label_inited');
                input.triggerHandler('blur');
            });
        };

        initCompactLabels();

        // блок [hide]
        /////////////////////////////////////////////////
        $('.hide-link').click(function(e) {
            $(this).parent().toggleClass('hide-closed hide-open');
            return false;
        });

        // для записи на курсы контрол для выбора количества участников с +-
        // $('.number-input').on('valuechanged', function(e, newVal, oldVal) {console.log(newVal + ', ' + oldVal)});

        // move state into an object and pass it to handlers
        $('.number-input').each(function() {
            var numberInput = $(this);
            var text = numberInput.find('.number-input__input');
            var value = text.prop('value') != "" ? +text.prop('value') : undefined;
            var min = numberInput.attr('data-min') != "" ? +numberInput.attr('data-min') : undefined;
            var max = numberInput.attr('data-max') != "" ? +numberInput.attr('data-max') : undefined;
            var step = +numberInput.attr('data-step') || 1;

            fixValue();

            numberInput.on('click', '.number-input__dec', decValue)
                       .on('click', '.number-input__inc', incValue)
                       .on('keydown', '.number-input__input', processKey)
                       .on('blur', '.number-input__input', fixValue);

           function incValue() {
               var newValue = (value || 0) + step;
               if (isNaN(max) || newValue <= max) {
                   updateValue(newValue);
               }
           }

           function decValue() {
               var newValue = (value || 0) - step;
               if (isNaN(min) || newValue >= min) {
                   updateValue(newValue);
               }
           }

           function processKey(e) {
               switch (e.which) {
                   case 38: incValue();
                            return false;
                   case 40: decValue();
                            return false;
               }
           }

           function fixValue() {
               var currentValue = +text.prop('value');
               if (isNaN(currentValue) || (isFinite(min) && currentValue < min)) {
                   updateValue(min || 0);
                   return;
               }

               if (isFinite(max) && currentValue > max) {
                   updateValue(max);
                   return;
               }

               updateValue(currentValue);
           }

           function updateValue(newVal) {
               var oldVal = value;
               value = newVal;
               text.prop('value', newVal);
               // value may be updated to the same when fixing incorrect input
               // on blur in some cases
               if (oldVal != newVal) {
                   numberInput.trigger('valuechanged', [newVal, oldVal]);
               }
           }
        });

        // выбор метода оплаты
        ///////////////////////////////////////////////////
        // pay-method block behaviour (just demo, block not finished yet)
        $('.pay-method__radio').removeAttr('checked');
        $('.pay-method__insert').hide();
        $('.pay-method__radio_bank-bill').click(function() {
            var root = $(this).parents('.pay-method').first();
            // root.find('.pay-method__insert').hide();
            root.find('.pay-method__insert_bank-bill').show();
        });

        $('.pay-method__insert .form-insert__close').click(function() {
            $(this).parents('.pay-method__insert').first().hide();
            $(this).parents('.pay-method').first().find('.pay-method__radio').removeAttr('checked');
        });

        // код для формы курса
        // количество мест, email'ы участников...
        // There can be only one form, but just don't run the code if there is no form at all
        $('.request-form').each(function() {
            var participantsAmount = +$('.order-form__control_amount .number-input__input').prop('value');
            var emails = [];
            var form = $(this).find('.complex-form__request-form');
            var price = +form.attr('data-price');
            var user = form.attr('data-useremail');
            var usdCourse = +form.attr('data-usd-course');
            var selfUser = form.find('#request-participant');
            var userIncluded = false; // we'll need to add user at first
            var selfUserChecked = selfUser.prop('checked');
            var listTrigger = form.find('.order-form__participants-trigger');
            var particicpantsListWrap = form.find('.order-form__participants');
            var listVisible = false; // by default is hidden

            $('.order-form__control_amount').on('valuechanged', function(e, newVal, oldVal) {
                participantsAmount = newVal;
                if (newVal > oldVal) {
                    addEmail(newVal - oldVal);
                } else {
                    removeEmail(oldVal - newVal);
                }
                updatePrice();
                fillAddresses();
                fixParticipantSwitch();
                fixParticipants();
            });

            form.on('input change', '.order-form__email', updateEmails)
                .on('input change', '.order-form__email', fixParticipantSwitch);

            selfUser.click(function(){
                if($(this).prop('checked')) {
                    addOwner();
                    selfUserChecked = true;
                } else {
                    removeOwner();
                    selfUserChecked = false;
                }
                fixParticipants();
            });

            updatePrice();

            // sometimes it's cached after page refresh
            selfUser.prop('checked', true).removeAttr('disabled');
            selfUserChecked = selfUser.prop('checked');

            listTrigger.on('click', function() {
                if (listVisible) {
                    removeList();
                } else {
                    addList();
                }
            });

            $('.order-form__close').on('click', removeList);

            form.attr('novalidate', 'nodalidate');

            // + form parts //

            form.find('.request-form__step-contact, .request-form__step-payment, .request-form__step-confirm').hide();

            form.find('#pay-form-contract').prop('checked', false).click(function() {
                if($(this).prop('checked')) {
                    form.find('.pay-form__contract-info').show();
                } else {
                    form.find('.pay-form__contract-info').hide();
                }
            });
            form.find('.pay-form__contract-info').hide();

            form.find('.order-form__submit').click(function() {
                if (validateEmails() == false) {
                    return false
                }
                form.find('.request-form__step-order').hide();
                form.find('.request-form__step-contact').show();
                $('.receipts__receipt_last').removeClass('receipts__receipt_last');
                $('.request-form__order').addClass('receipts__receipt_last').removeClass('receipts__receipt_pending');
                $('.request-form__next-contact').addClass('complex-form__next-item_finished');
            });
            form.find('.contact-form__submit').click(function() {
                form.find('.request-form__step-contact').hide();
                form.find('.request-form__step-payment').show();
                $('.receipts__receipt_last').removeClass('receipts__receipt_last');
                $('.request-form__contact').addClass('receipts__receipt_last').removeClass('receipts__receipt_pending');
                $('.request-form__next-pay').addClass('complex-form__next-item_finished');
            });
            form.find('.pay-form__submit, .pay-form__later').click(function() {
                form.find('.request-form__step-payment').hide();
                form.find('.request-form__step-confirm').show();
                $('.receipts__receipt_last').removeClass('receipts__receipt_last');
                $('.request-form__payment').addClass('receipts__receipt_last').removeClass('receipts__receipt_pending');
                $('.request-form__next-confirm').addClass('complex-form__next-item_finished');
            });

            // - form parts //

            function fixParticipants() {
                if (!selfUserChecked || participantsAmount > 1) {
                    particicpantsListWrap.removeClass('order-form__participants_hidden');
                } else {
                    particicpantsListWrap.addClass('order-form__participants_hidden');
                }
            }

            function addList() {
                $('.order-form__participants-addresses')
                    .removeClass('order-form__participants-addresses_hidden')
                    .append('<ul class="order-form__participants-list"></ul>');

                addEmail(participantsAmount);
                if (selfUserChecked && !userIncluded) {
                    addOwner();
                } else if (selfUserChecked) {
                    addOwner(false);
                } else {
                    fillAddresses();
                }
                listVisible = true;
            }

            function removeList() {
                $('.order-form__participants-list').remove();
                $('.order-form__participants-addresses').addClass('order-form__participants-addresses_hidden');
                listVisible = false;
            }

            function addEmail(amount) {
                amount = amount || 1; // let the function be called without argument
                var emailsHtml = '';
                var startIndex = form.find('.order-form__participant').length + 1;

                for (var i = startIndex; i < startIndex + amount; i++) {
                    emailsHtml += getEmailItem(i);
                }

                form.find('.order-form__participants-list').append(emailsHtml);
                initCompactLabels();

                function getEmailItem(itemNumber) {
                    var emaiString = '<li class="order-form__participant"><label '
                                      + 'class="order-form__participant-label" for="participant-'
                                      + itemNumber + '">Участник ' + itemNumber + ':</label>'
                                      + '<div class="text-compact-label text-compact-label_small"><label for="participant-'
                                      + itemNumber +'" '
                                      + 'class="text-compact-label__label order-form__participant-hint">email</label>'
                                      + '<span class="text-input text-input_small text-compact-label__input order-form__email-wrap">'
                                      + '<input type="email" class="text-input__control order-form__email"'
                                      + ' id="participant-' + itemNumber + '" name="participant-' + itemNumber + '">'
                                      + '</span>'
                                      + '</div></li>';

                    return emaiString;
                }
            }

            function removeEmail(amount) {
                amount = amount || 1; // let the function be called without argument
                form.find('.order-form__participant').slice(amount * -1).remove();
            }

            function updatePrice() {
                form.find('#request-price').text(participantsAmount * price);
                form.find('#request-usd').text(Math.ceil(participantsAmount * price / usdCourse));
            }

            function updateEmails() {
                var self = $(this);
                // we could parse id, but I don't want to rely on id format in case it changes
                var index = form.find('.order-form__email').index(this);

                emails[index] = self.prop('value');
            }

            function fixParticipantSwitch() {
                if (findGap() == -1 && !form.find('#request-participant').prop('checked')) {
                    form.find('#request-participant').attr('disabled', 'disabled');
                } else {
                    form.find('#request-participant').removeAttr('disabled');
                }
            }

            function fillAddresses() {
                form.find('.order-form__email').each(function(i) {
                    // 'blur' is triggered to hide hint on filled fields. Awful, I know
                    $(this).prop('value', emails[i] || '').triggerHandler('blur');
                });
            }

            function findGap() {
                for (var i = 0; i < participantsAmount; i++) {
                    if ($.trim(emails[i]) == '' || emails[i] === undefined) {
                        return i;
                    }
                }
                return -1;
            }

            function addOwner(completely) {
                // if completely == false we just make the field inactive and change label
                var gap;
                if (completely === undefined) { completely = true }
                if (completely) {
                    gap = findGap();
                    if (gap > -1) {
                        emails.splice(gap, 1);
                        emails.unshift(user);
                        userIncluded = true;
                    }
                }
                fillAddresses();
                form.find('.order-form__email').first().attr('disabled', 'disabled');
                form.find('.order-form__participant-label').first().text('Участник 1 (вы):');
            }

            function removeOwner() {
                emails.shift();
                form.find('.order-form__email').first().removeAttr('disabled');
                form.find('.order-form__participant-label').first().text('Участник 1:');
                fillAddresses();
                userIncluded = false;
            }

            function isEmail(string) {
                return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test($.trim(string));
            }

            function validateEmails() {
                var isValid = true;

                form.find('.order-form__participant .text-input_invalid')
                    .removeClass('text-input_invalid');

                form.find('.order-form__email').each(function(i) {
                    var value = $.trim($(this).prop('value'));
                    if (value !== '' && isEmail(value) == false) {
                        isValid = false;
                        $(this).parents('.order-form__email-wrap')
                               .addClass('text-input_invalid');
                    }
                });

                return isValid;
            }
        });

        // для формы заказа учебника (открывает следующий раздел формы, временно для вёрстки)
        $('.order-book').each(function() {
            var root = $(this);
            var form = root.find('.complex-form__order-book');
            form.find('.order-book__step-confirm').hide();

            // Demo, add logic here
            // form.find('.pay-method__radio').click(function() {
            //     root.find('.receipts__receipt_pending')
            //         .removeClass('receipts__receipt_pending')
            //         .last().addClass('receipts__receipt_last');
            //     root.find('.order-book__step-order').hide();
            //     root.find('.order-book__step-confirm').show();
            //     root.find('.order-book__next-contact').addClass('complex-form__next-item_finished');
            // })
        });

        // ссылка для оплаты не из россии
        $('.pay-hint').each(function() {
            // at first we have to move the content to the top of the DOM to display correctly
            var content = $(this).find('.pay-hint__content').addClass('pay-hint__content_detached').detach();
            content.prepend('<button class="close-button pay-hint__close" type="button" title="закрыть">Закрыть</button>');
            content.find('.pay-hint__close').click(function() {
                $.modal.close();
            })
            $('body').prepend(content);
            // then we use rel="modal:open" and href="#content-id" on a link
        });

        // для ввода телефона с кодом страны
        // don't put addFlag into global scope
        // подключается плагин select2 (он жирный, мб убрать?)
        // только select2 умел показать флажки стран
        // (и можно выбирать клавиатурой вверх-вниз, как в стандартном селекте)
        $('.full-phone').each(function() {
            function addFlag(code) {
                var flag = $(code.element).data('flag');
                if (!code.id || flag === undefined) return code.text;
                return '<span class="flag flag_' + flag + '"></span>' + code.text;
            }

            $(this).find('.full-phone__codes').select2({
                dropdownCssClass: 'select2-drop_nofilter',
                formatResult: addFlag,
                formatSelection: addFlag,
                escapeMarkup: function(m) { return m; }
            });
        });

        // постраничная навигация в результатах поиска, со скроллом
        // есть фантомный баг в Firefox: ширина полосы для бегунка вычисляется неверно,
        // больше чем надо, и до конца список страниц невозможно прокрутить
        //////////////////////////////////
        $('.pager').each(function(){
            var pager = $(this);
            var pagerWidth = pager.width();
            var pagesNumber = pager.data('pages');
            var urlMask = pager.data('url');
            var pagesList = $('<div class="pager__pages-wrap"><table class="pager__pages"><tr class="pager__pages-row"></tr></table></div>');
            var pagesListRow = pagesList.find('tr');
            var pageWidth = 40;
            var pagesWidth = pageWidth * pagesNumber;
            var currentPage = pager.data('current-page') || 1;
            var scrollbar, scrollHandle, currentPageElem, currentElemOffset, url;

            function scrollPager(event) {
                var start = scrollHandle.data('dragStart');
                var startPosition = scrollHandle.data('startPosition');
                var maxPosition = scrollbar.width() - scrollHandle.width();
                var position = Math.max(0, Math.min(event.pageX - start + startPosition, maxPosition));

                scrollHandle.css('left', position);
                pager.find('.pager__pages').css('left', -1 * (parseInt(scrollHandle.css('left')) * (pagesWidth / pagerWidth)));
            }

            function disableScroll() {
                $(document).off('mousemove', scrollPager)
                           .off('mouseup', disableScroll);
            }

            function initPages() {
                for (var i = 1; i < pagesNumber + 1; i++) {
                    url = urlMask.replace('{n}', i);
                    if (i == currentPage) {
                        pagesListRow.append('<td class="pager__page"><span class="pager__page-link pager__page-link_current">' + i + '</span></td>');
                    } else {
                        pagesListRow.append('<td class="pager__page"><a href="'+ url +'" class="pager__page-link">' + i + '</a></td>');
                    }
                }

                pagesList.find('.pager__pages').width(pagesWidth);
                pager.empty();
                pager.append(pagesList);
            }

            function initScroll() {
                if (pagesWidth > pagerWidth) {
                    pager.append($('<div class="pager__scroll"><div class="pager__scroll-handle"></div></div>'));
                    scrollbar = pager.find('.pager__scroll');
                    scrollHandle = pager.find('.pager__scroll-handle');
                    scrollHandle.width(pagerWidth * (scrollbar.width() / pagesWidth));
                    scrollHandle.on('mousedown', function(event) {
                        var handle = $(this);
                        handle.data('dragStart', event.pageX).data('startPosition', parseInt(handle.css('left')) || 0);
                        $(document).on('mousemove', scrollPager)
                                   .on('mouseup', disableScroll);
                    });
                }
            }

            function positionCurrent() {
                currentPageElem = pager.find('.pager__page-link_current');
                scrollbar = pager.find('.pager__scroll');
                scrollHandle = pager.find('.pager__scroll-handle');
                if (scrollbar.length != 0 && currentPageElem.length != 0) {
                    currentElemOffset = -1 * (currentPageElem.position().left - pagerWidth / 2 + currentPageElem.width() / 2);
                    currentElemOffset = Math.min(0, Math.max(currentElemOffset, -1 * (pagesWidth - pagerWidth)));
                    pager.find('.pager__pages').css('left', currentElemOffset);
                    scrollHandle.css('left', -1 * currentElemOffset * pagerWidth / pagesWidth);
                }
            }

            function addPageByPage() {
                var pageByPage = $('<div class="pager__pagebypage">'+
                    '<div class="pager__shortcut pager__shortcut_prev"><kbd>Ctrl + <span class="pager__arr">&larr;</span></kbd></div>' +
                    '<div class="pager__numberofpages"></div>' +
                    '<div class="pager__shortcut pager__shortcut_next"><kbd>Ctrl + <span class="pager__arr">&rarr;</span></kbd></div>' +
                    '</div>');
                var next = null, prev = null;

                pageByPage.find('.pager__numberofpages').text(pagesNumber + ' ' + getNumEnding(pagesNumber, ['страница', 'страницы', 'страниц']));

                if (currentPage == 1) {
                    $('<span class="pager__pagelink pager__pagelink_disabled">Предыдущая страница</span>')
                        .insertBefore(pageByPage.find('.pager__shortcut_prev kbd'));
                } else {
                    prev = urlMask.replace('{n}', currentPage - 1);
                    $('<a href="' + prev + '" class="pager__pagelink">Предыдущая страница</a>')
                        .insertBefore(pageByPage.find('.pager__shortcut_prev kbd'));
                }

                if (currentPage == pagesNumber) {
                    $('<span class="pager__pagelink pager__pagelink_disabled">Следующая страница</span>')
                        .insertBefore(pageByPage.find('.pager__shortcut_next kbd'));
                } else {
                    next = urlMask.replace('{n}', currentPage + 1);
                    $('<a href="' + next + '" class="pager__pagelink">Следующая страница</a>')
                        .insertBefore(pageByPage.find('.pager__shortcut_next kbd'));
                }

                $(document).keydown(function (e) {
                    if (e.ctrlKey || e.metaKey) {
                        switch (e.keyCode) {
                            case 37:
                                prev && (document.location = prev);
                                break;
                            case 39:
                                next && (document.location = next);
                                break;
                        }
                    }
                });

                pager.append(pageByPage);
            }

            initPages();
            initScroll();
            positionCurrent();
            addPageByPage();
        });


        // страница результатов поиска по сайту
        // sticky результат поиска сверху
        $('.search-query').each(function() {
            var queryForm = $(this);
            var mainContainer = $('.main'); // used for size and position calculations
            var regularForm = queryForm.find('.search-query__wrap_regular');
            var fixedForm = queryForm.find('.search-query__wrap_fixed');
            var fixedFormTopPadding = parseInt(fixedForm.find('.search-query__input-wrap').css('paddingTop'));
            var jqWindow = $(window);

            function updateFixedForm() {
                fixedForm.css({
                    'left': mainContainer.offset().left - jqWindow.scrollLeft(),
                    'width': mainContainer.width(),
                    'padding-left': mainContainer.css('paddingLeft'),
                    'padding-right': mainContainer.css('paddingRight')
                })
            }

            function syncRegularToFixed() {
                fixedForm.find('.search-query__input').val(regularForm.find('.search-query__input').val());
            }

            function syncFixedToRegular() {
                regularForm.find('.search-query__input').val(fixedForm.find('.search-query__input').val());
            }

            if (fixedForm.length > 0) {
                $('.main').append(fixedForm);
                jqWindow.scroll(function() {
                    if ((jqWindow.scrollTop() - queryForm.offset().top) >= fixedFormTopPadding) {
                        if (fixedForm.hasClass('search-query__wrap_hidden')) {
                            syncRegularToFixed();
                            fixedForm.removeClass('search-query__wrap_hidden');
                            regularForm.css({'visibility': 'hidden'});
                            jqWindow.on('resize', updateFixedForm);
                            jqWindow.on('scroll', updateFixedForm);
                            setTimeout(updateFixedForm, 0);
                        }
                    } else {
                        if (!fixedForm.hasClass('search-query__wrap_hidden')) {
                            fixedForm.addClass('search-query__wrap_hidden');
                            regularForm.css({'visibility': 'visible'});
                            jqWindow.off('resize', updateFixedForm);
                            jqWindow.off('scroll', updateFixedForm);
                            syncFixedToRegular();
                        }
                    }
                });
            }
        });

        // блок кода с табами на разные файлы
        // недоделан
        ///////////////////////////////////////////////////////////////
        $('.code-tabs.tabs_inited').each(function() {
            var root = $(this);
            var link = root.data('link');
            var uniqueClass = getRandomIdentifier('complex-code_');
            for ( ; $('.' + uniqueClass).length > 0 ; ) {
                uniqueClass = getRandomIdentifier('complex-code_');
            }

            root.addClass(uniqueClass);
            root.find('.tabs__switches')
                   .wrap('<div class="complex-code__tools-wrap"><div class="complex-code__tools"></div></div>');
            root.find('.complex-code__tools-wrap')
                .append(['<div class="complex-code__files dropdown down-right inherit-min-width">',
                    '<div class="complex-code__files-toggle dropdown__toggle">все файлы</div>',
                    '<div class="dropdown__content complex-code__dropdown">',
                        '<div class="complex-code__dropdown-inner"></div>',
                    '</div>',
                '</div>'].join(''));
            root.find('.complex-code__dropdown').attr('data-parent', uniqueClass)
                                                   .find('.complex-code__dropdown-inner')
                                                   .append(root.find('.tabs__switch').clone());
            if (link) {
                root.find('.complex-code__tools-wrap')
                    .append('<a href="' + link + '" target="_blank" class="complex-code__open"></a>');
            }
            initDropdowns();
        });

        $('.code-tabs.tabs_inited').first().each(function() {
            $(document).on('click.code-tabs', '.complex-code__dropdown .tabs__switch-control', function() {
                var jqComplexCodeDropdownItem = $(this);
                var jqComplexCodeDropdown = jqComplexCodeDropdownItem.parents('.complex-code__dropdown');
                var jqComplexCode = $('.' + jqComplexCodeDropdown.data('parent'));
                var index = jqComplexCodeDropdown.find('.tabs__switch-control').index(jqComplexCodeDropdownItem);

                jqComplexCode.find('.tabs__tab').removeClass('tabs__tab_current')
                                                .eq(index)
                                                .addClass('tabs__tab_current');
                jqComplexCode.find('.tabs__switch').removeClass('tabs__switch_current')
                                                   .eq(index)
                                                   .addClass('tabs__switch_current');
                closeAllDropdowns();
            });
        });

        // подсветка текущего раздела в сайдбаре, при скролле
        // run initialization once if there is at least one block,
        // all blocks are inited at once
        $('.page-contents').first().each(function() {
            var fadeTimeout;
            var headers = $('.main > h2 > a[href^=\'#\']');
            var currentHeader, jqCurrentHeader, i;

            $(window).off('.pageContents'); // turbolinks
            $(window).on('scroll.pageContents', function() {
                $('.page-contents.fixed:not(.invisible):not(.page-contents_fading):not(.page-contents_faded)').each(function() {
                    $(this).addClass('page-contents_fading');
                    fadeTimeout = setTimeout(function() {
                        $('.page-contents.fixed.page-contents_fading').animate({ 'opacity': 0.35 }, 2000, 'linear', function() {
                            $(this).removeClass('page-contents_fading').addClass('page-contents_faded');
                        })
                    }, 10 * 1000);
                });

                $('.page-contents.fixed.invisible.page-contents_fading, .page-contents.fixed.invisible.page-contents_faded').each(function() {
                    clearTimeout(fadeTimeout);
                    $(this).removeClass('page-contents_fading page-contents_faded').css({ 'opacity': 1 });
                });
            });
            $(window).on('scroll.pageContents', function() {
                for (i = headers.length - 1; i >=0 ; i--) {
                    if (
                        $(window).scrollTop() >= headers.eq(i).offset().top
                       ) {
                        if (currentHeader == headers.eq(i).text()) {
                            break;
                        }
                        jqCurrentHeader = headers.eq(i)
                        currentHeader = jqCurrentHeader.text();

                        $('.page-contents .page-contents__link_active').removeClass('page-contents__link_active');
                        $('.page-contents').find('a[href$="#' + jqCurrentHeader.attr('id') + '"]').addClass('page-contents__link_active');

                        break;
                    }
                }
            });

            $('.sidebar').off('.pageContents'); // turbolinks
            $('.sidebar').on('mouseenter.pageContents mouseleave.pageContents', '.page-contents.fixed.page-contents_faded', function(e) {
                var fixedContents = $(this);
                if (e.type == 'mouseenter') {
                    fixedContents.animate({ 'opacity': 1 }, 200);
                } else {
                    fixedContents.animate({ 'opacity': .35 }, 600);
                }
            });
        });
    });

})(jQuery);

function runDemo(node) {
    var node = $(node);
    var demoPre;
    while(node.length) {
        var demo = node.find('[data-demo]');
        if (demo.length) break;
        node = node.parent();
    }

    demo = demo[0];
    if (!demo) return;
    var code = demo.code;
    eval(code);
}

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = elem.offset().top;
    var elemBottom = elemTop + elem.outerHeight();

    var visibleHeight = 0;
    if (elemTop <= docViewTop) {
        visibleHeight = elemBottom - docViewTop;
    } else if (elemBottom >= docViewBottom) {
        visibleHeight = docViewBottom - elemTop;
    } else {
        visibleHeight = elemBottom - elemTop;
    }

    return visibleHeight > 10;
}
