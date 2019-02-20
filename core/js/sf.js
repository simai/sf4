/*!
 * Waves v0.7.5
 * http://fian.my.id/Waves
 *
 * Copyright 2014-2016 Alfiana E. Sibuea and other contributors
 * Released under the MIT license
 * https://github.com/fians/Waves/blob/master/LICENSE
 */

;
(function (window, factory) {
    'use strict';

    // AMD. Register as an anonymous module.  Wrap in function so we have access
    // to root via `this`.
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory.apply(window);
        });
    }

    // Node. Does not work with strict CommonJS, but only CommonJS-like
    // environments that support module.exports, like Node.
    else if (typeof exports === 'object') {
        module.exports = factory.call(window);
    }

    // Browser globals.
    else {
        window.Waves = factory.call(window);
    }
})(typeof global === 'object' ? global : this, function () {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);
    var toString = Object.prototype.toString;
    var isTouchAvailable = 'ontouchstart' in window;


    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function isObject(value) {
        var type = typeof value;
        return type === 'function' || type === 'object' && !!value;
    }

    function isDOMNode(obj) {
        return isObject(obj) && obj.nodeType > 0;
    }

    function getWavesElements(nodes) {
        var stringRepr = toString.call(nodes);

        if (stringRepr === '[object String]') {
            return $$(nodes);
        } else if (isObject(nodes) && /^\[object (Array|HTMLCollection|NodeList|Object)\]$/.test(stringRepr) && nodes.hasOwnProperty('length')) {
            return nodes;
        } else if (isDOMNode(nodes)) {
            return [nodes];
        }

        return [];
    }

    function offset(elem) {
        var docElem, win,
            box = {
                top: 0,
                left: 0
            },
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(styleObj) {
        var style = '';

        for (var prop in styleObj) {
            if (styleObj.hasOwnProperty(prop)) {
                style += (prop + ':' + styleObj[prop] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect duration
        duration: 750,

        // Effect delay (check for scroll before showing effect)
        delay: 200,

        show: function (e, element, velocity) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            element = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple waves-rippling';
            element.appendChild(ripple);

            // Get click coordinate and element width
            var pos = offset(element);
            var relativeY = 0;
            var relativeX = 0;
            // Support for touch devices
            if ('touches' in e && e.touches.length) {
                relativeY = (e.touches[0].pageY - pos.top);
                relativeX = (e.touches[0].pageX - pos.left);
            }
            //Normal case
            else {
                relativeY = (e.pageY - pos.top);
                relativeX = (e.pageX - pos.left);
            }
            // Support for synthetic events
            relativeX = relativeX >= 0 ? relativeX : 0;
            relativeY = relativeY >= 0 ? relativeY : 0;

            var scale = 'scale(' + ((element.clientWidth / 100) * 3) + ')';
            var translate = 'translate(0,0)';

            if (velocity) {
                translate = 'translate(' + (velocity.x) + 'px, ' + (velocity.y) + 'px)';
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-translate', translate);

            // Set ripple position
            var rippleStyle = {
                top: relativeY + 'px',
                left: relativeX + 'px'
            };

            ripple.classList.add('waves-notransition');
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.classList.remove('waves-notransition');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale + ' ' + translate;
            rippleStyle['-moz-transform'] = scale + ' ' + translate;
            rippleStyle['-ms-transform'] = scale + ' ' + translate;
            rippleStyle['-o-transform'] = scale + ' ' + translate;
            rippleStyle.transform = scale + ' ' + translate;
            rippleStyle.opacity = '1';

            var duration = e.type === 'mousemove' ? 2500 : Effect.duration;
            rippleStyle['-webkit-transition-duration'] = duration + 'ms';
            rippleStyle['-moz-transition-duration'] = duration + 'ms';
            rippleStyle['-o-transition-duration'] = duration + 'ms';
            rippleStyle['transition-duration'] = duration + 'ms';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function (e, element) {
            element = element || this;

            var ripples = element.getElementsByClassName('waves-rippling');

            for (var i = 0, len = ripples.length; i < len; i++) {
                removeRipple(e, element, ripples[i]);
            }
        }
    };

    /**
     * Collection of wrapper for HTML element that only have single tag
     * like <input> and <img>
     */
    var TagWrapper = {

        // Wrap <input> tag so it can perform the effect
        input: function (element) {

            /*var parent = element.parentNode;

            // If input already have parent just pass through
            if (parent.tagName.toLowerCase() === 'i' && parent.classList.contains('waves-effect')) {
                return;
            }

            // Put element class and style to the specified parent
            var wrapper = document.createElement('i');
            wrapper.className = element.className + ' waves-input-wrapper';
            element.className = 'waves-button-input';

            // Put element as child
            parent.replaceChild(wrapper, element);
            wrapper.appendChild(element);

            // Apply element color and background color to wrapper
            var elementStyle = window.getComputedStyle(element, null);
            var color = elementStyle.color;
            var backgroundColor = elementStyle.backgroundColor;

            wrapper.setAttribute('style', 'color:' + color + ';background:' + backgroundColor);
            element.setAttribute('style', 'background-color:rgba(0,0,0,0);');*/

        },

        // Wrap <img> tag so it can perform the effect
        img: function (element) {

            var parent = element.parentNode;

            // If input already have parent just pass through
            if (parent.tagName.toLowerCase() === 'i' && parent.classList.contains('waves-effect')) {
                return;
            }

            // Put element as child
            var wrapper = document.createElement('i');
            parent.replaceChild(wrapper, element);
            wrapper.appendChild(element);

        }
    };

    /**
     * Hide the effect and remove the ripple. Must be
     * a separate function to pass the JSLint...
     */
    function removeRipple(e, el, ripple) {

        // Check if the ripple still exist
        if (!ripple) {
            return;
        }

        ripple.classList.remove('waves-rippling');

        var relativeX = ripple.getAttribute('data-x');
        var relativeY = ripple.getAttribute('data-y');
        var scale = ripple.getAttribute('data-scale');
        var translate = ripple.getAttribute('data-translate');

        // Get delay beetween mousedown and mouse leave
        var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
        var delay = 350 - diff;

        if (delay < 0) {
            delay = 0;
        }

        if (e.type === 'mousemove') {
            delay = 150;
        }

        // Fade out ripple after delay
        var duration = e.type === 'mousemove' ? 2500 : Effect.duration;

        setTimeout(function () {

            var style = {
                top: relativeY + 'px',
                left: relativeX + 'px',
                opacity: '0',

                // Duration
                '-webkit-transition-duration': duration + 'ms',
                '-moz-transition-duration': duration + 'ms',
                '-o-transition-duration': duration + 'ms',
                'transition-duration': duration + 'ms',
                '-webkit-transform': scale + ' ' + translate,
                '-moz-transform': scale + ' ' + translate,
                '-ms-transform': scale + ' ' + translate,
                '-o-transform': scale + ' ' + translate,
                'transform': scale + ' ' + translate
            };

            ripple.setAttribute('style', convertStyle(style));

            setTimeout(function () {
                try {
                    el.removeChild(ripple);
                } catch (e) {
                    return false;
                }
            }, duration);

        }, delay);
    }


    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {

        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,

        allowEvent: function (e) {

            var allow = true;

            if (/^(mousedown|mousemove)$/.test(e.type) && TouchHandler.touches) {
                allow = false;
            }

            return allow;
        },
        registerEvent: function (e) {
            var eType = e.type;

            if (eType === 'touchstart') {

                TouchHandler.touches += 1; // push

            } else if (/^(touchend|touchcancel)$/.test(eType)) {

                setTimeout(function () {
                    if (TouchHandler.touches) {
                        TouchHandler.touches -= 1; // pop after 500ms
                    }
                }, 500);

            }
        }
    };


    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {

        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentElement !== null) {
            if (target.classList.contains('waves-effect') && (!(target instanceof SVGElement))) {
                element = target;
                break;
            }
            target = target.parentElement;
        }

        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {

        // Disable effect if element has "disabled" property on it
        // In some cases, the event is not triggered by the current element
        // if (e.target.getAttribute('disabled') !== null) {
        //     return;
        // }

        var element = getWavesEffectElement(e);

        if (element !== null) {

            // Make it sure the element has either disabled property, disabled attribute or 'disabled' class
            if (element.disabled || element.getAttribute('disabled') || element.classList.contains('disabled')) {
                return;
            }

            TouchHandler.registerEvent(e);

            if (e.type === 'touchstart' && Effect.delay) {

                var hidden = false;

                var timer = setTimeout(function () {
                    timer = null;
                    Effect.show(e, element);
                }, Effect.delay);

                var hideEffect = function (hideEvent) {

                    // if touch hasn't moved, and effect not yet started: start effect now
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                        Effect.show(e, element);
                    }
                    if (!hidden) {
                        hidden = true;
                        Effect.hide(hideEvent, element);
                    }
                };

                var touchMove = function (moveEvent) {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    hideEffect(moveEvent);
                };

                element.addEventListener('touchmove', touchMove, false);
                element.addEventListener('touchend', hideEffect, false);
                element.addEventListener('touchcancel', hideEffect, false);

            } else {

                Effect.show(e, element);

                if (isTouchAvailable) {
                    element.addEventListener('touchend', Effect.hide, false);
                    element.addEventListener('touchcancel', Effect.hide, false);
                }

                element.addEventListener('mouseup', Effect.hide, false);
                element.addEventListener('mouseleave', Effect.hide, false);
            }
        }
    }

    Waves.init = function (options) {
        var body = document.body;

        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        if ('delay' in options) {
            Effect.delay = options.delay;
        }

        if (isTouchAvailable) {
            body.addEventListener('touchstart', showEffect, false);
            body.addEventListener('touchcancel', TouchHandler.registerEvent, false);
            body.addEventListener('touchend', TouchHandler.registerEvent, false);
        }

        body.addEventListener('mousedown', showEffect, false);
    };


    /**
     * Attach Waves to dynamically loaded inputs, or add .waves-effect and other
     * waves classes to a set of elements. Set drag to true if the ripple mouseover
     * or skimming effect should be applied to the elements.
     */
    Waves.attach = function (elements, classes) {

        elements = getWavesElements(elements);

        if (toString.call(classes) === '[object Array]') {
            classes = classes.join(' ');
        }

        classes = classes ? ' ' + classes : '';

        var element, tagName;

        for (var i = 0, len = elements.length; i < len; i++) {

            element = elements[i];
            tagName = element.tagName.toLowerCase();

            if (['input', 'img'].indexOf(tagName) !== -1) {
                TagWrapper[tagName](element);
                element = element.parentElement;
            }

            if (element.className.indexOf('waves-effect') === -1) {
                element.className += ' waves-effect' + classes;
            }
        }
    };


    /**
     * Cause a ripple to appear in an element via code.
     */
    Waves.ripple = function (elements, options) {
        elements = getWavesElements(elements);
        var elementsLen = elements.length;

        options = options || {};
        options.wait = options.wait || 0;
        options.position = options.position || null; // default = centre of element


        if (elementsLen) {
            var element, pos, off, centre = {},
                i = 0;
            var mousedown = {
                type: 'mousedown',
                button: 1
            };
            var hideRipple = function (mouseup, element) {
                return function () {
                    Effect.hide(mouseup, element);
                };
            };

            for (; i < elementsLen; i++) {
                element = elements[i];
                pos = options.position || {
                    x: element.clientWidth / 2,
                    y: element.clientHeight / 2
                };

                off = offset(element);
                centre.x = off.left + pos.x;
                centre.y = off.top + pos.y;

                mousedown.pageX = centre.x;
                mousedown.pageY = centre.y;

                Effect.show(mousedown, element);

                if (options.wait >= 0 && options.wait !== null) {
                    var mouseup = {
                        type: 'mouseup',
                        button: 1
                    };

                    setTimeout(hideRipple(mouseup, element), options.wait);
                }
            }
        }
    };

    /**
     * Remove all ripples from an element.
     */
    Waves.calm = function (elements) {
        elements = getWavesElements(elements);
        var mouseup = {
            type: 'mouseup',
            button: 1
        };

        for (var i = 0, len = elements.length; i < len; i++) {
            Effect.hide(mouseup, elements[i]);
        }
    };

    /**
     * Deprecated API fallback
     */
    Waves.displayEffect = function (options) {
        console.error('Waves.displayEffect() has been deprecated and will be removed in future version. Please use Waves.init() to initialize Waves effect');
        Waves.init(options);
    };

    return Waves;
});
window.onload = function() {
    //Initialization
    Waves.attach('.wave', ['waves-effect']);	
	Waves.attach('.btn-flat', ['waves-effect']);
    Waves.attach('.pagination .page-item .page-link', ['waves-effect']);
    Waves.attach('.btn', ['waves-light']);
    Waves.attach('.view .mask', ['waves-light']);
    Waves.attach('.wave-light', ['waves-light']);
    Waves.attach('.navbar-nav a, .nav-icons li a, .navbar form, .nav-tabs .nav-item', ['waves-light']);
    Waves.attach('.navbar-brand', ['waves-light']);
    Waves.attach('.pager li a', ['waves-light']);
    Waves.init();
}

document.addEventListener('DOMContentLoaded', function() {
    //Initialization
    Waves.attach('.wave', ['waves-effect']);	
	Waves.attach('.btn-flat', ['waves-effect']);
    Waves.attach('.pagination .page-item .page-link', ['waves-effect']);
    Waves.attach('.btn', ['waves-light']);
    Waves.attach('.view .mask', ['waves-light']);
    Waves.attach('.wave-light', ['waves-light']);
    Waves.attach('.navbar-nav a, .nav-icons li a, .navbar form, .nav-tabs .nav-item', ['waves-light']);
    Waves.attach('.navbar-brand', ['waves-light']);
    Waves.attach('.pager li a', ['waves-light']);
    Waves.init();
});
var WOW = function (properties) {

  var config = properties || {};

  this._boxClass = config.boxClass || 'wow';
  this._animateClass = config.animateClass || 'animated',
  this._offset = config.offset || 0,
  this._mobile = (config.mobile === undefined) ? true : false;
  this._live = (config.live === undefined) ? true : false;

  this._seoFixEnabled = (config.seoFixEnabled === undefined) ? true : false;
  this._animationDuration = config.animationDuration || "1s";
  this._animationDelay = config.animationDelay || "0s";

  this._initStorageVariables();

};

WOW.prototype._initStorageVariables = function () {

  this._animation = [];
  this._boxes = [];
  this._cleanupBoxListener = [];
  this._cleanupBoxVisibleListener = [];

};

WOW.prototype.init = function () {

  if (!this._mobile && this._isMobile()) {
    return;
  }

  this._eachBoxInit(this._prepareBox.bind(this));

  this._startWow();

};

WOW.prototype._isMobile = function () {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};


WOW.prototype._eachBoxInit = function (each) {

  var boxes = document.getElementsByClassName(this._boxClass);

  for (var i = 0; i < boxes.length; i++) {

    (function (i) {
      each(boxes[i], i);
    })(i);

  }

};

WOW.prototype._prepareBox = function (box) {

  var index = this._boxes.push(box) - 1;
  this._animation[index] = {
    animationName: box.style.animationName || window.getComputedStyle(box, null).animationName
  };
  box.style.animationName = 'none';
  box.style.visibility = 'hidden';

};

WOW.prototype._startWow = function () {

  if (this._live) {
    this._checkForChanges();
  }
  if (this._scrollY() === 0 && this._seoFixEnabled) {
    this._seoFix();
  }

  this._appearInView();

  this._scrollHandler();

};

WOW.prototype._scrollY = function () {

  if (this._isInt(window.pageYOffset)) {
    return window.pageYOffset;
  }
  if (this._isInt(document.documentElement.scrollTop)) {
    return document.documentElement.scrollTop;
  }
  if (this._isInt(document.body.scrollTop)) {
    return document.body.scrollTop;
  }

};

WOW.prototype._isInt = function(value) {
  return typeof value === 'number' && 
    isFinite(value) && 
    Math.floor(value) === value;
};

WOW.prototype._seoFix = function () {

  this._showNotInView();

};


WOW.prototype._appear = function (box, i) {

  var animationState = box.style.animationPlayState || box.style.WebkitAnimationPlayState;

  if (box.className.indexOf(this._animateClass) === -1) {

    delete this._boxes[i];

    this._onStartAnimation(box, i);
    this._onStopAnimation(box, i);

    this._animate(box, i, this._getAnimationConfig(box));

  }

};

WOW.prototype._onStartAnimation = function (box, i) {
  
  this._cleanupBoxVisibleListener[i] = this._boxVisible.bind(this, box, i);
    
  box.addEventListener('animationstart', this._cleanupBoxVisibleListener[i]);
  box.addEventListener('webkitAnimationStart', this._cleanupBoxVisibleListener[i]);

};

WOW.prototype._onStopAnimation = function (box, i) {

  this._cleanupBoxListener[i] = this._cleanupBox.bind(this, box, i);

  box.addEventListener('animationend', this._cleanupBoxListener[i]);
  box.addEventListener('webkitAnimationEnd', this._cleanupBoxListener[i]);

};

WOW.prototype._getAnimationConfig = function (box) {

  return {

    delay: this._getDelay(box),
    duration: this._getDuration(box),
    iterations: this._getIterations(box)
      
  }

};

WOW.prototype._getDelay = function (box) {

  return box.getAttribute('data-wow-delay') || this._animationDelay;

};

WOW.prototype._getDuration = function (box) {

  return box.getAttribute('data-wow-duration') || this._animationDuration;

};

WOW.prototype._getIterations = function (box) {

  return box.getAttribute('data-wow-iteration') || 
    box.style.animationIterationCount || 
    window.getComputedStyle(box, null).animationIterationCount || 
    1;

};

WOW.prototype._animate = function (box, i, config) {

  box.style.animationDelay = config.delay;
  box.style.animationDuration = config.duration;
  box.style.animationIterationCount = config.iterations;
  box.style.animationName = this._animation[i].animationName;
  box.className += (' ' + this._animateClass);

};

WOW.prototype._boxVisible = function (box, i) {

  box.style.visibility = 'visible';

  box.removeEventListener('animationstart', this._cleanupBoxVisibleListener[i]);
  box.removeEventListener('webkitAnimationStart', this._cleanupBoxVisibleListener[i]);

  delete this._cleanupBoxVisibleListener[i];

};

WOW.prototype._cleanupBox = function (box, i) {

  box.style.animationDelay = '';
  box.style.animationDuration = '';
  box.style.animationIterationCount = '';
  box.style.animationName = 'none';

  this._cleanupClass(box);

  box.removeEventListener('animationend', this._cleanupBoxListener[i]);
  box.removeEventListener('webkitAnimationEnd', this._cleanupBoxListener[i]);

  delete this._cleanupBoxListener[i];

};

WOW.prototype._cleanupClass = function (box) {

  var classArray = box.className.split(' ');
  var animateIndex = classArray.indexOf(this._animateClass);

  if (animateIndex !== -1) {

    classArray.splice(animateIndex, 1);
    box.className = classArray.join(' ');
    
  }

};

WOW.prototype._eachBox = function (each) {

  for (var i = 0; i < this._boxes.length; i++) {

    var box = this._boxes[i];

    if (box) {

      (function (i) {
         each(this._boxes[i], i);
      }.bind(this))(i);
      
    }

  }

};

WOW.prototype._scrollHandler = function () {

  this._hideSeoFixListener = this._hideSeoFix.bind(this);

  window.addEventListener('scroll', this._hideSeoFixListener);
  window.addEventListener('scroll', this._appearInView.bind(this));
  window.addEventListener('resize', this._appearInView.bind(this));

};

WOW.prototype._hideSeoFix = function () {
  
  window.removeEventListener('scroll', this._hideSeoFixListener);
  delete this._hideSeoFixListener;

  this._eachBox(function (box, i) {

    if (!this._isInView(box)) {
      box.style.visibility = "hidden";
    }

  }.bind(this));

};

WOW.prototype._appearInView = function () {

  this._eachBox(function (box, i) {
    this._animateBox(box, i);
  }.bind(this));

};

WOW.prototype._animateBox = function (box, i) {

  if (this._isInView(box)) {
    delete this._boxes[i];
    this._appear(box, i);
  }

};

WOW.prototype._showNotInView = function () {

  this._eachBox(function (box, i) {
    this._makeVisible(box, i);
  }.bind(this));

};

WOW.prototype._makeVisible = function (box, i) {

  if (!this._isInView(box)) {
    this._boxes[i].style.visibility = 'visible';
  }

};

WOW.prototype._isInView = function (box) {

  var offset = box.getAttribute('data-wow-offset') || this._offset;
  var boxTopOffset = this._getElementOffset(box);

  var triggerOffset = boxTopOffset + ~~offset;

  var bottomPosition = window.innerHeight + this._scrollY();

  return triggerOffset <= bottomPosition && (triggerOffset === 0 ? 10 : triggerOffset) >= this._scrollY();

};

WOW.prototype._getElementOffset = function (box) {

  var clientRect = box.getBoundingClientRect();

  var body = document.body;

  var scrollTop = this._scrollY();
  var clientTop = document.documentElement.clientTop || body.clientTop || 0;

  var top  = clientRect.top +  scrollTop - clientTop;

  return Math.round(top);

};

WOW.prototype._checkForChanges = function () {

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  var observer = new MutationObserver(this._mutations.bind(this));

  var config = {
    childList: true,
    subtree: true
  };
  window.onload = function() {
    observer.observe(document.body, config);
  }
};

WOW.prototype._mutations = function (mutations) {
  
  mutations.forEach(function (mutation) {

    for (var i = 0; i < mutation.addedNodes.length; i++) {
      this.doSync(mutation.addedNodes[i]);
    }

  }.bind(this));

};

WOW.prototype.doSync = function (node) {

  if (node.className) {

    var classes = node.className.split(' ');

    if (classes.indexOf(this._boxClass) !== -1) {
      this._prepareBox(node);
    }

  }

};

window.addEventListener("DOMContentLoaded", function(e) {
  new WOW().init();
});
$(document).on('lazybeforeunveil', function(e){
    var ajax = $(e.target).data('ajax');
    if(ajax){
        $(e.target).load(ajax);
    }
});
try {
    window.SF = SF || {};
} catch (error) {
    window.SF = {};    
}
/*============================= */

SF.Methods = function() {

    /**
     * extend() - 
     * @param {*} defaults 
     * @param {*} options 
     */
    this.extend = function(defaults, options) {
        for(var key in options)
            if(options.hasOwnProperty(key))
                if(Object.prototype.toString.call(options[key]) == '[object Object]')
                    this.extend(defaults[key], options[key]);
                else defaults[key] = options[key];
        return defaults;
    }

    /**
     * Поиск наивысшего z-index в документе
     */
    this.topZIndex = function() {
        var e = document.querySelectorAll('*'),
            z = 1,
            style = '';
        for(var k = 0; k < e.length; k++) {
            style = getComputedStyle(e[k]);
            if(parseInt(style.zIndex) > z)
                z = parseInt(style.zIndex);
        }
        return z;
    }

    this.topZIndexElement = function(el) {
        var z = 1,
            e = false,
            style = '';
        for(var k = 0; k < el.length; k++) {
            style = getComputedStyle(el[k]);
            if(parseInt(style.zIndex) > z) {
                z = parseInt(style.zIndex);
                e = el[k];
            }
        }
        return e;
    }

    /**
     * 
     */
    this.includeScript = function(path) {
        var s = document.createElement('script');
        s.src = path;
        document.querySelector('head').appendChild(s);
    }
    
    this.addcss = function(path) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = path;
        document.querySelector('head').appendChild(l);
        return l;
    }

    /**
     * 
     */
    this.cookies = {
        /**
         * get() - получить куки
         */
        get: function(name) {
            if(document.cookie.length > 0) {
                var start = document.cookie.indexOf(name + '=');
                if(start != -1) {
                    start = start + name.length + 1;
                    var end = document.cookie.indexOf(';', start);
                    if(end == -1) end = document.cookie.length;
                    return encodeURI(document.cookie.substring(start, end));
                }
            }
            return '';
        },
        /**
         * set() - установить куки
         */
        set: function(name, value, expiredays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + expiredays);
            document.cookie = name + '=' + decodeURI(value) +
                ((expiredays == null) ? '' : '; expires=' + exdate.toUTCString()) + '; path=/';
        },
        /**
         * check() - Проверка установлен ли параметр куки
         */
        check: function(name) {
            name = this.cookie.get(name);
            if(name != null && name != '') return true;
            else return false;
        }
    }


    this.bytelength = function(str) {
        var count = 0,
            ch = 0;
        for(var k = 0; k < str.length; k++) {
            ch = str.charCodeAt(k);
            if(ch <= 127) count++;
            else if(ch <= 2047) count += 2;
            else if(ch <= 65535) count += 3;
            else if(ch <= 2097151) count += 4;
            else if(ch <= 67108863) count += 5;
            else count += 6;
        }
        return count;
    }

    this.bytelengthlimit = function(str, limit) {
        var count = 0,
            ch = 0,
            strlimit = '',
            flaglimit = false,
            result = [];
        for(var k = 0; k < str.length; k++) {
            ch = str.charCodeAt(k);
            if(count <= limit) {
                flaglimit = true;
            }
            strlimit += str[k];
            if(ch <= 127) count++;
            else if(ch <= 2047) count += 2;
            else if(ch <= 65535) count += 3;
            else if(ch <= 2097151) count += 4;
            else if(ch <= 67108863) count += 5;
            else count += 6;

            if((count > limit && flaglimit) || (flaglimit && k == str.length - 1)) {
                //console.log(strlimit)
                result.push(strlimit);
                strlimit = '';
                count = 0;
                flaglimit = false;
            }
        }
        //console.log(result.length)
        if(result.length > 0) {
            //result.push(strlimit);
            return result;
        } else {
            result.push(strlimit);
            return result;
        }
    }
}
SF.send = function(event, element) {
    if(document.createEvent){
        var e = document.createEvent('Events');
        e.initEvent(event, true, false);
    }
    else if(document.createEventObject()) {
        var e = document.createEventObject();
    }
    else return;

    if(element.dispatchEvent)
        element.dispatchEvent(e);
    else if(element.fireEvent) element.fireEvent(event, e);
}

SF.receive = function(event, el, handler) {
    if(window.addEventListener)
        el.addEventListener(event, handler, false);
    else if(window.attachEvent)
        el.attachEvent(event, handler);
}

/*============================= */
SF.Events = function() {

    /**
     * Метод send() - Отправляет событие
     * @param {*} event 
     */
    this.send = function(event, element) {
        if(document.createEvent){
            var e = document.createEvent('Events');
            e.initEvent(event, true, false);
        }
        else if(document.createEventObject()) {
            var e = document.createEventObject();
        }
        else return;
    
        if(element.dispatchEvent)
            element.dispatchEvent(e);
        else if(element.fireEvent) element.fireEvent(event, e);
    }

    /**
     * Метод receive() - регистрирует обработчик события
     * @param {*} event 
     * @param {*} handler 
     */
    this.receive = function(event, el, handler) {
        if(window.addEventListener)
            el.addEventListener(event, handler, false);
        else if(window.attachEvent)
            el.attachEvent(event, handler);
    }

    /**
     * hotkey() - функция обработки нажатия нескольких клавиш и выполнения фукций обработчика
     * @param {*} handler - функтция обработчик события нажатия клавиш
     * @param {*} далее может следовать любое количество кодов сочетания клавиш в
     * кавычках ("17")
     */
    this.hotkey = function(handler) {
        var codes = [].slice.call(arguments, 1),
            pressed = {}; 
        document.addEventListener('keydown', function(e) {
            e = e || window.event;
            pressed[e.keyCode] = true;
            for (var i = 0; i < codes.length; i++)
                if (!pressed[codes[i]]) return;
            pressed = {};
            handler();
        });
        document.addEventListener('keyup',function(e) {
            e = e || window.event;
            delete pressed[e.keyCode];
        });
    }

    /**
     * quickkey() - функция обработки нажатия клавиши и выполнения функции обработчика
     * @param {*} handler - функция обработчик события нажатия клавиши 
     * @param {*} key - клавиша после нажатия которой срабатывает функция обрботчик
     */
    this.quickkey = function(handler, key) {
        addEventListener('keydown', function(e) {
            if(e.keyCode == key)
                handler(e);
        });
    }

    SF.Methods.call(this);
}

SF.Parameters = function() {
    /**
     * newparams - генерация новых параметров
     */
    this.newparams = function() {
        return this.params;
    }
    
    /**
     * Обновление существующих параметров
     * @param {*} el 
     */
    this.updateparams = function(el) {
        var par = el.params,
            mod = par.modifier,
            data = par.data;
        for(var key in mod) {
            mod[key] = el.hasAttribute(data[key]) ? mod[key] + ' ' + el.getAttribute(data[key]) : mod[key];
        }
    }

// ================ CONSTRUCTOR ================ //
    this.params = {
        ajax: {
            events: {
                init: 'ajaxinit',
                load: 'endcontentload',
            },
            method: 'GET',
            type: 'html',
            timeout: 0,
            async: true,
            emulateOnload: true,
            cache: true
        },
        controller: {

        },
        search: {
    
        },
        provider: {
            
        },
        blocks: {
            special: {
                cookies: {
                    specialfont: 'default',
                    specialstate: 'off',
                    specialcolor: 'specialwhite',
                    specialkegl: '16',
                    specialinterval: '1.0',
                    specialkerning: 'normal',
                    specialimage: 'off',
                    specialup: 'up',
                    specialsound: 'off',
                },
                events: {
                    init: 'specialinit',
                    create: 'specialcreate',
                    open: 'specialopen',
                    close: 'specialoff',
                    up: 'specialup',
                    soundon: 'specialsoundon',
                    soundoff: 'specialsoundoff',
                    defaultsetting: 'specialdefaultsetting',
                // События панели Special
                    fontsans: 'specialfontsans',
                    fontserif: 'specialfontserif',
                    fontmono: 'specialfontmono',
                    keglmore: 'specialkeglmore',
                    keglless: 'specialkeglless',
                    intervalone: 'specialintervalone',
                    intervalhalf: 'specialintervalhalf',
                    intervaltwo: 'specialintervaltwo',
                    imageoff: 'specialimageoff',
                    imageblack: 'specialimageblack',
                    imagecolor: 'specialimagecolor',
                    imagecolor: 'specialimagecolor',
                    colorwhite: 'specialcolorwhite',
                    colorblack: 'specialcolorblack',
                    coloryellow: 'specialcoloryellow',
                    colorblue: 'specialcolorblue',
                    colorgreen: 'specialcolorgreen',
                    kerningnormal: 'specialkerningnormal',
                    kerningmiddle: 'specialkerningmiddle',
                    kerningbig: 'specialkerningbig',
                },
                data: {
                    init: 'sf-special',
                    panel: 'sf-special-panel',
                    kegl: 'sf-special-kegl',
                    interval: 'sf-special-interval',
                    color: 'sf-special-color',
                    img: 'sf-special-img',
                    on: 'sf-special-on',
                },
                attributes: {

                },
                modifier: {
                    panel: 'special-panel d-flex align-items-start justify-content-center flex-wrap flex-row w-100 bb-1',
                    font: 'd-flex align-items-center justify-content-center flex-column p-3',
                    kegl: 'd-flex align-items-center justify-content-center flex-column p-3',
                    interval: "d-flex align-items-center justify-content-center flex-column p-3",
                    kerning: 'd-flex align-items-center justify-content-center flex-column p-3',
                    color: "d-flex align-items-center justify-content-center flex-column p-3",
                    img: "d-flex align-items-center justify-content-center flex-column p-3",
                    onoff: "d-flex align-items-center justify-content-center flex-column p-3",
                    sound: "d-flex align-items-center justify-content-center flex-column p-3",                    
                    black: 'sf-special-black',
                    white: 'sf-special-white',
                    yellow: 'sf-special-yellow',
                    blue: 'sf-special-blue',
                    green: 'sf-special-green',
                    // Путь до стилей
                    specialwhite: '/simai/asset/simai.framework/sf4.master/plugin/special/css/white.min.css',
                    specialblack: '/simai/asset/simai.framework/sf4.master/plugin/special/css/black.min.css',
                    specialyellow: '/simai/asset/simai.framework/sf4.master/plugin/special/css/yellow.min.css',
                    specialblue: '/simai/asset/simai.framework/sf4.master/plugin/special/css/blue.min.css',
                    specialgreen: '/simai/asset/simai.framework/sf4.master/plugin/special/css/green.min.css',
                    specialsoundscript: 'https://webasr.yandex.net/jsapi/v1/webspeechkit.js',
                },
            },
            modal: {
                load: '<div class="sf-progress"><div class="sf-progress-animation"></div></div>',
                events: {
                    init: 'modalinit',
                    create: "modalcreate",
                    open: 'modalopen',
                    close: 'modalclose',
                },
                data: {
                    init: 'sf-modal',
                    src: 'sf-src',
                    modal: 'sf-modal-modifier',
                    content: 'sf-content-modifier',
                    close: "sf-close-modifier",
                    overlay: 'sf-overlay-modifier',
                    blur: 'sf-blur',
                    iframe: 'sf-iframe',
                },
                attributes: {
                    overlay: 'sf-modal-overlay',
                    load: 'sf-modal-loadanimation',
                    modal: 'sf-modal-area',
                    content: 'sf-modal-content',
                    close: 'sf-modal-close',
                    number: 'sf-modal-number'
                },
                modifier: {
                    src: '',
                    service: 'sf-service-bottom-area',
                    container: 'sf-modal-container',
                    overlay: 'sf-modal-overlay',
                    load: 'sf-modal-load',
                    modal: 'sf-modal-area',
                    content: 'sf-modal-content sf-scroll',
                    close: 'sf-close',
                    blur: 'blur',
                    page: 'sf-pagewrap-area',
                },
            },
            ajaxload: {
                load: '<div class="sf-progress"><div class="sf-progress-animation"></div></div>',
                events: {
                    init: 'ajaxloadinit',
                    cancel: 'ajaxloadcanceltrack',
                    create: 'ajaxloadcreate',
                },
                data: {
                    init: 'sf-ajaxload',
                    src: 'sf-src',
                    cancel: 'sf-canceltrack',
                    loaded: 'sf-ajaxloaded',
                },
                attributes: {

                },
                modifier: {
                    src: '',
                },
            }
        },
    }
// ================ END CONSTRUCTOR ================ //
}
SF.Controller = function() {
    // Constructor

        this.stack = stack;
        var _this = this;

        // Подключение модулей
        SF.Events.call(this);
        SF.Search.call(this);
        SF.Blocks.call(this);
        SF.Provider.call(this);
        //SF.Property.call(this);

        if(this.el) {
            this.send('blocksstart', this.el);
        } else {
            
            if(this.stack.ev('specialinit')) {

                this.receive('specialinit', window, function(e) {
                    new SF.Special(e.target, e.target.params);
                });
                this.stack.events.push('specialinit');
            }

            if(this.stack.ev('searchend')) {
                this.receive('searchend', window, function(e) {
                    _this.send('blocksstart', e.target);
                });
                this.send('searchstart', window);
                this.stack.events.push('searchend');

            }
        }

    // end Constructor    
}
/**
 * Search модуль поиска инициализаций т.е. поиска элементов вызывающих определенные блоки/компоненты    
 */
SF.Search = function() {
    /**
     * Search uninitialized Modal Window
     * Поиск неинициализированных модальных окон
     */
    this.search = function() {
        var el = document.body.querySelectorAll('*');   // Поиск всех элементов в DOM-дереве
        for(var j = 0; j < el.length; j++) {    // Обход найденых элементов
            var par = new SF.Parameters();
            var params = par.newparams();         // Новые параметры
            for(var key in params.blocks) {    // Проверка
                var init = el[j],
                    block = params.blocks[key];
                if(init.hasAttribute(block.data.init)) {    // Проверяем есть ли у элемента инициализация блока
                    var i = 0;
                    for(var k = 0; k < this.stack.el.length; k++)   // Проверяем был ли инициализированн текущий элемен ранее
                        if(this.stack.el[k] == init) i++;
                    if(i == 0) {
                        init.blocks = key;          // Записываем наименование блока
                        init.params = block;  // Присваиваем инициализатору список стандратных параметров
                        par.updateparams(init);
                        this.send('searchend', init); // Отправка сигнала (события) на элемент для дальнейшего построения
                    }
                }
            }
        }
    }

    this.searchModal = function(element) {
        var el = element.querySelectorAll('[sf-modal]');   // Поиск всех элементов в DOM-дереве
        for(var j = 0; j < el.length; j++) {    // Обход найденых элементов
            var par = new SF.Parameters();
            var params = par.newparams();         // Новые параметры
            for(var key in params.blocks) {    // Проверка
                var init = el[j],
                    block = params.blocks[key];
                if(init.hasAttribute(block.data.init)) {    // Проверяем есть ли у элемента инициализация блока
                    var i = 0;
                    for(var k = 0; k < this.stack.el.length; k++)   // Проверяем был ли инициализированн текущий элемен ранее
                        if(this.stack.el[k] == init) i++;
                    if(i == 0) {
                        init.blocks = key;          // Записываем наименование блока
                        init.params = block;  // Присваиваем инициализатору список стандратных параметров
                        par.updateparams(init);
                        this.send('searchend', init); // Отправка сигнала (события) на элемент для дальнейшего построения
                    }
                }
            }
        }
    }


    this.searchdata = function(content) {
        var el = content.querySelectorAll('*');   // Поиск всех элементов в DOM-дереве
        for(var j = 0; j < el.length; j++) {    // Обход найденых элементов
            var par = new SF.Parameters();
            var params = par.newparams();         // Новые параметры
            for(var key in params.blocks) {    // Проверка
                var init = el[j],
                    block = params.blocks[key];
                if(init.hasAttribute(block.data.init)) {    // Проверяем есть ли у элемента инициализация блока
                    var i = 0;
                    for(var k = 0; k < this.stack.el.length; k++)   // Проверяем был ли инициализированн текущий элемен ранее
                        if(this.stack.el[k] == init) i++;
                    if(i == 0) {
                        init.blocks = key;          // Записываем наименование блока
                        init.params = block;  // Присваиваем инициализатору список стандратных параметров
                        par.updateparams(init);
                        this.send('searchend', init); // Отправка сигнала (события) на элемент для дальнейшего построения
                    }
                }
            }
        }
    }

    // ================ CONSTRUCTOR ================ //
        var _this = this;
        if(this.stack.ev('searchstart')) {
            this.receive('searchstart', window, function(e) { 
                _this.search();
            });
            this.receive('searchstartmodal', window, function(e) { 
                _this.searchModal(document);
            });
            this.stack.events.push('searchstart');
        }
    // ================ END CONSTRUCTOR ================ //    
}
/**
 * Blocks - модуль распределения обязанностей
 */
SF.Blocks = function() {
    var _this = this;

    if(this.stack.ev('providerend')) {
        this.receive('providerend', window, function(e) {
            _this.send(e.target.event, e.target);
        });
        this.stack.events.push('providerend');
    }

    if(this.stack.ev('blocksstart')) {
        this.receive('blocksstart', window, function(e) {
            _this.send('providerstart', e.target);
        });
        this.stack.events.push('blocksstart')
    }

    
}
/**
 * ProviderDom - модуль создания блоков, другими словами поставщик блоков/компонентов
 */
SF.Provider = function() {

    this.special = function(e) {

        function selectcolor() {
            switch(_this.cookies.get('specialcolor')) {
                case 'specialwhite':
                    return 'Белая';
                case 'specialblack': 
                    return 'Черная';
                case 'specialyellow':
                    return 'Желтая';
                case 'specialblue':
                    return 'Голубая';
                case 'specialgreen':
                    return 'Зеленая'
            }
            return 'Белая';
        }

        function selectkegl() {
            var v = _this.cookies.get('specialkegl');
            if(v != '') return v + ' пунктов';
            else return '16 пунктов';
        }

        function selectkerning() {
            switch(_this.cookies.get('specialkerning')) {
                case 'normal':
                    return 'Нормальный';
                case 'middle':
                    return 'Средний';
                case 'big':
                    return 'Большой';
            }
            return 'Нормальный';
        }

        function selectimg() {
            switch(_this.cookies.get('specialimage')) {
                case 'off':
                    return 'Выключены';
                case 'onblack':
                    return 'Чёрно-белые';
                case 'oncolor':
                    return 'Цветные';
            }
            return 'Цветные';
        }
        
        function selectinterval() {
            switch(_this.cookies.get('specialinterval')) {
                case '1.0':
                    return 'Одинарный';
                case '1.5':
                    return 'Полуторный';
                case '2.0':
                    return 'Двойной';
            }
            return 'Одинарный';
        }

        function addbtn(btn, param) {
            btn.className = param.class;
            btn.style.backgroundColor = param.background;
            btn.style.borderColor = 'black';
            btn.style.color = param.border;
            btn.style.fontSize = param.font;
            btn.innerHTML = param.text;
            btn.title = param.title;
        }

        function selectfont() {
            //console.log(_this.cookies.get('specialfont'));
            switch(_this.cookies.get('specialfont')) {
                case 'default':
                    return 'Стандартный';
                case 'sans':
                    return 'Без засечек'
                case 'serif':
                    return 'С засечками';
                case 'mono':
                    return 'Моноширинной';
            }
            return 'Стандартный';
        }

        function selectsound() {
            switch(_this.cookies.get('specialsound')) {
                case 'on':
                    return 'Включен';
                case 'off':
                    return 'Выключен';
                default:
                    return 'Выключен';
            }
        }

        var _this = this,
            par = e.target.params,
            el = e.target;

        var panel = {
            font: {
                name: {},
                content: {
                    btnsans: {},    // Arial
                    btnserif: {},   // Times New Roman
                    btnmono: {},    // Courier New
                },
                status: {},
            },
            kegl: {
                name: {},
                content: {
                    btnmore: {},
                    btnless: {},
                },
                status: {},
            },
            interval: {
                name: {},
                content: {
                    btnone: {},
                    btnhalf: {},
                    btntwo: {},
                },
                status: {},
            },
            kerning: {
                name: {},
                content: {
                    btnnormal: {},
                    btnmiddle: {},
                    btnbig: {},
                },
                status: {},
            },
            color: {
                name: {},
                content: {
                    btnwhite: {},
                    btnblack: {},
                    btnyellow: {},
                    btnblue: {},
                    btngreen: {},
                },
                status: {},
            },
            img: {
                name: {},
                content: {
                    btnoff: {},
                    btnbw: {},
                    btncolor: {},
                },
                status: {},
            },
            sound: {
                name: {},
                content: {
                    btnon:{},
                    btnoff: {},
                },
                status: {},
                play: {},
            },
            onoff: {
                name: {},
                content: {
                    btnup: {},
                    btndefault: {},
                    btnonoff: {},
                },
                status: {},
            },
        };

        panel = document.createElement('nav');

        panel.className = par.modifier.panel;
        panel.setAttribute('sf-special-panel', '');
        panel.style.backgroundColor = "#FFFFFF";
        panel.style.position = 'relative';
        panel.style.transition = 'margin-top 1s ease';

        panel.font = document.createElement('div');
        panel.font.className = par.modifier.font;

        panel.font.name = document.createElement('div');
        panel.font.content = document.createElement('div');
        panel.font.status = document.createElement('div');

        panel.font.name.classList.add('font-text', 'mb-2');
        panel.font.name.style.color = 'rgba(0,0,0, 0.87)';
        panel.font.name.innerHTML = "Шрифт";

        panel.font.appendChild(panel.font.name);

        panel.font.content.classList.add('font-content', 'btn-group');
        panel.font.content.btnsans = document.createElement('button');
        panel.font.content.btnserif = document.createElement('button');
        panel.font.content.btnmono = document.createElement('button');

        addbtn(
            panel.font.content.btnsans,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'Arial',
                title: 'Шрифт Arial(без засечек)',
            }
        );

        panel.font.content.btnsans.addEventListener('click', function(e) {
            _this.send(par.events.fontsans, panel.font.content.btnsans);
            panel.font.status.innerHTML = 'Без засечек';
        });

        addbtn(
            panel.font.content.btnserif,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'Times',
                title: 'Шрифт Times(c засечками)',
            }
        );

        panel.font.content.btnserif.addEventListener('click', function(e) {
            _this.send(par.events.fontserif, panel.font.content.btnserif);
            panel.font.status.innerHTML = 'С засечками';
        });

        addbtn(
            panel.font.content.btnmono,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'Courier',
                title: 'Шрифт Courier New',
            }
        );

        panel.font.content.btnmono.addEventListener('click', function(e) {
            _this.send(par.events.fontmono, panel.font.content.btnmono);
            panel.font.status.innerHTML = 'Моноширинной';
        });


        panel.font.status.classList.add('status-text', 'mt-2');
        panel.font.status.style.color = 'rgba(0,0,0, 0.87)';
        panel.font.status.innerHTML = selectfont();

        panel.font.content.appendChild(panel.font.content.btnsans);
        panel.font.content.appendChild(panel.font.content.btnserif);
        panel.font.content.appendChild(panel.font.content.btnmono);

        panel.font.appendChild(panel.font.content);
        panel.font.appendChild(panel.font.status);
        panel.appendChild(panel.font);

        // #endregion Font

        panel.kegl = document.createElement('div');
        panel.kegl.className = par.modifier.kegl;

        panel.kegl.name = document.createElement('div');
        panel.kegl.content = document.createElement('div');
        panel.kegl.status = document.createElement('div');

        panel.kegl.name.classList.add('kegl-text', 'mb-2');
        panel.kegl.name.style.color = 'rgba(0,0,0,0.87)';
        panel.kegl.name.innerHTML = "Размер шрифта";

        panel.kegl.appendChild(panel.kegl.name);

        panel.kegl.content.classList.add('kegl-content', 'btn-group');

        panel.kegl.content.btnmore = document.createElement('button');
        panel.kegl.content.btnless = document.createElement('button');

        addbtn(
            panel.kegl.content.btnmore,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'A-',
                title: 'Уменьшить шрифт',
            }
        );
        panel.kegl.content.btnmore.addEventListener('click', function(e) {
            _this.send(par.events.keglmore, panel.kegl.content.btnmore);
            panel.kegl.status.innerHTML = selectkegl();            
        });
        addbtn(
            panel.kegl.content.btnless,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'A+',
                title: 'Увеличить шрифт',
            }
        );
        panel.kegl.content.btnless.addEventListener('click', function(e) {
            _this.send(par.events.keglless, panel.kegl.content.btnless);
            panel.kegl.status.innerHTML = selectkegl();
        });

        panel.kegl.status.classList.add('status-text', 'mt-2');
        panel.kegl.status.style.color = 'rgba(0,0,0, 0.87)';
        panel.kegl.status.innerHTML = selectkegl();


        panel.kegl.content.appendChild(panel.kegl.content.btnmore);
        panel.kegl.content.appendChild(panel.kegl.content.btnless)
        panel.kegl.appendChild(panel.kegl.content);
        panel.kegl.appendChild(panel.kegl.status);
        panel.appendChild(panel.kegl);

        // #region Kerning ===========================
            panel.kerning = document.createElement('div');
            panel.kerning.className = par.modifier.kerning;
            panel.kerning.name = document.createElement('div');
            panel.kerning.content = document.createElement('div');
            panel.kerning.status = document.createElement('div');

            panel.kerning.name.classList.add('name-text', 'mb-2');
            panel.kerning.name.style.color = 'rgba(0,0,0,0.87)';
            panel.kerning.name.innerHTML = "Кернинг";
            
            panel.kerning.appendChild(panel.kerning.name);

            panel.kerning.content.classList.add('kerning-content', 'btn-group');

            panel.kerning.status.classList.add('status-text', 'mt-2');
            panel.kerning.status.style.color = 'rgba(0,0,0,0.87)';
            panel.kerning.status.innerHTML = selectkerning();

            panel.kerning.content.btnnormal = document.createElement('button');
            panel.kerning.content.btnmiddle = document.createElement('button');
            panel.kerning.content.btnbig = document.createElement('button');

            addbtn(
                panel.kerning.content.btnnormal,
                {
                    class: 'btn btn-outline px-3',
                    background: 'white',
                    border: 'black',
                    font: '14px',
                    text: '1.0',
                    title: "Нормальный"
                }
            );
    
            panel.kerning.content.btnnormal.addEventListener('click', function(e) {
                _this.send(par.events.kerningnormal, panel.kerning.content.btnnormal);
                panel.kerning.status.innerHTML = selectkerning();            
            });

            addbtn(
                panel.kerning.content.btnmiddle,
                {
                    class: 'btn btn-outline px-3',
                    background: 'white',
                    border: 'black',
                    font: '14px',
                    text: '1.5',
                    title: 'Средний',
                }
            );
    
            panel.kerning.content.btnmiddle.addEventListener('click', function(e) {
                _this.send(par.events.kerningmiddle, panel.kerning.content.btnmiddle);
                panel.kerning.status.innerHTML = selectkerning();            
            });

            addbtn(
                panel.kerning.content.btnbig,
                {
                    class: 'btn btn-outline px-3',
                    background: 'white',
                    border: 'black',
                    font: '14px',
                    text: '2.0',
                    title: 'Большой'
                }
            );
    
            panel.kerning.content.btnbig.addEventListener('click', function(e) {
                _this.send(par.events.kerningbig, panel.kerning.content.btnbig);
                panel.kerning.status.innerHTML = selectkerning();            
            });

            panel.kerning.content.appendChild(panel.kerning.content.btnnormal);
            panel.kerning.content.appendChild(panel.kerning.content.btnmiddle);
            panel.kerning.content.appendChild(panel.kerning.content.btnbig);
            panel.kerning.appendChild(panel.kerning.content);
            panel.kerning.appendChild(panel.kerning.status);
            panel.appendChild(panel.kerning);
        // #endregion ===========================
        
        panel.interval = document.createElement('div');
        panel.interval.className = par.modifier.interval;
        panel.interval.name = document.createElement('div');
        panel.interval.name.classList.add('kegl-text', 'mb-2');
        panel.interval.name.style.color = 'rgba(0,0,0,0.87)';
        panel.interval.name.innerHTML = "Интервал";

        panel.interval.appendChild(panel.interval.name);

        panel.interval.content = document.createElement('div');
        panel.interval.status = document.createElement('div');
        panel.interval.content.classList.add('interval-content', 'btn-group');
        
        panel.interval.content.btnone = document.createElement('button');
        panel.interval.content.btnhalf = document.createElement('button');
        panel.interval.content.btntwo = document.createElement('button');

        addbtn(
            panel.interval.content.btnone,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: '1.0',
                title: "Одинарный",
            }
        );

        panel.interval.content.btnone.addEventListener('click', function(e) {
            _this.send(par.events.intervalone, panel.interval.content.btnone);
            panel.interval.status.innerHTML = selectinterval();            
        });

        addbtn(
            panel.interval.content.btnhalf,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: '1.5',
                title: "Полуторный",
            }
        );

        panel.interval.content.btnhalf.addEventListener('click', function(e) {
            _this.send(par.events.intervalhalf, panel.interval.content.btnhalf);
            panel.interval.status.innerHTML = selectinterval();            
        });

        addbtn(
            panel.interval.content.btntwo,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: '2.0',
                title: "Двойной",
            }
        );

        panel.interval.content.btntwo.addEventListener('click', function(e) {
            _this.send(par.events.intervaltwo, panel.interval.content.btntwo);
            panel.interval.status.innerHTML = selectinterval();
        });

        panel.interval.status.classList.add('status-text', 'mt-2');
        panel.interval.status.style.color = 'rgba(0,0,0, 0.87)';
        panel.interval.status.innerHTML = selectinterval(); 

        panel.interval.content.appendChild(panel.interval.content.btnone);
        panel.interval.content.appendChild(panel.interval.content.btnhalf);
        panel.interval.content.appendChild(panel.interval.content.btntwo);
        panel.interval.appendChild(panel.interval.content);
        panel.interval.appendChild(panel.interval.status);
        panel.appendChild(panel.interval);

        // =================================
        
        panel.color = document.createElement('div');

        panel.color.className = par.modifier.color;

        panel.color.name = document.createElement('div');
        panel.color.name.classList.add('color-text', 'mb-2');
        panel.color.name.style.color = 'rgba(0,0,0,0.87)';
        panel.color.name.innerHTML = "Цвет";

        panel.color.appendChild(panel.color.name);

        panel.color.content = document.createElement('div');
        panel.color.status = document.createElement('div');

        panel.color.content.classList.add('color-content', 'btn-group');


        panel.color.status.classList.add('status-text', 'mt-2');
        panel.color.status.style.color = 'rgba(0,0,0, 0.87)';

        panel.color.status.innerHTML = selectcolor() + ' схема';

        // #region Кнопки управления цветовой схемой
        
        panel.color.content.btnwhite = document.createElement('button');
        panel.color.content.btnblack = document.createElement('button');
        panel.color.content.btnyellow = document.createElement('button');
        panel.color.content.btnblue = document.createElement('button');
        panel.color.content.btngreen = document.createElement('button');

        addbtn(
            panel.color.content.btnwhite,
            {
                class: 'btn btn-outline px-2',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'C',
                title: "Белая схема",
            }
        );

        panel.color.content.btnwhite.addEventListener('click', function(e) {
            if(_this.cookies.get('specialcolor') != par.events.colorwhite) {
                _this.send(par.events.colorwhite, e.target);
                panel.color.status.innerHTML = selectcolor() + ' схема';
            }
        });

        addbtn(
            panel.color.content.btnblack,
            {
                class: 'btn btn-outline px-2',
                background: 'black',
                border: 'white',
                font: '14px',
                text: 'C',
                title: "Черная схема",
            }
        );

        panel.color.content.btnblack.addEventListener('click', function(e) {
            if(_this.cookies.get('specialcolor') != par.events.colorblack) {
                _this.send(par.events.colorblack, e.target);
                panel.color.status.innerHTML = selectcolor() + ' схема';
            }
        });

        addbtn(
            panel.color.content.btnyellow,
            {
                class: 'btn btn-outline px-2',
                background: '#FF0',
                border: 'black',
                font: '14px',
                text: 'C',
                title: "Желтая схема",
            }
        );

        panel.color.content.btnyellow.addEventListener('click', function(e) {
            if(_this.cookies.get('specialcolor') != par.events.coloryellow) {
                _this.send(par.events.coloryellow, e.target);
                panel.color.status.innerHTML = selectcolor() + ' схема';                
            }
        });

        addbtn(
            panel.color.content.btnblue,
            {
                class: 'btn btn-outline px-2',
                background: '#9fd7ff',
                border: 'black',
                font: '14px',
                text: 'C',
                title: "Голубая схема",
            }
        );
        panel.color.content.btnblue.addEventListener('click', function(e) {
            if(_this.cookies.get('specialcolor') != par.events.colorblue) {
                _this.send(par.events.colorblue, e.target);
                panel.color.status.innerHTML = selectcolor() + ' схема';
            }
        });
        addbtn(
            panel.color.content.btngreen,
            {
                class: 'btn btn-outline px-2',
                background: 'black',
                border: '#a9dd38',
                font: '14px',
                text: 'C',
                title: "Зеленая схема",
            }
        );

        panel.color.content.btngreen.addEventListener('click', function(e) {
            if(_this.cookies.get('specialcolor') != par.events.colorgreen) {
                _this.send(par.events.colorgreen, e.target);
                panel.color.status.innerHTML = selectcolor() + ' схема';
            }                
        });

        panel.color.content.appendChild(panel.color.content.btnwhite);
        panel.color.content.appendChild(panel.color.content.btnblack);
        panel.color.content.appendChild(panel.color.content.btnyellow);
        panel.color.content.appendChild(panel.color.content.btnblue);
        panel.color.content.appendChild(panel.color.content.btngreen);

        // #endregion


        panel.color.appendChild(panel.color.content);
        panel.color.appendChild(panel.color.status);
        panel.appendChild(panel.color);

        // #region Image =================================
        panel.img = document.createElement('div');

        panel.img.className = par.modifier.img;

        panel.img.name = document.createElement('div');
        panel.img.name.classList.add('color-text', 'mb-2');
        panel.img.name.style.color = 'rgba(0,0,0,0.87)';
        panel.img.name.innerHTML = "Изображения";

        panel.img.appendChild(panel.img.name);

        panel.img.content = document.createElement('div');

        panel.img.status = document.createElement('div');
        panel.img.status.classList.add('status-text', 'mt-2');
        panel.img.status.style.color = 'rgba(0,0,0,0.87)';

        panel.img.status.innerHTML = selectimg();


        panel.img.content.classList.add('img-content', 'btn-group');
        
        panel.img.content.btnoff = document.createElement('button');
        panel.img.content.btnbw = document.createElement('button');
        panel.img.content.btncolor = document.createElement('button');

        addbtn(
            panel.img.content.btnoff,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'Выкл',
                title: "Выключить изображения",
            }
        );
        panel.img.content.btnoff.addEventListener('click', function(e) {
            _this.send(par.events.imageoff, panel.img.content.btnoff);
            panel.img.status.innerHTML = selectimg();
        });
        addbtn(
            panel.img.content.btnbw,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'Ч/Б',
                title: 'Черно-белые изображения',
            }
        );
        panel.img.content.btnbw.addEventListener('click', function(e) {
            _this.send(par.events.imageblack, panel.img.content.btnbw);
            panel.img.status.innerHTML = selectimg();
        });
        addbtn(
            panel.img.content.btncolor,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'Цвет',
                title: "Цветные изображения",
            }
        );
        panel.img.content.btncolor.addEventListener('click', function(e) {
            _this.send(par.events.imagecolor, panel.img.content.btncolor);
            panel.img.status.innerHTML = selectimg();
        });
        panel.img.content.appendChild(panel.img.content.btnoff);
        panel.img.content.appendChild(panel.img.content.btnbw);
        panel.img.content.appendChild(panel.img.content.btncolor);


        panel.img.appendChild(panel.img.content);
        panel.img.appendChild(panel.img.status);
        panel.appendChild(panel.img);

        // =================================
        
        /*
            sound: {
                name: {},
                content: {
                    btnon:{},
                    btnoff: {},
                },
                status: {},
            },
        */
        /*if(_this.getproperty('special_speech') == 'Y') {
            
            panel.sound = document.createElement('div');
            panel.sound.className = par.modifier.sound;
    
            // ========== name
            panel.sound.name = document.createElement('div');
            panel.sound.name.classList.add('sound-text', 'mb-2')
            panel.sound.name.style.color = 'rgba(0,0,0,0.87)';
            panel.sound.name.innerHTML = 'Звук';
    
            panel.sound.appendChild(panel.sound.name);
            // ===========
            panel.sound.content = document.createElement('div');
            panel.sound.content.classList.add('sound-content', 'btn-group');
            panel.sound.content.btnon = document.createElement('button');
            panel.sound.content.btnoff = document.createElement('button');
    
            addbtn(
                panel.sound.content.btnon,
                {
                    class: 'btn btn-outline px-3',
                    background: 'white',
                    border: 'black',
                    font: '14px',
                    text: 'Вкл',
                    title: "Включить озвучивание текста",
                }
            );
    
            panel.sound.content.btnon.addEventListener('click', function(e) {
                _this.send(par.events.soundon, panel);
                panel.sound.status.innerHTML = selectsound();            
            });
    
            addbtn(
                panel.sound.content.btnoff,
                {
                    class: 'btn btn-outline px-3',
                    background: 'white',
                    border: 'black',
                    font: '14px',
                    text: 'Выкл',
                    title: "Выключить озвучивание текста",
                }
            );
    
            panel.sound.content.btnoff.addEventListener('click', function(e) {
                _this.send(par.events.soundoff, panel);
                panel.sound.status.innerHTML = selectsound();
            });
    
            // ===========
            panel.sound.status = document.createElement('div');
            panel.sound.status.classList.add('status-text', 'mt-2');
            panel.sound.status.style.color = 'rgba(0,0,0,0.87)';
            panel.sound.status.innerHTML = selectsound();
            // ===========
    
            panel.sound.content.appendChild(panel.sound.content.btnon);
            panel.sound.content.appendChild(panel.sound.content.btnoff);
    
            panel.sound.appendChild(panel.sound.content);
            panel.sound.appendChild(panel.sound.status);
            panel.appendChild(panel.sound);
    
            this.includeScript(par.modifier.specialsoundscript);
        }*/



        // =================================

        panel.onoff = document.createElement('div');

        panel.onoff.className = par.modifier.onoff;

        panel.onoff.name = document.createElement('div');
        panel.onoff.name.classList.add('onoff-text', 'mb-2');
        panel.onoff.name.style.color = 'rgba(0,0,0,0.87)';
        panel.onoff.name.innerHTML = "Панель";

        panel.onoff.appendChild(panel.onoff.name);

        panel.onoff.content = document.createElement('div');
        panel.onoff.content.classList.add('onoff-content', 'btn-group');
        
        panel.onoff.content.btnup = document.createElement('button');
        panel.onoff.content.btndefault = document.createElement('button');
        panel.onoff.content.btnonoff = document.createElement('button');


        addbtn(
            panel.onoff.content.btndefault,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: '<i class="fas fa-sync-alt" style="color:black!important"></i>',
                title: "Сбросить настройки",
            }
        );

        panel.onoff.content.btndefault.addEventListener('click', function(e) {
            _this.send(par.events.defaultsetting, panel);
        });

        addbtn(
            panel.onoff.content.btnonoff,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: 'Выкл',
                title: 'Выключить версию для слабовидящих',
            }
        );

        panel.onoff.content.btnonoff.addEventListener('click', function(e) {
            _this.send(par.events.close, panel);
        });

        addbtn(
            panel.onoff.content.btnup,
            {
                class: 'btn btn-outline px-3',
                background: 'white',
                border: 'black',
                font: '14px',
                text: '<i class="far fa-angle-up" style="color:black!important"></i>',
                title: "Свернуть панель",
            }
        )

        panel.onoff.content.btnup.style.position = 'absolute';
        panel.onoff.content.btnup.style.bottom = '0';
        panel.onoff.content.btnup.style.right = '0';
        panel.onoff.content.btnup.style.borderBottom = '0 solid black';
        panel.onoff.content.btnup.style.borderRadius = '0';

        if(_this.cookies.get('specialup') == 'down') {
            panel.style.marginTop = '-' + panel.clientHeight + 'px';
            panel.onoff.content.btnup.style.bottom = '-' + panel.onoff.content.btnup.clientHeight + 'px';
            panel.onoff.content.btnup.style.transform = 'rotate(180deg)';
            _this.cookies.set('specialup', 'up', 7);
        } else {
            panel.style.marginTop = '0';
            panel.onoff.content.btnup.style.bottom = '0';
            panel.onoff.content.btnup.style.transform = 'rotate(0deg)';
            _this.cookies.set('specialup', 'down', 7);
        }

        panel.onoff.content.btnup.addEventListener('click', function(e) {
            _this.send(par.events.up, panel);
        });

        panel.onoff.content.appendChild(panel.onoff.content.btndefault);
        panel.onoff.content.appendChild(panel.onoff.content.btnonoff);

        panel.onoff.appendChild(panel.onoff.content);
        panel.appendChild(panel.onoff);
        panel.appendChild(panel.onoff.content.btnup);

        // #endregion =================================

        return panel;
    }

    // #endregion Panel Special

    /**
     * 
     * @param {*} e 
     */
    this.modal = function(e) {
        var overlay = {
            load: {},
            area: {
                content: {},
                close: {},
            },
        },
        _this = this,
        par = e.target.params,
        page = document.body.querySelector('.sf-pagewrap-area'),
        el = e.target;

        overlay = document.createElement('div');
        overlay.load = document.createElement('div');
        overlay.load.innerHTML = par.load;
        overlay.area = document.createElement('div');
        overlay.area.content = document.createElement('div');
        overlay.area.close = document.createElement('button');

        overlay.load.setAttribute(par.attributes.load, '');
        overlay.className = par.modifier.overlay;
        overlay.style.display = 'flex';
        overlay.load.style.position = 'fixed';
        overlay.load.style.top = '0';
        overlay.load.style.left = '0';
        overlay.load.style.width = '100%';
        overlay.setAttribute(par.attributes.overlay, '');

        overlay.addEventListener('click', function(e) {
            if(e.target.hasAttribute(par.attributes.overlay))
                _this.send(par.events.close, overlay);
        });

        overlay.classList = par.modifier.overlay;
        overlay.setAttribute(par.data.src, par.modifier.src);
        overlay.style.zIndex = this.topZIndex() + 1;
        
        overlay.area.setAttribute(par.attributes.modal, '');
        overlay.area.className = par.modifier.modal;
        overlay.area.content.setAttribute(par.attributes.content, '');
        overlay.area.content.className = par.modifier.content;
        overlay.area.style.opacity = '0';
        overlay.area.appendChild(overlay.area.content);

        overlay.area.close.addEventListener('click', function(e) {
            _this.send(par.events.close, overlay);
        });

        overlay.area.close.setAttribute(par.attributes.close, '');
        overlay.area.close.className = par.modifier.close;
        overlay.area.appendChild(overlay.area.close);
        overlay.appendChild(overlay.load);
        overlay.appendChild(overlay.area);

        // Событие происходит перед открытием окна
        this.receive(par.events.open, overlay, function(e) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            try {
                if(el.hasAttribute(par.data.blur) || (par.attributes.blur != null && par.attributes.blur != undefined)) {
                    //console.log(page)
                    if(page !== null && page !== undefined) {
                        //console.log(par.modifier.blur)
                        page.classList.add(par.modifier.blur.replace(" ", ''));
                    }
                }
            } catch(exp) {
                
            }

            
        });

        // Событие происходит перед закрытием окна
        this.receive(par.events.close, overlay, function(e) {
            if(overlay.parentNode != null) {
                overlay.area.style.opacity = '0';
                overlay.area.content.innerHTML = '';
                overlay.load.style.display = 'flex';
                overlay.parentNode.removeChild(overlay);
            }
            document.body.style.overflow = 'auto';
            try {
                if(el.hasAttribute(par.data.blur) || (par.attributes.blur != null && par.attributes.blur != undefined))
                if(page !== null && page !== undefined)
                    page.classList.remove(par.modifier.blur.replace(" ", ""));
            } catch(exp) {

            }
            
        });
        
        return overlay;
    }

    this.iframe = function(e) {
        /*var overlay = {
            load: {},
            area: {
                content: {},
                close: {},
            },
        },
        _this = this,
        page= document.body.querySelector('.sf-pagewrap-area'),
        el = e.target;*/
        var overlay = {
            load: {},
            area: {
                content: {},
                close: {},
            },
        },
        _this = this,
        par = e.target.params,
        page = document.body.querySelector('.sf-pagewrap-area'),
        el = e.target;



        overlay = document.createElement('div');
        overlay.load = document.createElement('div');
        overlay.load.innerHTML = par.load;
        overlay.area = document.createElement('div');
        overlay.area.content = document.createElement('iframe');
        overlay.area.content.src = par.modifier.src;
        overlay.area.close = document.createElement('button');

        overlay.load.setAttribute(par.attributes.load, '');
        overlay.load.className = par.modifier.load;
        overlay.load.style.position = 'fixed';
        overlay.load.style.top = '0';
        overlay.load.style.left = '0';
        overlay.load.style.width = '100%';
        overlay.setAttribute(par.attributes.overlay, '');

        overlay.addEventListener('click', function(e) {    
            if(e.target.hasAttribute(par.attributes.overlay))
                _this.send(par.events.close, overlay);
            /*console.log(par.attributes.overlay)           
            if(el.hasAttribute(par.attributes.overlay)) {
                console.log(overlay)
                overlay.parenNode.removeChild(overlay);
                document.body.style.overflow = 'auto';
                if(el.hasAttribute(par.data.blur) || par.attributes.blur)
                    if(page !== null && page !== undefined)
                        page.classList.remove(par.modifier.opt);
            }*/
        });

        overlay.classList = par.modifier.overlay;
        overlay.setAttribute(par.data.src, par.modifier.src);
        overlay.style.zIndex = this.topZIndex() + 1;

        overlay.area.setAttribute(par.attributes.content, "");
        overlay.area.className = par.modifier.modal;
        overlay.area.content.setAttribute(par.attributes.content, "");
        overlay.area.content.className = par.modifier.content;
        overlay.area.style.opacity = "0";
        overlay.area.appendChild(overlay.area.content);

        /*overlay.area.close.addEventListener('click', function(e) {
            overlay.parenNode.removeChild(overlay);
            document.body.style.overflowY = 'auto';
            if(el.hasAttribute(par.data.blur) || par.attributes.blur)
                if(page !== null && page !== undefined)
                    page.classList.remove(par.modifier.blur);
         });*/

         overlay.area.close.addEventListener('click', function(e) {
            _this.send(par.events.close, overlay);
        });


         overlay.area.close.setAttribute(par.attributes.close, '');
         overlay.area.close.className = par.modifier.close;
         overlay.area.appendChild(overlay.area.close);
         overlay.appendChild(overlay.load);
         overlay.appendChild(overlay.area);

         this.receive(par.events.open, el || window, function(e) {
            overlay.style.opacity = 1;
            document.body.style.overflow = 'hidden';
            overlay.style.display = 'flex';
            if(el.hasAttribute(par.data.blur) || par.attributes.blur)
                if(page !== null && page !== undefined)
                    page.classList.add(par.modifier.blur);
         });

         this.receive(par.events.close, overlay, function(e) {
            if(overlay.parentNode != null) {
                overlay.area.style.opacity = '0';
                overlay.area.content.innerHTML = '';
                overlay.load.style.display = 'flex';
                overlay.parentNode.removeChild(overlay);
            }
            document.body.style.overflow = 'auto';
            if(el.hasAttribute(par.data.blur) || par.attributes.blur)
                if(page !== null && page !== undefined)
                    page.classList.add(par.modifier.blur);
         });

         /*if(el.hasAttribute(par.data.blur) || par.attributes.blur)
            if(page !== null && page !== undefined)
                page.classList.add(par.modifier.blur);*/
        
        this.send(par.events.open, el);
        return overlay;
    }

    this.providercreate = function(e) {
        var b = e.target.blocks,
            el = e.target,
            par = el.params;
        switch(b) {
            case 'modal':
                el.modal = this.modal(e);
                el.event = par.events.init;
                this.send("providerend", el);
                break;
            case "special":
                el.special = this.special(e);
                el.event = par.events.init;
                this.send('providerend', el);
                break;
            case 'ajaxload':
                el.event = par.events.init;
                this.send('providerend', el);
                break;
        }
    }

    var _this = this;

    if(this.stack.ev('providerstart')) {
        this.receive('providerstart', window, function(e) {
            _this.providercreate(e);
        });
        this.stack.events.push('providerstart');        
    }

}
SF.Modal = function(el, opt) {

    this.createNew = function(e) {
        var par = new SF.Parameters(),
            modPar = par.newparams();
        window.blocks = 'modal';
        window.params = this.extend(modPar.blocks.modal, window.params);
        e.target.blocks = 'modal';
        e.target.params = this.extend(modPar.blocks.modal, window.params);
        e.target.modal = _this.modal(e);
        window.modal = _this.modal(e);
        _this.create(e);
    }

    this.create = function(e) {
        //console.log(e.target)
        var modal = e.target.modal,
            el = e.target,
            container = null,
            opt = el.params;
        if(el.hasAttribute(opt.data.iframe))
            modal = this.iframe(e);

        //console.log(modal)

        var service = document.body.querySelector('.sf-service-bottom-area');

        if(service == null || service == undefined) {
            service = document.createElement('div');
            service.classList.add(el.params.modifier.service);
            document.body.appendChild(service);
        } else container = service.querySelector('.sf-modal-container');

        if(container == null || container == undefined) {
            container = document.createElement('section');
            container.setAttribute('modal-container', '');
            container.className = opt.modifier.container;
        }
        //console.log(container)
        try {
            container.appendChild(modal);
        } catch(ex) {
            container.innerHTML = modal;
        }
        
        service.appendChild(container);

        setTimeout(function() {
            if(modal.hasAttribute(el.params.data.src)) {
                var link = modal.getAttribute(el.params.data.src).replace(" ", '');

                function simbol(ch) {
                    var str = 'abcdefghijklmnopqrstuvwxyz',
                        i = 0;
                    for(var k = 0; k < str.length; k++)
                        if(str[k] == ch) i++;
                    if(i > 0) return true;
                    else return false;
                }
                if(link != null && link != '') {
                    if(link[0] == '.' && simbol(link[1])) {

                        modal.area.content.appendChild(document.body.querySelector(link).cloneNode(true));
                        _this.searchdata(modal.area.content);
                        modal.load.style.display = 'none';
                        modal.area.style.opacity = '1';
                        _this.send(el.params.events.open, modal);
    
                    } else if(link[0] == '#') {
                        modal.area.content.appendChild(document.body.querySelector(link).cloneNode(true));
                        _this.searchdata(modal.area.content);
                        modal.load.style.display = 'none';
                        modal.area.style.opacity = '1';
                        _this.send(el.params.events.open, modal);
                    } else if(link[0] == '[') {
                        modal.area.content.appendChild(document.body.querySelector(link).cloneNode(true));
                        _this.searchdata(modal.area.content);
                        modal.load.style.display = 'none';
                        modal.area.style.opacity = '1';
                        _this.send(el.params.events.open, modal);
                    } else {

                        BX.ajax.post(
                            modal.getAttribute(el.params.data.src),
                            '',
                            function (data) {
                                if(el.hasAttribute(opt.data.iframe)) {
                                    //modal.area.content.contentWindow.document.body.innerHTML = data;
                                } else modal.area.content.innerHTML = data;

                                _this.searchdata(modal.area.content);
                                modal.load.style.display = 'none';
                                modal.area.style.opacity = '1';
                                _this.send(el.params.events.open, modal);
                            }
                        );
                    }
                } else {
                    modal.area.content.innerHTML = '<div class="w-100 h-100"><h6 class="c-red">Error</h6></div>';
                    _this.searchdata(modal.area.content);
                    modal.load.style.display = 'none';
                    modal.area.style.opacity = '1';
                    _this.send(el.params.events.open, modal);
                }
            }

        }, 1000);
    }

    // ====== CONSTRUCTOR ====== //

        SF.Events.call(this)

        this.el = el;
        this.stack = stack;
        var _this = this,
            par = new SF.Parameters(),
            param = par.newparams(),
            plugin = this.extend(param.blocks.modal, opt);

        if(this.el) {
            this.el.blocks = 'modal';
            this.el.params = plugin;
        }
        
        this.receive(plugin.events.init, window, function(e) {
            var ev = e;
            ev.target.addEventListener('click', function(e) {
                e.preventDefault();
                _this.create(ev);
            });
        });

        this.receive(plugin.events.create, window, function(e) {
            _this.createNew(e);
        });

        // Закрываем окно клавишей Escpe
        this.quickkey(function(e) {
            var overlay = _this.topZIndexElement(document.body.querySelectorAll('.sf-modal-overlay'));
            _this.send('modalclose', overlay);
        }, 27);

        /*window.addEventListener('click', function(e) {
            if(e.target.hasAttribute('sf-modal')) {
                if(e.target.params == undefined || e.target.params == null)
                    _this.send(plugin.events.create, e.target);
            }
        })*/

        SF.Controller.call(this);

    // ====== END CONSTRUCTOR ====== //

}
SF.Special = function(el, opt) {
    // #region Method
        this.updateparam = function(param) {
            for(var key in param)
                if(_this.cookies.get(key))
                    param[key] = _this.cookies.get(key);
            return param;
        }
    // #endregion
    // ====== CONSTRUCTOR ====== //
        SF.Events.call(this);
        //SF.Property.call(this);

        this.el = el;
        var _this = this,
            par = new SF.Parameters(),
            param = par.newparams(),
            plugin = this.extend(param.blocks.special, opt);
        
        this.stack = stack; 
        var html = document.querySelector('html'),
            body = document.body,
            service = body.querySelector('.sf-service-top-area');
        
        if(this.el) {
            this.el.blocks = 'special';
            this.el.params = plugin;
        }

        plugin.cookies = this.updateparam(plugin.cookies);

        if(this.stack.ev(plugin.events.close)) {
            this.receive(plugin.events.close, window, function(e) {
                var panel = e.target;
                panel.parentNode.removeChild(panel);
                _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                _this.send(plugin.events.soundoff, window);
                _this.cookies.set('specialstate', 'off', 7);
            });
            this.stack.events.push(plugin.events.close);
        }

        if(this.stack.ev(plugin.events.open)) {
            this.receive(plugin.events.open, window, function(e) {

                _this.cookies.set('specialstate', 'on', 7);
                _this.updateparam(plugin.cookies);              
                service.insertBefore(_this.el.special, service.firstChild);
                html.classList.add('special');


                switch(plugin.cookies.specialfont) {
                    case 'sans':
                        _this.send(plugin.events.fontsans, e.target);
                        break;
                    case 'serif':
                        _this.send(plugin.events.fontserif, e.target);
                        break;
                    case 'mono':
                        _this.send(plugin.events.fontmono, e.target);
                        break;
                }

                switch(plugin.cookies.specialkerning) {
                    case 'normal':
                        _this.send(plugin.events.kerningnormal, e.target);
                        break;
                    case 'middle':
                        _this.send(plugin.events.kerningmiddle, e.target);
                        break;
                    case 'big':
                        _this.send(plugin.events.kerningbig, e.target);
                        break;
                }

                switch(plugin.cookies.specialinterval) {
                    case '1.0':
                        _this.send(plugin.events.intervalone, e.target);
                        break;
                    case '1.5':
                        _this.send(plugin.events.intervalhalf, e.target);
                        break;
                    case '2.0':
                        _this.send(plugin.events.intervaltwo, e.target);
                        break;
                }
                html.style.fontSize = plugin.cookies.specialkegl + 'px';
                body.style.fontSize = plugin.cookies.specialkegl + 'px';
                switch(plugin.cookies.specialimage) {
                    case 'off':
                        html.classList.add('special-img-none');
                        html.classList.remove('special-img-black');
                        _this.cookies.set('specialimage', 'off', 7);
                        break;
                    case 'oncolor':
                        html.classList.remove('special-img-none');
                        html.classList.remove('special-img-black');
                        _this.cookies.set('specialimage', 'oncolor', 7);
                        break;
                    case 'onblack':
                        html.classList.add('special-img-black');
                        html.classList.remove('special-img-none');
                        _this.cookies.set('specialimage', 'onblack', 7);
                        break;
                }
                _this.el.linkcss = _this.addcss(plugin.modifier[plugin.cookies.specialcolor]);
                
                var panel = document.body.querySelector('[sf-special-panel]');
                if(plugin.cookies.specialsound == 'on')
                    _this.send(plugin.events.soundon, panel);
                _this.send(plugin.events.up, panel);
            });
            this.stack.events.push(plugin.events.open);
        }

        // #region Font

        if(this.stack.ev(plugin.events.fontsans)) {
            this.receive(plugin.events.fontsans, window, function(e) {
                html.classList.add('special-font-sans');
                html.classList.remove('special-font-serif');
                html.classList.remove('special-font-mono');
                _this.cookies.set('specialfont', 'sans', 7);
            });
            this.stack.events.push(plugin.events.fontsans);
        }

        if(this.stack.ev(plugin.events.fontserif)) {
            this.receive(plugin.events.fontserif, window, function(e) {
                html.classList.remove('special-font-sans');
                html.classList.add('special-font-serif');
                html.classList.remove('special-font-mono');
                _this.cookies.set('specialfont', 'serif', 7);
            });
            this.stack.events.push(plugin.events.fontserif);
        }

        if(this.stack.ev(plugin.events.fontmono)) {
            this.receive(plugin.events.fontmono, window, function(e) {
                html.classList.remove('special-font-sans');
                html.classList.remove('special-font-serif');
                html.classList.add('special-font-mono');
                _this.cookies.set('specialfont', 'mono', 7);
            });
            this.stack.events.push(plugin.events.fontmono);
        }

        // #endregion Font

        if(this.stack.ev(plugin.events.keglless)) {
            this.receive(plugin.events.keglless, window, function(e) {
                _this.updateparam(plugin.cookies);
                if(plugin.cookies.specialkegl < 24) {
                    var kegl = Number(plugin.cookies.specialkegl);
                    kegl++;
                    html.style.fontSize = kegl + 'px';
                    body.style.fontSize = kegl + 'px';
                    _this.cookies.set('specialkegl', kegl, 7);
                }
            });
            this.stack.events.push(plugin.events.keglless);
        }

        if(this.stack.ev(plugin.events.keglmore)) {
            this.receive(plugin.events.keglmore, window, function(e) {
                _this.updateparam(plugin.cookies);
                if(plugin.cookies.specialkegl > 14) {
                    var kegl = Number(plugin.cookies.specialkegl);
                    kegl--;
                    html.style.fontSize = kegl + 'px';
                    body.style.fontSize = kegl + 'px';
                    _this.cookies.set('specialkegl', kegl, 7);
                }
            });
            this.stack.events.push(plugin.events.keglmore);
        }

    // Kerning
        if(this.stack.ev(plugin.events.kerningnormal)) {
            this.receive(plugin.events.kerningnormal, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.remove('special-kerning-middle');
                html.classList.remove('special-kerning-big');
                _this.cookies.set('specialkerning', 'normal', 7);
            });
            this.stack.events.push(plugin.events.kerningnormal);
        }
        //
        if(this.stack.ev(plugin.events.kerningmiddle)) {
            this.receive(plugin.events.kerningmiddle, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.add('special-kerning-middle');
                html.classList.remove('special-kerning-big');
                _this.cookies.set('specialkerning', 'middle', 7);
            });
            this.stack.events.push(plugin.events.kerningmiddle);
        }
        if(this.stack.ev(plugin.events.kerningbig)) {
            this.receive(plugin.events.kerningbig, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.remove('special-kerning-middle');
                html.classList.add('special-kerning-big');
                _this.cookies.set('specialkerning', 'big', 7);
            });
            this.stack.events.push(plugin.events.kerningbig);
        }
    //===========

    // Interval Увеличение интервала текста
        if(this.stack.ev(plugin.events.intervalone)) {
            this.receive(plugin.events.intervalone, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.remove('special-interval-15');
                html.classList.remove('special-inerval-20');
                _this.cookies.set('specialinterval', '1', 7);
            });
            this.stack.events.push(plugin.events.intervalone);
        }

        if(this.stack.ev(plugin.events.intervalhalf)) {
            this.receive(plugin.events.intervalhalf, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.add('special-interval-15');
                html.classList.remove('special-inerval-20');
                _this.cookies.set('specialinterval', '1.5', 7);
            });
            this.stack.events.push(plugin.events.intervalhalf);
        }

        if(this.stack.ev(plugin.events.intervaltwo)) {
            this.receive(plugin.events.intervaltwo, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.remove('special-interval-15');
                html.classList.add('special-inerval-20');
                _this.cookies.set('specialinterval', '2.0', 7);
            });
            this.stack.events.push(plugin.events.intervaltwo);
        }
    // =======================================================
        if(this.stack.ev(plugin.events.imagecolor)) {
            this.receive(plugin.events.imagecolor, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.remove('special-img-none');
                html.classList.remove('special-img-black');
                _this.cookies.set('specialimage', 'oncolor', 7);
            });
            this.stack.events.push(plugin.events.imagecolor);            
        }

        if(this.stack.ev(plugin.events.imageblack)) {
            this.receive(plugin.events.imageblack, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.remove('special-img-none');
                html.classList.add('special-img-black');
                _this.cookies.set('specialimage', 'onblack', 7);
            });
            this.stack.events.push(plugin.events.imageblack);            
        }

        if(this.stack.ev(plugin.events.imageoff)) {
            this.receive(plugin.events.imageoff, window, function(e) {
                _this.updateparam(plugin.cookies);
                html.classList.add('special-img-none');
                html.classList.remove('special-img-black');
                _this.cookies.set('specialimage', 'off', 7);
            });
            this.stack.events.push(plugin.events.imageoff);
        }


    // ============================================

        if(this.stack.ev(plugin.events.colorwhite)) {
            this.receive(plugin.events.colorwhite, window, function(e) {
                _this.updateparam(plugin.cookies);
                service.insertBefore(_this.el.special, service.firstChild);
                html.classList.add('special');
                _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                _this.el.linkcss = _this.addcss(plugin.modifier.specialwhite);
                _this.cookies.set('specialcolor', 'specialwhite', 7);
            });
            this.stack.events.push(plugin.events.colorwhite);
        }

        if(this.stack.ev(plugin.events.colorblack)) {
            this.receive(plugin.events.colorblack, window, function(e) {
                //var service = document.body.querySelector('.sf-service-top-area');
                service.insertBefore(_this.el.special, service.firstChild);
                html.classList.add('special');
                _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                _this.el.linkcss = _this.addcss(plugin.modifier.specialblack);
                _this.cookies.set('specialcolor', 'specialblack', 7);
            });
            this.stack.events.push(plugin.events.colorblack);
        }

        if(this.stack.ev(plugin.events.coloryellow)) {
            this.receive(plugin.events.coloryellow, window, function(e) {
                //var service = document.body.querySelector('.sf-service-top-area');
                service.insertBefore(_this.el.special, service.firstChild);
                html.classList.add('special');
                _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                _this.el.linkcss = _this.addcss(plugin.modifier.specialyellow);
                _this.cookies.set('specialcolor', 'specialyellow', 7);
            });
            this.stack.events.push(plugin.events.coloryellow);
        }

        if(this.stack.ev(plugin.events.colorblue)) {
            this.receive(plugin.events.colorblue, window, function(e) {
                //var service = document.body.querySelector('.sf-service-top-area');
                service.insertBefore(_this.el.special, service.firstChild);
                html.classList.add('special');
                _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                _this.el.linkcss = _this.addcss(plugin.modifier.specialblue);
                _this.cookies.set('specialcolor', 'specialblue', 7);
            });
            this.stack.events.push(plugin.events.colorblue);
        }

        if(this.stack.ev(plugin.events.colorgreen)) {
            this.receive(plugin.events.colorgreen, window, function(e) {
                service.insertBefore(_this.el.special, service.firstChild);
                html.classList.add('special');
                _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                _this.el.linkcss = _this.addcss(plugin.modifier.specialgreen);
                _this.cookies.set('specialcolor', 'specialgreen', 7);
            });
            this.stack.events.push(plugin.events.colorgreen);
        }


        if(this.stack.ev(plugin.events.soundoff)) {
            this.receive(plugin.events.soundoff, window, function(e) {
                var btnplay = document.body.querySelectorAll('[sf-play]');
                for(var k = 0; k < btnplay.length; k++)
                    btnplay[k].parentNode.removeChild(btnplay[k]);
                _this.cookies.set('specialsound', 'off', 7);
            });
            this.stack.events.push(plugin.events.soundoff);
        }
        // end Sound

        if(this.stack.ev(plugin.events.defaultsetting)) {
            this.receive(plugin.events.defaultsetting, window, function(e) {
                var o  = new SF.Parameters().newparams(),
                    p = o.blocks.special,
                    panel = e.target;

                html.classList.remove('special-font-sans');
                html.classList.remove('special-font-serif');
                html.classList.remove('special-font-mono');
                panel.font.status.innerHTML = 'Стандартный';

                _this.cookies.set('specialfont', p.cookies.specialfont, 7);

                html.style.fontSize = p.cookies.specialkegl + 'px';
                panel.kegl.status.innerHTML = p.cookies.specialkegl + ' пунктов';
                _this.cookies.set('specialkegl', p.cookies.specialkegl, 7);

                html.classList.remove('special-kerning-middle');
                html.classList.remove('special-kerning-big');
                _this.cookies.set('specialkerning', p.cookies.specialkerning, 7);
                panel.kerning.status.innerHTML = 'Нормальный';

                html.classList.remove('special-interval-15');
                html.classList.remove('special-inerval-20');
                _this.cookies.set('specialinterval', '1.0', 7);
                panel.interval.status.innerHTML = 'Одинарный';

                _this.el.linkcss = _this.addcss(p.modifier.specialwhite);
                _this.cookies.set('specialcolor', p.cookies.specialcolor);

                panel.img.status.innerHTML = 'Цветные';
                html.classList.remove('special-img-none');
                html.classList.remove('special-img-black');
                _this.cookies.set('specialimage', 'on', 7);
            });
            this.stack.events.push(plugin.events.defaultsetting);
        }

        if(this.stack.ev(plugin.events.up)) {
            this.receive(plugin.events.up, window, function(e) {
                var panel = e.target;
                if(_this.cookies.get('specialup') == 'down') {
                    panel.style.marginTop = '-' + panel.clientHeight + 'px';
                    panel.onoff.content.btnup.style.bottom = '-' + panel.onoff.content.btnup.clientHeight + 'px';
                    panel.onoff.content.btnup.style.transform = 'rotate(180deg)';
                    _this.cookies.set('specialup', 'up', 7);
                } else {
                    panel.style.marginTop = '0';
                    panel.onoff.content.btnup.style.bottom = '0';
                    panel.onoff.content.btnup.style.transform = 'rotate(0deg)';
                    _this.cookies.set('specialup', 'down', 7);
                }
            });
            this.stack.events.push(plugin.events.up);
        }

    // ============================================

        if(plugin.cookies.specialstate == 'off') {
            _this.el.addEventListener('click', function(e) {
                e.preventDefault();
                switch(_this.cookies.get('specialstate')) {
                    case 'off':
                        _this.send(_this.el.params.events.open, _this.el);
                        break;
                    case 'on':
                        var panel = document.body.querySelector('[sf-special-panel]');
                        panel.parentNode.removeChild(panel);
                        _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                        _this.cookies.set('specialstate', 'off', 7);
                        break;
                    default: 
                        _this.send(_this.el.params.events.open, _this.el);
                        break;
                }
            });
        } else {
            _this.updateparam(plugin.cookies);
            _this.send(plugin.events.open, window);
            _this.el.addEventListener('click', function(e) {
                switch(_this.cookies.get('specialstate')) {
                    case 'off':
                        _this.send(_this.el.params.events.open, _this.el);
                        break;
                    case 'on':
                        var panel = document.body.querySelector('[sf-special-panel]');
                        panel.parentNode.removeChild(panel);
                        _this.el.linkcss.parentNode.removeChild(_this.el.linkcss);
                        _this.cookies.set('specialstate', 'off', 7);
                        break;
                    default: 
                        _this.send(_this.el.params.events.open, _this.el);
                        break;
                }
            });
        }
        
        
    // ====== END CONSTRUCTOR ====== //    
}
SF.AjaxLoad = function(el, opt) {

    SF.Events.call(this);

    this.el = el;
    var _this = this,
        par = new SF.Parameters(),
        param = par.newparams(),
        plugin = this.extend(param.blocks.ajaxload, opt);

        this.stack = stack;

        if(this.el) {
            this.el.blocks = 'ajaxload';
            this.el.params = plugin;
        }

        this.receive(plugin.events.init, window, function(e) {
            var el = e.target,
                interval = setInterval(_this.checklayer, 1000, el);
            _this.receive(plugin.events.cancel, el, function(e) {
                clearInterval(interval);
            })
        })

        this.receive(plugin.events.create, window, function(e) {
            _this.send('ajaxloadinit', e.target);
        })

        this.checklayer = function(el) {
            var comp = getComputedStyle(el);

            if(el.getAttribute(plugin.data.loaded) !== 'loaded' && comp.display !== 'none') {
                el.setAttribute(plugin.data.loaded, 'loaded');
                el.innerHTML = plugin.load;
                setTimeout(function(){
                    BX.ajax.post(
                        el.getAttribute(plugin.data.src),
                        '',
                        function (data) {
                            el.innerHTML = data;
                            el.load.style.display = 'none';
                        }
                    );
                }, 1000);
                
            } else el.setAttribute(plugin.data.loaded, '');

            if(el.hasAttribute(plugin.data.cancel) && el.getAttribute(plugin.data.loaded) == 'loaded')
                _this.send(plugin.events.cancel, el);
        }
}
SF.Controller.Stack = {
    el: [],
    events: [],
    log: [],
}

var stack = SF.Controller.Stack;

SF.Controller.Stack.extend = function(def, options) {
    var i = 0;
    for(var key in options) {
        if(def.length > 0)
            for(var k = 0; k < def.length; k++)
                if(def[k] == options[key]) i++;
        if(i == 0) def.push(options[key]);
        i = 0;
    }
    return def;
}


SF.Controller.Stack.addevents = function(events) {
    var e = this.stack.events,
        i = 0;
    for(var k = 0; k < e.length; k++)
       if(e[k] == events) i++;
    if(i == 0) e.push(events);
}

SF.Controller.Stack.ev = function(ev) {
    var e = this.events,
        i = 0;
    for(var k = 0; k < e.length; k++)
        if(e[k] == ev) i++;
    if(i === 0) return true;
    else return false;
}
window.addEventListener('DOMContentLoaded', function(e) {
    new SF.AjaxLoad();
    new SF.Modal();

    

    /*var callback = function(allmutations) {
        allmutations.map( function(mr) {
            var mt = 'Тип изменения: ' + mr.type;  // записываем тип изменения
            mt += 'Измененный элемент: ' + mr.target; // записываем измененный элемент.
            var event = setInterval(function(e) {
                SF.send('searchstartmodal', window);
                clearInterval(event);
            }, 1000);
            //_this.send('searchstartmodal', window)
            //console.log( mr.target );
            //SF.send('searchstartmodal', mr.target);
        });
    
    }, mo = new MutationObserver(callback),
    options = {
        // обязательный параметр: наблюдаем за добавлением и удалением дочерних элементов.
        'childList': true,
        // наблюдаем за добавлением и удалением дочерних элементов любого уровня вложенности.
        'subtree': true
    }
    mo.observe(document.body, options);*/
});
;( function( window ) {
	
	'use strict';

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function sfTab( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}

	sfTab.prototype.options = {
		start : 0
	};

	sfTab.prototype._init = function() {
		// tabs elems
		this.tabs = [].slice.call( this.el.querySelectorAll( 'nav > ul > li' ) );
		// content items
		this.items = [].slice.call( this.el.querySelectorAll( '.sf-tab-content > section' ) );
		// current index
		this.current = -1;
		// init events
		this._initEvents();
	};

	sfTab.prototype._initEvents = function() {
		var self = this;
		this.tabs.forEach( function( tab, idx ) {
			tab.addEventListener( 'click', function( ev ) {
				ev.preventDefault();
				for(var i = 0; i < self.tabs.length; i++) {
					self.tabs[i].classList.remove('active');
					self.items[i].classList.remove('active');
				}
				self._show( idx );
			});
		});
	};

	sfTab.prototype._show = function( idx ) {
		if( this.current >= 0 ) {
			this.tabs[ this.current ].classList.remove('active');
			this.items[ this.current ].classList.remove('active');
		}
		// change current
		if(idx != null) {
			this.current = idx;
			this.tabs[idx].classList.add('active');
			this.items[idx].classList.add('active');
		}
		
	};

	// add to global namespace
	window.sfTab = sfTab;

})( window );



    ;(function() {
        window.addEventListener('DOMContentLoaded', function() {
			[].slice.call( document.querySelectorAll( '.sf-tab' ) ).forEach( function( el ) {
				new sfTab( el );
			});
		});
    })();

'use strict';
/*
 * 32 avalable animation effects (from jQuery UI).
 * More info: https://api.jqueryui.com/easings/
 * 
 * linear
 * swing
 * easeInQuad
 * easeOutQuad
 * easeInOutQuad
 * easeInCubic
 * easeOutCubic
 * easeInOutCubic
 * easeInQuart
 * easeOutQuart
 * easeInOutQuart
 * easeInQuint
 * easeOutQuint
 * easeInOutQuint
 * easeInExpo
 * easeOutExpo
 * easeInOutExpo
 * easeInSine
 * easeOutSine
 * easeInOutSine
 * easeInCirc
 * easeOutCirc
 * easeInOutCirc
 * easeInElastic
 * easeOutElastic
 * easeInOutElastic
 * easeInBack
 * easeOutBack
 * easeInOutBack
 * easeInBounce
 * easeOutBounce
 * easeInOutBounce
 */

(function ($) {

    function goTop() {
        let top =  Math.max(document.body.scrollTop,document.documentElement.scrollTop),
            t;
        if(top > 0) {
            window.scrollBy(0, -10);
            t = setTimeout('goTop()', 10);
        } else clearTimeout(t);
        return false;
    }

    $(document).ready(function () {

        var btn = document.querySelector('.sf-up');
        if(btn != null) {
            var animationEasing = btn.getAttribute('data-animation'),
                scrollSpeed = btn.getAttribute('data-speed');
                scrollOffset = btn.getAttribute('data-offset');

            $(window).scroll(function () {
                var currentScrollTop = $(window).scrollTop();
                if (currentScrollTop > scrollOffset) {
                    $('.sf-up').addClass('active');
                } else {
                    $('.sf-up').removeClass('active');
                }
            });



            $('.sf-up').on("click", function (e) {
                e.preventDefault();
                var currentScrollTop = $(window).scrollTop();
                var animationTime = Math.round((currentScrollTop * 1000) / scrollSpeed);
                
                document.documentElement.style.transitionProperty = 'all';
                document.documentElement.style.transitionDuration = '0.8s';
                document.documentElement.style.transitionTimingFunction = 'ease';
                
                (function goTop() {
                    
                if (window.pageYOffset !== 0) {
                    window.scrollBy(0, -10);
                    setTimeout(goTop, 1);
                }
        
                })();
                $("html, body").animate({
                    scrollTop: 0
                }, scrollSpeed);
            });



        }
    });
}(jQuery));

setInterval(function () {
    var className = $('.sf-up').attr('class');
    if(className != null) {
        $('.usage .current-class').text(className.replace('active', ''));
        $('.usage .current-animation').text($('.animationEasing.active').data('value'));
        $('.usage .current-css').text($('#sf-up-style').attr('href'));
    }
}, 200);
$(document).ready(function() {

    $('.hide-show-btn').on('click', function (event) {
		event.preventDefault();
        if($(this).hasClass("hide")){
            $(this).parent().addClass("hidden");
		
        }else if($(this).hasClass("show")){
			$(this).parent().removeClass("hidden");
		}
    });
});
'use strict';

(function($) {

  $.fn.rkmd_rangeSlider = function() {
    var self, slider_width, slider_offset, curnt, sliderContinuous, sliderDiscrete, range, slider;
    self             = $(this);
    slider_width     = self.outerWidth();
    slider_offset    = self.offset().left;

    sliderContinuous = $('.range-regular');
    sliderDiscrete   = $('.range-led');

    if(self.hasClass('range-regular') === true) {

      sliderContinuous.each(function(i, v) {
        curnt         = $(this);
        curnt.append(sliderContinuous_tmplt());
        range         = curnt.find('input[type="range"]');
        slider        = curnt.find('.axis');
        slider_fill   = slider.find('.axis-segment');
        slider_handle = slider.find('.axis-pin');

        var range_val = range.val();
        slider_fill.css('width', range_val +'%');
        slider_handle.css('left', range_val +'%');

      });
    }

    if(self.hasClass('range-led') === true) {

      sliderDiscrete.each(function(i, v) {
        curnt         = $(this);
        curnt.append(sliderDiscrete_tmplt());
        range         = curnt.find('input[type="range"]');
        slider        = curnt.find('.axis');
        slider_fill   = slider.find('.axis-segment');
        slider_handle = slider.find('.axis-pin');
        slider_label  = slider.find('.axis-count');

        var range_val = parseInt(range.val());
        slider_fill.css('width', range_val +'%');
        slider_handle.css('left', range_val +'%');
        slider_label.find('span').text(range_val);
      });
    }

    self.on('mousedown', '.axis-pin', function(e) {
      if(e.button === 2) {
        return false;
      }

      var parents       = $(this).parents('.sf-range');
      var slider_width  = parents.outerWidth();
      var slider_offset = parents.offset().left;
      var check_range   = parents.find('input[type="range"]').is(':disabled');

      if(check_range === true) {
        return false;
      }

      if(parents.hasClass('range-led') === true) {
        $(this).addClass('is-active');
      }
      var handlers = {
        mousemove: function(e) {
          var slider_new_width = e.pageX - slider_offset;

          if(slider_new_width <= slider_width && !(slider_new_width < '0')) {
            slider_move(parents, slider_new_width, slider_width);
          }
        },
        mouseup: function(e) {
          $(this).off(handlers);

          if(parents.hasClass('range-led') === true) {
            parents.find('.is-active').removeClass('is-active');
          }
        }
      };
      $(document).on(handlers);
    });

    self.on('mousedown', '.axis', function(e) {
      if(e.button === 2) {
        return false;
      }

      var parents       = $(this).parents('.sf-range');
      var slider_width  = parents.outerWidth();
      var slider_offset = parents.offset().left;
      var check_range   = parents.find('input[type="range"]').is(':disabled');

      if(check_range === true) {
        return false;
      }

      var slider_new_width = e.pageX - slider_offset;
      if(slider_new_width <= slider_width && !(slider_new_width < '0')) {
        slider_move(parents, slider_new_width, slider_width);
      }

      var handlers = {
        mouseup: function(e) {
          $(this).off(handlers);
        }
      };
      $(document).on(handlers);

    });
  };

  function sliderContinuous_tmplt() {
    var tmplt = '<div class="axis">' +
        '<div class="axis-segment"></div>' +
        '<div class="axis-pin"></div>' +
        '</div>';

    return tmplt;
  }
  function sliderDiscrete_tmplt() {
    var tmplt = '<div class="axis">' +
        '<div class="axis-segment"></div>' +
        '<div class="axis-pin"><div class="axis-count"><span>0</span></div></div>' +
        '</div>';

    return tmplt;
  }
  function slider_move(parents, newW, sliderW) {
    var slider_new_val = parseInt(Math.round(newW / sliderW * 100));

    var slider_fill    = parents.find('.axis-segment');
    var slider_handle  = parents.find('.axis-pin');
    var range          = parents.find('input[type="range"]');

    slider_fill.css('width', slider_new_val +'%');
    slider_handle.css({
      'left': slider_new_val +'%',
      'transition': 'none',
      '-webkit-transition': 'none',
      '-moz-transition': 'none'
    });

    range.val(slider_new_val);

    if(parents.hasClass('range-led') === true) {
      parents.find('.axis-pin span').text(slider_new_val);
    }
  }

}(jQuery));


$(document).ready(function() {
  var el = document.body.querySelectorAll('.sf-range');
  if(el.length > 0)
    $('.sf-range').rkmd_rangeSlider();
});