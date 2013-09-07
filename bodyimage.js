/*!
/**
 * Monkey patch jQuery 1.3.1+ to add support for setting or animating CSS
 * scale and rotation independently.
 * https://github.com/zachstronaut/jquery-animate-css-rotate-scale
 * Released under dual MIT/GPL license just like jQuery.
 * 2009-2012 Zachary Johnson www.zachstronaut.com
 */
(function ($) {
    // Updated 2010.11.06
    // Updated 2012.10.13 - Firefox 16 transform style returns a matrix rather than a string of transform functions.  This broke the features of this jQuery patch in Firefox 16.  It should be possible to parse the matrix for both scale and rotate (especially when scale is the same for both the X and Y axis), however the matrix does have disadvantages such as using its own units and also 45deg being indistinguishable from 45+360deg.  To get around these issues, this patch tracks internally the scale, rotation, and rotation units for any elements that are .scale()'ed, .rotate()'ed, or animated.  The major consequences of this are that 1. the scaled/rotated element will blow away any other transform rules applied to the same element (such as skew or translate), and 2. the scaled/rotated element is unaware of any preset scale or rotation initally set by page CSS rules.  You will have to explicitly set the starting scale/rotation value.
    
    function initData($el) {
        var _ARS_data = $el.data('_ARS_data');
        if (!_ARS_data) {
            _ARS_data = {
                rotateUnits: 'deg',
                scale: 1,
                rotate: 0
            };
            
            $el.data('_ARS_data', _ARS_data);
        }
        
        return _ARS_data;
    }
    
    function setTransform($el, data) {
        $el.css('transform', 'rotate(' + data.rotate + data.rotateUnits + ') scale(' + data.scale + ',' + data.scale + ')');
    }
    
    $.fn.rotate = function (val) {
        var $self = $(this), m, data = initData($self);
                        
        if (typeof val == 'undefined') {
            return data.rotate + data.rotateUnits;
        }
        
        m = val.toString().match(/^(-?\d+(\.\d+)?)(.+)?$/);
        if (m) {
            if (m[3]) {
                data.rotateUnits = m[3];
            }
            
            data.rotate = m[1];
            
            setTransform($self, data);
        }
        
        return this;
    };
    
    // Note that scale is unitless.
    $.fn.scale = function (val) {
        var $self = $(this), data = initData($self);
        
        if (typeof val == 'undefined') {
            return data.scale;
        }
        
        data.scale = val;
        
        setTransform($self, data);
        
        return this;
    };

    // fx.cur() must be monkey patched because otherwise it would always
    // return 0 for current rotate and scale values
    var curProxied = $.fx.prototype.cur;
    $.fx.prototype.cur = function () {
        if (this.prop == 'rotate') {
            return parseFloat($(this.elem).rotate());
            
        } else if (this.prop == 'scale') {
            return parseFloat($(this.elem).scale());
        }
        
        return curProxied.apply(this, arguments);
    };
    
    $.fx.step.rotate = function (fx) {
        var data = initData($(fx.elem));
        $(fx.elem).rotate(fx.now + data.rotateUnits);
    };
    
    $.fx.step.scale = function (fx) {
        $(fx.elem).scale(fx.now);
    };
    
    /*
    
    Starting on line 3905 of jquery-1.3.2.js we have this code:
    
    // We need to compute starting value
    if ( unit != "px" ) {
        self.style[ name ] = (end || 1) + unit;
        start = ((end || 1) / e.cur(true)) * start;
        self.style[ name ] = start + unit;
    }
    
    This creates a problem where we cannot give units to our custom animation
    because if we do then this code will execute and because self.style[name]
    does not exist where name is our custom animation's name then e.cur(true)
    will likely return zero and create a divide by zero bug which will set
    start to NaN.
    
    The following monkey patch for animate() gets around this by storing the
    units used in the rotation definition and then stripping the units off.
    
    */
    
    var animateProxied = $.fn.animate;
    $.fn.animate = function (prop) {
        if (typeof prop['rotate'] != 'undefined') {
            var $self, data, m = prop['rotate'].toString().match(/^(([+-]=)?(-?\d+(\.\d+)?))(.+)?$/);
            if (m && m[5]) {
                $self = $(this);
                data = initData($self);
                data.rotateUnits = m[5];
            }
            
            prop['rotate'] = m[1];
        }
        
        return animateProxied.apply(this, arguments);
    };
})(jQuery);

(function (w, d, $) {
	"use strict";
	w.BodyImage = function (el) {
		this.result = this.init(el);
	};
	w.BodyImage.prototype = (function () {
		var setImg = function (img) {
                img.resetFlag = false;
                img.width = img.$el.width();
                img.height = img.$el.height();
                img.pos = img.$el.offset();
            },
            setWin = function () {
                this.win.resetFlag = false;
                this.win.width = this.win.$el.width();
                this.win.height = this.win.$el.height();
                this.win.scrollLeft = this.win.$el.scrollLeft();
                this.win.scrollTop = this.win.$el.scrollTop();
            },
            fullSize = function (index) {
                var img = this.img[index],
                    temp = new Image();
                temp.src = this.$el.eq(index).attr('href');
                img.$el.css({
                    width: img.width,
                    height: img.height
                });
                $(temp).load(function () {
                    img.$el.attr('src', temp.src);
                });
                img.fullSize = true;
            },
            expandImage = function (index) {
				var self = this,
                    img = this.img[index],
					ratio, width, height, originX, originY, bodyX, bodyY, scale;
                if (img.resetFlag) {
                    setImg.call(this, img);
                }
                if (this.win.resetFlag) {
                    setWin.call(this);
                }
                ratio = img.width / img.height;
                width = this.win.width;
                height = this.win.width / ratio;
				if (height > this.win.height) {
					height = this.win.height;
					width = this.win.height * ratio;
				}
				originX = img.pos.left + img.width / 2;
				originY = img.pos.top + img.height / 2;
				scale = width / img.width;
				bodyX = (originX - this.win.scrollLeft - this.win.width / 2);
				bodyY = (originY - this.win.scrollTop - this.win.height / 2);
                if (!img.fullSize) {
                    fullSize.call(this, index);
                }
				this.$body.css({
					width: this.win.width,
					height: this.win.height,
					overflow: 'hidden',
					transformOrigin: (originX)+'px '+(originY)+'px',
					transform: 'translate('+-bodyX+'px, '+-bodyY+'px) scale('+scale+')'
				});
                this.active = true;
			},
            revertBody = function () {
                this.active = false;
                this.$body.css({
                    transform: 'translate(0,0) scale(1)'
                });
            },
			bindEvents = function () {
				var self = this;
				this.$el.bind('click', function (e) {
					e.preventDefault();
                    if (self.active) {
                        revertBody.call(self);
                        return;
                    }
					expandImage.call(self, self.$el.index(this));
				});
                this.$body.on('transitionend webkitTransitionEnd', function () {
                    if (!self.active) {
                        self.$body.removeAttr('style');
                    }
                });
                this.win.$el.on('resize', function () {
                    self.win.resetFlag = true;
                    for (var x = 0, xlen = self.img.length; x < xlen; x += 1) {
                        self.img[x].resetFlag = true;
                    }
                    revertBody.call(self);
                });
			},
			init = function (el) {
                var self = this,
                    $w = $(w);
				this.$el = $(el);
				if (this.$el.length < 1) return false;
                this.img = [];
                this.$el.each(function (i) {
                    var img = self.img[i] = {};
                    img.$el = $(this).find('img');
                    img.fullSize = false;
                    setImg.call(self, img);
                });
				this.$body = $('body');
                this.win = { $el: $w };
                setWin.call(this);
                this.active = false;
				bindEvents.call(this);
				return true;
			};
		return {
			init: init
		};
	}());
}(window, document, jQuery));