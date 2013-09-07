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