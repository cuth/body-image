(function (w, d, $) {
    "use strict";
    w.BodyImage = function (el, options) {
        this.result = this.init(el, options);
    };
    w.BodyImage.prototype = (function () {
        var setDimensions = function () {
                this.win.width = this.win.$el.width();
                this.win.height = this.win.$el.height();
                this.win.scrollLeft = this.win.$el.scrollLeft();
                this.win.scrollTop = this.win.$el.scrollTop();
                for (var x = 0, xlen = this.img.length; x < xlen; x += 1) {
                    this.img[x].pos = this.img[x].$el.offset();
                }
                this.resetFlag = false;
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
                if (this.resetFlag) {
                    setDimensions.call(this);
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
                this.inTransition = true;
                this.$body.css({
                    width: this.win.width,
                    height: this.win.height,
                    overflow: 'hidden',
                    transformOrigin: (originX)+'px '+(originY)+'px',
                    transform: 'translate('+-bodyX+'px, '+-bodyY+'px) scale('+scale+')'
                });
                this.active = index;
            },
            revertBody = function () {
                this.active = -1;
                this.inTransition = true;
                this.$body.css({
                    transformOrigin: 'center center',
                    transform: 'translate(0,0) scale(1)'
                });
            },
            nextImg = function () {
                var num = this.active + 1;
                if (num >= this.img.length) {
                    num = -1;
                    revertBody.call(this);
                    return;
                }
                expandImage.call(this, num);
            },
            previousImg = function () {
                var num = this.active - 1;
                if (num === -1) {
                    revertBody.call(this);
                    return;
                }
                if (num < -1) {
                    num = this.img.length - 1;
                }
                expandImage.call(this, num);
            },
            bindEvents = function () {
                var self = this;
                this.$el.bind('click', function (e) {
                    e.preventDefault();
                    if (self.active >= 0) {
                        revertBody.call(self);
                        return;
                    }
                    expandImage.call(self, self.$el.index(this));
                });
                this.$body.on('transitionend webkitTransitionEnd', function () {
                    self.inTransition = false;
                    if (self.active === -1) {
                        self.$body.removeAttr('style');
                    }
                });
                this.win.$el.on('resize scroll', function (e) {
                    if (e.type === 'scroll' && self.inTransition) return;
                    self.resetFlag = true;
                    if (self.active >= 0) {
                        revertBody.call(self);
                    }
                });
                if (this.opts.useArrowKeys) {
                    this.win.$el.on('keydown', function (e) {
                        if (e.which === 39) {
                            nextImg.call(self);
                        }
                        if (e.which === 37) {
                            previousImg.call(self);
                        }
                    });
                }
            },
            init = function (el, options) {
                var self = this,
                    $w = $(w);
                this.$el = $(el);
                this.opts = $.extend({
                    useArrowKeys: true
                }, options);
                if (this.$el.length < 1) return false;
                this.img = [];
                this.$el.each(function (i) {
                    var $img = $(this).find('img');
                    self.img[i] = {
                        $el: $img,
                        fullSize: false,
                        width: $img.width(),
                        height: $img.height()
                    };
                });
                this.$body = $('body');
                this.win = { $el: $w };
                setDimensions.call(this);
                this.resetFlag = false;
                this.active = -1;
                this.inTransition = false;
                bindEvents.call(this);
                return true;
            };
        return {
            init: init
        };
    }());
}(window, document, jQuery));