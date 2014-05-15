var BodyImage = (function ($) {
    'use strict';

    var isTouch = ('ontouchstart' in window);
    var $window = $(window);
    var $body = $('body');
    var win = {};

    var defaults = {
        useArrowKeys: false,
        windowLoad: true
    };

    var setFullSizeImage = function (index) {
        var img = this.imgs[index],
            temp = new Image();
        temp.src = this.$triggers.eq(index).attr('href');
        img.$el.css({
            width: img.width,
            height: img.height
        });
        $(temp).on('load', function () {
            img.$el.attr('src', temp.src);
        });
        img.fullSize = temp;
    };

    var expandImage = function (index) {
        var img = this.imgs[index],
            width, height, originX, originY, bodyX, bodyY, scale;

        if (this.resetFlag) {
            setDimensions.call(this);
        }

        width = Math.min(win.width, img.maxWidth);
        height = width / img.ratio;

        if (height > Math.min(win.height, img.maxHeight)) {
            height = Math.min(win.height, img.maxHeight);
            width = height * img.ratio;
        }

        originX = img.pos.left + img.outerWidth / 2;
        originY = img.pos.top + img.outerHeight / 2;

        scale = width / img.outerWidth;

        bodyX = -(originX - win.scrollLeft - win.width / 2);
        bodyY = -(originY - win.scrollTop - win.height / 2);

        this.inTransition = true;

        if (!isTouch) {
            $body.css({
                width: win.width,
                height: win.height,
                overflow: 'hidden'
            });
        }

        this.active = index;

        $body.css({
            transformOrigin: originX + 'px ' + originY + 'px',
            transform: 'translate3d(' + bodyX + 'px, ' + bodyY + 'px, 0) scale(' + scale + ')'
        });
    };

    var revertBody = function () {
        this.active = -1;
        this.inTransition = true;
        $body.css({
            transformOrigin: 'center center',
            transform: 'translate3d(0,0,0) scale(1)'
        });
    };

    var nextImage = function () {
        var num = this.active + 1;
        if (num >= this.imgs.length) {
            num = -1;
            revertBody.call(this);
            return;
        }
        expandImage.call(this, num);
    };

    var previousImage = function () {
        var num = this.active - 1;
        if (num === -1) {
            revertBody.call(this);
            return;
        }
        if (num < -1) {
            num = this.imgs.length - 1;
        }
        expandImage.call(this, num);
    };

    var onTransitionEnd = function (e) {
        if (this.activeTransition === this.active) return;
        this.activeTransition = this.active;

        this.inTransition = false;
        if (this.active === -1) {
            $body.removeAttr('style');
            return;
        }
        if (!this.imgs[this.active].fullSize) {
            setFullSizeImage.call(this, this.active);
        }
    };

    var onTriggerClick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.active >= 0) {
            revertBody.call(this);
            return false;
        }
        expandImage.call(this, this.$triggers.index(e.currentTarget));
    };

    var onBodyClick = function () {
        if (this.active >= 0) {
            revertBody.call(this);
        }
    };

    var onResizeOrScroll = function (e) {
        if (e.type === 'scroll' && this.inTransition) return;
        this.resetFlag = true;
        if (!isTouch && this.active >= 0) {
            revertBody.call(this);
        }
    };

    var onMouseWheel = function (e) {
        if (this.active === -1) return true;
        if (e.originalEvent.wheelDelta < 0) {
            nextImage.call(this);
            return false;
        }
        if (e.originalEvent.wheelDelta > 0) {
            previousImage.call(this);
            return false;
        }
    };

    var onKeyDown = function (e) {
        if (e.which === 27 && this.active >= 0) {
            revertBody.call(this);
            return;
        }
        if (!this.opts.useArrowKeys && this.active === -1) return true;
        if (e.which === 39) {
            nextImage.call(this);
            return;
        }
        if (e.which === 37) {
            previousImage.call(this);
            return;
        }
    };

    var bindEvents = function () {

        $body.on('transitionend', onTransitionEnd.bind(this));

        this.$triggers.on('click', onTriggerClick.bind(this));

        $body.on('click', onBodyClick.bind(this));

        $window.on('resize scroll', onResizeOrScroll.bind(this));

        $body.on('mousewheel', onMouseWheel.bind(this));

        $window.on('keydown', onKeyDown.bind(this));
    };

    var setDimensions = function () {
        win.width = $window.width();
        win.height = $window.height();
        win.scrollLeft = $window.scrollLeft();
        win.scrollTop = $window.scrollTop();

        this.imgs = this.imgs.map(function (img) {
            img.pos = img.$el.offset();
            return img;
        });

        this.resetFlag = false;
    };

    var prepare = function () {
        this.imgs = $.map(this.$triggers, function (trigger) {
            var $trigger = $(trigger),
                $img = $trigger.find('img'),
                width = $img.width(),
                height = $img.height(),
                outerWidth = $img.outerWidth(),
                outerHeight = $img.outerHeight(),
                ratio = outerWidth / outerHeight,
                attrWidth = parseInt($trigger.attr('data-width'), 10),
                attrHeight = parseInt($trigger.attr('data-height'), 10),
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

            return {
                '$el': $img,
                'fullSize': false,
                'width': width,
                'height': height,
                'outerWidth': outerWidth,
                'outerHeight': outerHeight,
                'ratio': ratio,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight
            };
        });

        setDimensions.call(this);
        bindEvents.call(this);
    };

    return function (triggers, options) {
        this.$triggers = $(triggers);
        this.opts = $.extend({}, defaults, options);
        if (this.$triggers.length < 1) return;

        this.resetFlag = false;
        this.active = -1;
        this.activeTransition = -1;
        this.inTransition = false;

        if (this.opts.windowLoad) {
            $window.on('load', prepare.bind(this));
        } else {
            prepare.call(this);
        }
    };
}(jQuery));