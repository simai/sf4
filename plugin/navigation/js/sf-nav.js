;(function($, window, document, undefined) {

    //alert('Основной SCRIPT');
    //alert('Основной SCRIPT');
    
// ========= DEFAULTS PARAMS ========= //

    $.sfNavMulti = function(element, options) {
// ========= DEFAULTS PARAMS ========= //
        var defaults = {
            mobileWidth: 767,
            overlay: true,
            overlayColor: "rgba(0, 0, 0, 0.7)",
            hideScrollBar: true,
            offCanvasSide: 'left',
            onInit: function() {},
            onShowOffCanvas: function() {},
            onHideOffCanvas: function() {},
    // ================ horisonatal navigation transformMenu ================ //
            transformInit: false,
            transformThreshold: 1,
            transformCutoff: 0,
            iconMenu: '<i class="far fa-ellipsis-h fa-lg" aria-hidden="true"></i>',
    // ================ end flexMenu ================ //
            fixedInit: false,
            fixedId: '#sf-nav-id',
            topSpace: 0,
    // ================ end flexMenu ================ //            
            leftFlag: false,
//============== TOP ==============//
            transformFlag: true,
            transformPaddingOne: 'p-3',
            transformPaddingLower: 'p-2',
            transformTheme: 'theme-dark',
            transformEffectHover: 'underline',
            fullScreenFlag: true,
            fullScreenTheme: 'theme-dark',
            fixedFlag:true,
            fixedClass: 'nav-fixed',
            mobileFlag:true,
            transferHeadingItem: false,
            searchContainer: false,
            horizontalSubmenu: false,
			positionY:false,
        };
// ========= PLUGIN EVENTS ========= //
        var plugin = this,
            widthW = 0,
            heightW = 0;           
        plugin.settings = {};
        var $element = $(element), element = element;
        // PLUGIN INIT
        plugin.init = function() {
            //window.addEventListener('DOMContentLoaded', function() {
                plugin.settings = $.extend({}, defaults, options);
            if(plugin.settings.leftFlag)
                leftCatalog();
            else {
                var section = $(element).find('.center-section');
                if(!section.find('> ul.nav-items').hasClass('flex-wrap'))
                    section.find('> ul.nav-items').addClass('flex-wrap');
                if(section.hasClass('overflow-hidden'))
                    section.removeClass('overflow-hidden');
                section.attr('style', '');

                $(element).find('.btn-mobile').on('click touchend', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    plugin.showOffcanvas();
                    mobileMode();
                    document.body.style.overflow = 'hidden';
                });

                $(element).find('.sf-close').on('click touchend', function() {
                    plugin.hideOffcanvas();
                    document.body.style.overflow = 'auto';
                });

                if(plugin.settings.fullScreenFlag) {
                    $(element).find(".btn-full-screen").on('click touchend', function() {
                        fullScreenMode();
                        plugin.showNav();
                    });
                }

                $(element).find(".btn-search, .sf-close").on("click touchend keyup", function(e) {
                    e.stopPropagation(); 
                    e.preventDefault();
                    var code = e.keyCode || e.which;
                    if(e.type === "click" || e.type === "touchend" || (e.type === "keyup" && code == 13))
                        plugin.toggleSearch();
                    else if(code == 9) $(e.target).blur();
                    
                });
                
                if(plugin.settings.transformFlag) {
                    widthW = windowWidth();
                    heightW = windowHeight();
                    
                    $(window).resize(function() {
                        if(windowWidth() < widthW || windowHeight() < heightW) {
                            transformMode(true);                                
                            transformMode(false);                        
                        } else if(windowWidth() > widthW || windowHeight() > heightW) {
                            transformMode(true);
                            transformMode(false);
                        }                    
                        widthW = windowWidth();
                        heightW = windowHeight();

                        if(plugin.settings.horizontalSubmenu) {
                            //horizontalMode();
                        }
                    });
                    transformMode(false);
                }
                if(plugin.settings.fixedFlag) fixedMode();
                if(plugin.settings.overlay) $(element).append('<div class="nav-overlay"></div>');
                if(plugin.settings.transferHeadingItem) transferItem();

                if(plugin.settings.horizontalSubmenu) {
                    //horizontalMode();
                }
                
            }
            //});
            

        };

        var transferItem = function() {
            $(element).find('.transfer-item').css('white-space', 'normal');
        }

        // show the overlay panel
        var showOverlay = function(){
            if(plugin.settings.hideScrollBar) $("body").addClass("no-scroll");
            
            if(plugin.settings.overlay){
                $(element).find(".nav-overlay")
                    .css("background-color", plugin.settings.overlayColor)
                    .fadeIn(300)
                    .on("click touchend", function(){
                        plugin.hideOffcanvas();
                         document.body.style.overflow = 'auto';                   
                    });
            }
        };
        
        // hide the overlay panel
        var hideOverlay = function(){
            if(plugin.settings.hideScrollBar){
                $("body").removeClass("no-scroll");
            }
            if(plugin.settings.overlay){
                $(element).find(".nav-overlay").fadeOut(400);
            }
        };
 
        // show offcanvas
        plugin.showOffcanvas = function(){
            showOverlay();
            if(plugin.settings.offCanvasSide == "left"){
                $(element).find(".center-section").css("transition-property", "left").addClass("open-mobile");
                
                var mobileWidth = windowWidth();

                var textMenu = $('ul.transform-submenu').html();
                var navMenu = $('ul.transform-submenu > li');
                var textMenu2 = $('ul.nav-menu').slice(0, (navMenu.length - 1)).html();
                if(textMenu) {
                    $('ul.transform-submenu').html('');
                    $('ul.transform-submenu').html(textMenu2 + textMenu);
                    $('.transform-submenu').detach() 
                } 
                else textMenu = $('ul.transform-submenu').html();
            }
            else $(element).find(".center-section").css("transition-property", "right").addClass("open-mobile");
        };
        
        // hide offcanvas 
        plugin.hideOffcanvas = function() {          
            $(element).find(".center-section").removeClass("open-mobile")
                .on("webkitTransitionEnd moztransitionend transitionend oTransitionEnd", function(){
                    $(element).find(".center-section")
                        .css("transition-property", "none")
                        .off();
            });

            $(element).find(".mobile-level").removeClass("open-mobile")
                .on("webkitTransitionEnd moztransitionend transitionend oTransitionEnd", function(){
                    $(element).find(".mobile-level")
                        .css("transition-property", "none")
                        .off();
            });
            hideOverlay();
        };
        
        // toggle offcanvas
        plugin.toggleOffcanvas = function(){
            if(windowWidth() <= plugin.settings.mobileBreakpoint){
                if($(element).find(".center-section").hasClass("open-mobile")) plugin.hideOffcanvas();
                else plugin.showOffcanvas();
            }
        };
        
        // show/hide the search form
        plugin.toggleSearch = function(){
            if($(element).find(".nav-search").find("form").css("display") == "none"){
                $(element).find(".nav-search").find("form").css('display', 'flex');
                $(element).find(".nav-search").find("input").focus();
                if(plugin.settings.searchContainer) $(element).css('position', 'relative');
            }
            else{
                $(element).find(".nav-search").find("form").css('display', 'none');
                $(element).find(".nav-search").find("input").blur();
                if(plugin.settings.searchContainer) $(element).css('position', 'static');
            }
        };
// ========= FULL.SCREEN.MENU ========= //
        var fullScreenMode = function() {
            plugin.showNav = function() {
                $('.sf-nav-full-screen').addClass(plugin.settings.animation).fadeIn(300, function(){
                    $('html,body').css('overflow', 'hidden');
                });
                adjustMenuPadding();
            }

            var subElement = function(el) {
                var strSubLevel = '';
                $subElem = $(el).children('div.mobile-level').children('ul.submenu-items');

                if($subElem.length > 0) {
                    //console.log($subElem.children('li')[0]);
                    var index = 0;
                    $subElem.children('li').each(function() {
                        if(index != 0) {
                            $subLevelUp = $(this);
                            if($(this).find('ul.submenu-items').length > 0) {

                            }
                            strSubLevel += '<li>' + $(this).html().substr(0, ($(this).html().indexOf('</span>', 0) + 7)) + '</span>';
                            if($subLevelUp.children('div.mobile-level').children('ul.submenu-items').length > 0) {
                                strSubLevel += '<span class="submenu-indicator item-icon"><i class="fal fa-angle-down" aria-hidden="true"></i></span></a>'
                                            + '<ul class="sf-full-screen-sub-level">' + subElement($subLevelUp) + '</ul></li>'
                            } else strSubLevel += '</a></li>';
                        }
                         index++;
                    });

                    strSubLevel += '</li>';

                    return strSubLevel;
                }
                return strSubLevel;
            }

            plugin.initFullScreen = function() {
                var fullScreenWindow = '<div class="sf-nav-full-screen ' + plugin.settings.fullScreenTheme + '">'
                                    + '<div class="sf-nav-full-screen-header">';

                $strE = $(element).find('.left-section').find('.nav-brand');
                if($strE.length > 0) {
                    fullScreenWindow += '<div class="sf-nav-full-screen-brand">' + $strE[0].outerHTML + '</div>';
                }
                fullScreenWindow += '<button class="sf-close t-1 sf-close-center"></button>';
                fullScreenWindow += '</div><div class="sf-nav-full-screen-content">'
                                + '<div class="sf-nav-full-screen-lists sf-scroll">';

                $(element).children('section.center-section')
                            .children('ul.nav-items')
                            .find('> li').each(function() {
                                var  trans = this.querySelector('a.btn-transform');
                                if(trans != null) {
                                    $(this).children('ul.transform-submenu').find('> li').each(function() {
                                        var tagLi = '<ul class="sf-nav-full-screen-list">'
                                            + '<li class="sf-nav-full-screen-list-header">'
                                            + $(this).html().substr(0, ($(this).html().indexOf('</span>', 0) + 7))
                                            + '</span></a></li>';
                                        $flagSubL = $(this);
                                        tagLi += subElement($flagSubL);
                                        tagLi += '</ul>';
                                        fullScreenWindow += tagLi;
                                    });
                                } else {
                                    var tagLi = '<ul class="sf-nav-full-screen-list">'
                                        + '<li class="sf-nav-full-screen-list-header">'
                                        + $(this).html().substr(0, ($(this).html().indexOf('</span>', 0) + 7))
                                        + '</span></a></li>';
                                    $flagSubL = $(this);
                                    tagLi += subElement($flagSubL);
                                    tagLi += '</ul>';
                                    fullScreenWindow += tagLi;
                                }
                            });
                      fullScreenWindow += '</div></div></div>';
                      $('body').append(fullScreenWindow); 
            };

            plugin.initEvents = function() {
                var opts = this.settings;
                $elem = $('.sf-nav-full-screen-lists');
                $elem.children("ul").find("span.item-icon").bind("click touchend", function(e){
                    
                    e.stopPropagation(); 
                    e.preventDefault();
    
                    if($(this).parent().siblings('.sf-full-screen-sub-level').length > 0) {
                        if($(this).parent().siblings('.sf-full-screen-sub-level').css("display") == "none") {
                            $(this).parent().siblings('.sf-full-screen-sub-level').css("display", 'flex');
                            $(this).addClass("submenu-indicator-minus");
                            return false;
                        }
                        else $(this).parent().siblings('.sf-full-screen-sub-level').css("display", 'none');
                        if($(this).hasClass("submenu-indicator-minus")) $(this).removeClass("submenu-indicator-minus");
                    }
                });
            };
            
            plugin.hideNav = function() {
                $('.sf-nav-full-screen').removeClass('zoom').fadeOut('300');
                $('html,body').css('overflow', 'auto');  
            }
            
            var buttonHideNav = function() {
                $('.sf-nav-full-screen').children('.sf-nav-full-screen-header').children(".sf-close").on("click touchend", function() {
                    plugin.hideNav();
                });
            }
    
            var adjustMenuPadding = function() {
                var contentHeight = $(element).find(".sf-nav-full-screen-content").innerHeight();
                var innerElementsHeight = $(element).find(".full-screen-nav-menu, .sf-nav-full-screen-lists, .full-screen-nav-boxes, .full-screen-nav-circles, .full-screen-nav-general").innerHeight();
                if(innerElementsHeight > contentHeight){
                    $(element).find(".sf-nav-full-screen-content").css("padding-top", contentDefaultPaddingTop);
                }
                else{
                    $(element).find(".sf-nav-full-screen-content").css("padding-top", (contentHeight - innerElementsHeight) / 2);
                }
            }

            plugin.initFullScreen();
            plugin.initEvents();
            buttonHideNav();

            $(window).resize(function(){
                adjustMenuPadding();
            });
            
        }
// ========= END FULL.SCREEN.MENU ========= //
// ========= FLEX.MENU ========= //
        var transformMode = function(undo) {
            var $this = $(element).children('.center-section').children('ul'),
            $items = $this.find('> li'),
            $firstItem = $items.first(),
            $lastItem = $items.last(),
            numItems = $this.find('li').length,
            firstItemTop = Math.floor($firstItem.offset().top),
            firstItemHeight = Math.floor($firstItem.outerHeight(true)),
            $lastChild,
            keepLooking,
            $moreItem,
            $moreLink,
            numToRemove,
            allInPopup = false,
            $menu,
            i;

            function needsMenu($itemOfInterest) {
                if($itemOfInterest !== undefined) {
                    if((Math.ceil($itemOfInterest.offset().top)) >= (firstItemTop + firstItemHeight))
                        return true;
                    else return false;
                } else return false;
                
            }
            if(needsMenu($lastItem) && numItems > plugin.settings.transformThreshold && !undo && $this.is(':visible')) {
                if(windowWidth() > plugin.settings.mobileWidth) {
                    var $popup = $('<ul class="transform-submenu nav-dropdown nav-submenu m-0 p-0 flex-column mobile-level ' + plugin.settings.transformTheme + '"></ul>');
                    $popup.addClass('');
                    for(i = numItems; i > 1; i--) {
                        $lastChild = $this.find('> li:last-child');
                        keepLooking = (needsMenu($lastChild));
                        if((i - 1) <= plugin.settings.transformCutoff) {
                            $(this.children().get().reverse()).appendTo($popup);
                            allInPopup = true;
                            break;
                        }
                        if(!keepLooking) {
                            break;
                        } else {
                            $lastChild.appendTo($popup);
                        }
                    }
                    if(allInPopup) {
                        $this.append('<li class="menu-item nav-item transform-allInPopup"><a href="#" class="btn-transform ' +
                            plugin.settings.transformEffectHover + ' ' + plugin.settings.transformPaddingOne + '">' + 
                            plugin.settings.iconMenu + '</a></li>');
                    } else {
                        $this.append('<li class="menu-item nav-item"><a href="#" class="btn-transform item-link ' +
                                    plugin.settings.transformEffectHover + ' ' + plugin.settings.transformPaddingOne + '"><span class="item-icon">' + 
                                    plugin.settings.iconMenu + '</span></a></li>');
                    }
                    $moreItem = $this.find('> li.menu-item');//.find('.mobile-level');

                    if(needsMenu($moreItem)) {
                        $this.find('> li:nth-last-child(2)').appendTo($popup);
                    }

                    $popup.children().each(function(i, li) {
                        $popup.prepend(li);
                    });
                    $moreItem.append($popup);
                    $moreLink = $this.find('> li.menu-item > a');
                    $moreLink.click(function(e) {
                        var $activeMenus,
                            $menusToCollapse;
                        $activeMenus = $('li.menu-item.active');
                        $menusToCollapse = $activeMenus.not($moreItem);
                        $menusToCollapse.removeClass('active').find('> ul').css('display', 'none');
                        $popup.toggle();
                        $moreItem.toggleClass('active');
                        e.preventDefault();
                    });
                }
                else if(windowWidth() <= (plugin.settings.mobileWidth)) {
                    $menu = $this.find('ul.transform-submenu');
                    numToRemove = $menu.find('li').length;
                    for(i = 1; i <= numToRemove; i++) {
                        $menu.find('> li:first-child').appendTo($this);
                    }
                    $menu.remove();
                    $this.find('> li.menu-item').remove();
                }
            }
            else if (undo && $this.find('ul.transform-submenu')) {
                if(windowWidth() > (plugin.settings.mobileWidth)) {
                    $menu = $this.find('ul.transform-submenu');
                    numToRemove = $menu.find('li').length;
                    for(i = 1; i <= numToRemove; i++) {
                        $menu.find('> li:first-child').appendTo($this);
                    }
                    $menu.remove();
                    $this.find('> li.menu-item').remove();
                }
            }
        };
// ========= FIXED.MENU ========= //
        var fixedMode = function() {
            var wrapper = $(plugin.settings.fixedId);
            var id = document.body.querySelector(plugin.settings.fixedId);//document.body.getElementById(plugin.settings.fixedId); 
            var topT = id.getBoundingClientRect();
            var wrapperTop = wrapper.offset().top;
            // ============
            // ===========
            if(wrapperTop == 0 && $(window).scrollTop() == 0) {
                $(window).scroll(function() {
                    if(wrapperTop == 0 && $(window).scrollTop() == 0) {
                        toStatic();
                    }
                    else if(wrapperTop <= plugin.settings.topSpace) {
                        toFixed();
                    }
                    else{
                        $(window).on("scroll", function(){			
                            if($(window).scrollTop() >= wrapperTop - plugin.settings.topSpace) {
                                if(!$(wrapper).hasClass(plugin.settings.fixedClass)) {
                                    toFixed();
                                }
                            }
                            else{
                                if($(wrapper).hasClass(plugin.settings.fixedClass))
                                    toStatic();
                            }
                        });
                    }	
                });
            } 
            else {
                if(wrapperTop <= plugin.settings.topSpace) {
                    toFixed();
                }
                else{
                    $(window).on("scroll", function(){		
                        
                        var topT = id.getBoundingClientRect();
                        var src = $(window).scrollTop() + 10;
                        	
                        if(src >= wrapperTop - plugin.settings.topSpace){
                            if(!$(wrapper).hasClass(plugin.settings.fixedClass)) {
                                toFixed();
                            }
                        }
                        else {
                            if($(wrapper).hasClass(plugin.settings.fixedClass))
                                toStatic();
                        }
                    });
                }	
            }

            var toFixed = function() {
                $(wrapper).removeClass('no-fixed').addClass(plugin.settings.fixedClass);
                resizeNav();
            };
            var toStatic = function() {
                $(wrapper).removeClass(plugin.settings.fixedClass).addClass('no-fixed');
            };
            var resizeNav = function() {
                $(wrapper).css('top', plugin.settings.topSpace);
            };
        };

        var leftCatalog = function() {
            $(element).children("ul").find("span.submenu-indicator").bind("click touchend", function(e) {
                e.stopPropagation(); 
                e.preventDefault();
                if($(this).parent().siblings('div.catalog-submenu').children(".submenu").length > 0) {
                    if($(this).parent().siblings('div.catalog-submenu').children(".submenu").css("display") == "none") {
                        $(this).parent().siblings('div.catalog-submenu').children(".submenu").css('display', 'block');
                        $(this).parent().parent().parent().children(".submenu").css('display', 'none');
                        $(this).parent().parent().parent().children(".submenu").siblings("a").removeClass("submenu-indicator-minus");
                        $(this).parent().parent().parent().children(".submenu").siblings("a").children('i').css('transform', 'rotate(-90deg)');
                        $(this).children('i').css('transform', 'rotate(0deg)');
                        $(this).addClass("submenu-indicator-minus");
                        return false;
                    }
                    else {
                        $(this).parent().siblings('div.catalog-submenu').children(".submenu").delay(0).slideUp(0);
                    }
                    if($(this).hasClass("submenu-indicator-minus")) {
                        $(this).removeClass("submenu-indicator-minus");
                        $(this).children('i').css('transform', 'rotate(-90deg)');
                    }
                }
            });
        }

//========== ========= //
        
// ========= END FIXED.MENU ========= //
// ========= MOBILE.PUSH.MENU ========= //
        var mobileMode = function() {
            var $this = $(element),
                $level = $this.find('> .mobile-level'),
                i = 0;
            function initEventClick(el, levelM) {
                if($(el).attr('data-level') === levelM) {

                $(el).parent().parent().find('> li').find('> a').each(function() {
                        if(this.querySelector('.item-icon')) {
							
							 $(this).on('click touchstart', function(e) {
                                 plugin.settings.positionY = $(this).position().top;
                            });
							
                            $(this).on('click touchend', function(e) {
                                e.stopPropagation();
                                e.preventDefault();
								if(Math.abs(plugin.settings.positionY - $(this).position().top)<10){
									
									var mLevel = this.parentNode.querySelector('.mobile-level');
									mLevel.style.transitionProperty = 'left';
									mLevel.classList.add('open-mobile');
									var back = function() {
										$(mLevel).removeClass("open-mobile")
											.on("webkitTransitionEnd moztransitionend transitionend oTransitionEnd", function(){
												$(element).find(".mobile-level")
													.off();
										});
									}
									mLevel.querySelector('a').addEventListener('click', back);
									
							    }
                            });
                        }
                    });
                    
                }
            }

            function levelInc(i, el) {
                i++;
                var levelSub = $(el).children('ul')
                    .children('li')
                    .children('.mobile-level');
                if(levelSub.length > 0) {
                    $(levelSub).attr('data-level', 'level-mobile-' + i);
                    $(levelSub).each(function() {
                        levelInc(i, this);
                    });
                    initEventClick(levelSub, 'level-mobile-' + i);                    
                }
                return 0;
            }

            if($level.length > 0) {
                $level.each(function() {
                    i++;
                    $(this).attr('data-level', 'level-mobile-' + i);
                    /*if(this.classList.contains('d-flex')) {
                        this.classList.remove('d-flex');
                        $(this).children('ul').removeClass('container');
                    }*/
                    levelInc(i, this);
                });
            }


        };

        /*var horizontalMode = function() {

            var ul = $(element).find('.nav-submenu');
            var ulT = $(element).find('.transform-submenu');

            var ulHeight = ulT.height() || 0;

            $(ul).each(function() {
                if($(this).height() > ulHeight) ulHeight = $(this).height();
            });


            if(windowWidth() > 767) {

                if(ulT !== undefined)
                    $(ulT).css('height', ulHeight);

                    $(ul).each(function() {
                        $(this).css('height', ulHeight);
                    });

                

                var $this = $(element),
                    $level = $this.find('> .mobile-level'),
                    i = 0;

                function initEventClick(el, levelM) {
                    if($(el).attr('data-level') == levelM && $(el).attr('data-level') !== 'level-mobile-1') {
                        var dataLevel = $(el).parent().parent();
                        
                        if($(dataLevel).attr('data-level') !== 'level-mobile-1') {

                            $(dataLevel).find('> li').find('> a').each(function() {

                                $(this).on('click touchend', function(e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    var mLevel = this.parentNode.querySelector('.mobile-level');
                                    mLevel.style.transitionProperty = 'left';
                                    mLevel.classList.add('open-horizontal');
                                    var back = function() {
                                        $(mLevel).removeClass("open-horizontal")
                                            .on("webkitTransitionEnd moztransitionend transitionend oTransitionEnd", function(){
                                                $(element).find(".mobile-level")
                                                    .off();
                                        });
                                    }
                                    mLevel.querySelector('a').addEventListener('click', back);
                                });

                            });
                        }
                        else {
                            $(dataLevel).find('> li').find('> a').each(function() {
                                $(this).unbind('click');
                            });
                        }

                        
                    }
                }

                function levelInc(i, el) {
                    i++;
                    if($(el).hasClass('transform-submenu')) {
                        var levelSub = $(el).children('li')
                            .children('.mobile-level');
                        $(el).attr('data-level', 'level-mobile-' + (i - 1));
                    } else {
                        var levelSub = $(el).children('ul')
                            .children('li')
                            .children('.mobile-level');
                        $(el).find('> ul').attr('data-level', 'level-mobile-' + (i - 1));
                    }
                    

                    if(levelSub.length > 0) {
                        $(levelSub).attr('data-level', 'level-mobile-' + i);
                        $(levelSub).each(function() {
                            levelInc(i, this);
                        });
                        initEventClick(levelSub, 'level-mobile-' + i);                    
                    }
                    return 0;
                }

                if($level.length > 0) {
                    $level.each(function() {
                        i++;
                        $(this).attr('data-level', 'level-mobile-' + i);
                        levelInc(i, this);
                    });
                }

            } else {
                if(ulT !== undefined)
                    $(ulT).css('heigth', '100%');
                $(ul).each(function() {
                    $(this).css('height', '100%');
                });
            }

        };*/
// ========= END MOBILE.PUSH.MENU ========= //

// =========  WINDOW WIDTH ========= //
        var windowWidth = function() {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        };
// =========  WINDOW HEIGHT ========= //
        var windowHeight = function() {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        };

        plugin.init();
    };

    $.fn.sfNavMulti = function(options) {
        return this.each(function() {
            if(undefined === $(this).data('sfNavMulti')) {
                var plugin = new $.sfNavMulti(this, options);
                $(this).data('sfNavMulti', plugin);
            }
        });
    };

})(jQuery, window, document);