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
            setFullSizeImage = function (index) {
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
                    width, height, originX, originY, bodyX, bodyY, scale;
                if (this.resetFlag) {
                    setDimensions.call(this);
                }
                width = Math.min(this.win.width, img.maxWidth);
                height = width / img.ratio;
                if (height > Math.min(this.win.height, img.maxHeight)) {
                    height = Math.min(this.win.height, img.maxHeight);
                    width = height * img.ratio;
                }
                originX = img.pos.left + img.outerWidth / 2;
                originY = img.pos.top + img.outerHeight / 2;
                scale = width / img.outerWidth;
                bodyX = -(originX - this.win.scrollLeft - this.win.width / 2);
                bodyY = -(originY - this.win.scrollTop - this.win.height / 2);
                if (!img.fullSize) {
                    setFullSizeImage.call(this, index);
                }
                this.inTransition = true;
                this.$body.css({
                    width: this.win.width,
                    height: this.win.height,
                    overflow: 'hidden',
                    transformOrigin: originX + 'px ' + originY + 'px',
                    transform: 'translate(' + bodyX + 'px, ' + bodyY + 'px) scale(' + scale + ')'
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
            nextImage = function () {
                var num = this.active + 1;
                if (num >= this.img.length) {
                    num = -1;
                    revertBody.call(this);
                    return;
                }
                expandImage.call(this, num);
            },
            previousImage = function () {
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
                this.$el.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (self.active >= 0) {
                        revertBody.call(self);
                        return false;
                    }
                    expandImage.call(self, self.$el.index(this));
                });
                this.$body.on('click', function () {
                    if (self.active >= 0) {
                        revertBody.call(self);
                    }
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
                this.$body.on('mousewheel', function (e) {
                    if (self.active === -1) return true;
                    if (e.originalEvent.wheelDelta < 0) {
                        nextImage.call(self);
                        return false;
                    }
                    if (e.originalEvent.wheelDelta > 0) {
                        previousImage.call(self);
                        return false;
                    }
                });
                this.win.$el.on('keydown', function (e) {
                    if (e.which === 27 && self.active >= 0) {
                        revertBody.call(self);
                    }
                    if (self.opts.useArrowKeys) {
                        if (e.which === 39) {
                            nextImage.call(self);
                        }
                        if (e.which === 37) {
                            previousImage.call(self);
                        }
                    }
                });
            },
            init = function (el, options) {
                var self = this,
                    $w = $(w);
                this.$el = $(el);
                this.opts = $.extend({
                    useArrowKeys: false
                }, options);
                if (this.$el.length < 1) return false;
                this.img = [];
                this.$el.each(function (i) {
                    var $a = $(this),
                        $img = $a.find('img'),
                        width = $img.width(),
                        height = $img.height(),
                        outerWidth = $img.outerWidth(),
                        outerHeight = $img.outerHeight(),
                        ratio = outerWidth / outerHeight,
                        attrWidth = parseInt($a.attr('data-width'), 10),
                        attrHeight = parseInt($a.attr('data-height'), 10),
                        maxWidth = 100000, maxHeight = 100000;
                    if (attrWidth > 0) {
                        maxWidth = attrWidth;
                        maxHeight = attrWidth / ratio;
                    } else if (attrHeight > 0) {
                        maxHeight = attrHeight;
                        maxWidth = attrHeight * ratio;
                    }
                    maxWidth += outerWidth - width;
                    maxHeight += outerHeight - height;
                    self.img[i] = {
                        $el: $img,
                        fullSize: false,
                        width: width,
                        height: height,
                        outerWidth: outerWidth,
                        outerHeight: outerHeight,
                        ratio: ratio,
                        maxWidth: maxWidth,
                        maxHeight: maxHeight
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