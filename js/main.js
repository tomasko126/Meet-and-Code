jQuery(document).ready(function($) {
    var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
    var transitionsSupported = ($('.csstransitions').length > 0);
    if (!transitionsSupported)
        transitionEnd = 'noTransition';
    function SchedulePlan(element) {
        this.element = element;
        this.timeline = this.element.find('.timeline');
        this.timelineItems = this.timeline.find('li');
        this.timelineItemsNumber = this.timelineItems.length;
        this.timelineStart = getScheduleTimestamp(this.timelineItems.eq(0).text());
        this.timelineSlotDuration = getScheduleTimestamp(this.timelineItems.eq(1).text()) - getScheduleTimestamp(this.timelineItems.eq(0).text());
        this.eventsWrapper = this.element.find('.events');
        this.events = this.eventsWrapper.find('.events-group');
        this.singleEvents = this.events.find('.single-event');
        this.eventSlotHeight = this.events.eq(0).children('.top-info').outerHeight();
        this.modal = this.element.find('.event-modal');
        this.modalHeader = this.modal.find('.header');
        this.modalHeaderBg = this.modal.find('.header-bg');
        this.modalBody = this.modal.find('.body');
        this.modalBodyBg = this.modal.find('.body-bg');
        this.modalMaxWidth = 800;
        this.modalMaxHeight = 480;
        this.animating = false;
        this.initSchedule();
    }
    SchedulePlan.prototype.initSchedule = function() {
        this.scheduleReset();
        this.initEvents();
    }
    ;
    SchedulePlan.prototype.scheduleReset = function() {
        var mq = this.mq();
        if (mq == 'desktop' && !this.element.hasClass('js-full')) {
            this.eventSlotHeight = this.events.eq(0).children('.top-info').outerHeight();
            this.element.addClass('js-full');
            this.placeEvents();
            this.element.hasClass('modal-is-open') && this.checkEventModal();
        } else if (mq == 'mobile' && this.element.hasClass('js-full')) {
            this.element.removeClass('js-full loading');
            this.events.children('ul').add(this.singleEvents).removeAttr('style');
            this.eventsWrapper.children('.grid-line').remove();
            this.element.hasClass('modal-is-open') && this.checkEventModal();
        } else if (mq == 'desktop' && this.element.hasClass('modal-is-open')) {
            this.checkEventModal('desktop');
            this.element.removeClass('loading');
        } else {
            this.element.removeClass('loading');
        }
    }
    ;
    SchedulePlan.prototype.initEvents = function() {
        var self = this;
        this.singleEvents.each(function() {
            var durationLabel = '<span class="event-date">' + $(this).data('start') + ' - ' + $(this).data('end') + '</span>';
            $(this).children('a').prepend($(durationLabel));
            $(this).on('click', 'a', function(event) {
                event.preventDefault();
                if (!self.animating)
                    self.openModal($(this));
            });
        });
        this.modal.on('click', '.close', function(event) {
            event.preventDefault();
            if (!self.animating)
                self.closeModal(self.events.find('.selected-event'));
        });
        this.element.on('click', '.cover-layer', function(event) {
            if (!self.animating && self.element.hasClass('modal-is-open'))
                self.closeModal(self.events.find('.selected-event'));
        });
    }
    ;
    SchedulePlan.prototype.placeEvents = function() {
        var self = this;
        this.singleEvents.each(function() {
            var start = getScheduleTimestamp($(this).attr('data-start'))
              , duration = getScheduleTimestamp($(this).attr('data-end')) - start;
            var eventTop = self.eventSlotHeight * (start - self.timelineStart) / self.timelineSlotDuration
              , eventHeight = self.eventSlotHeight * duration / self.timelineSlotDuration;
            $(this).css({
                top: (eventTop - 1) + 'px',
                height: (eventHeight + 1) + 'px'
            });
        });
        this.element.removeClass('loading');
    }
    ;
    SchedulePlan.prototype.openModal = function(event) {
        var self = this;
        var mq = self.mq();
        this.animating = true;
        this.modalHeader.find('.event-name').text(event.find('.event-name').text());
        this.modalHeader.find('.event-date').text(event.find('.event-date').text());
        this.modal.attr('data-event', event.parent().attr('data-event'));
        this.modalBody.find('.event-info').load(event.parent().attr('data-content') + '.html .event-info > *', function(data) {
            self.element.addClass('content-loaded');
        });
        this.element.addClass('modal-is-open');
        setTimeout(function() {
            event.parent('li').addClass('selected-event');
        }, 10);
        if (mq == 'mobile') {
            self.modal.one(transitionEnd, function() {
                self.modal.off(transitionEnd);
                self.animating = false;
            });
        } else {
            var eventTop = event.offset().top - $(window).scrollTop()
              , eventLeft = event.offset().left
              , eventHeight = event.innerHeight()
              , eventWidth = event.innerWidth();
            var windowWidth = $(window).width()
              , windowHeight = $(window).height();
            var modalWidth = (windowWidth * .8 > self.modalMaxWidth) ? self.modalMaxWidth : windowWidth * .8
              , modalHeight = (windowHeight * .8 > self.modalMaxHeight) ? self.modalMaxHeight : windowHeight * .8;
            var modalTranslateX = parseInt((windowWidth - modalWidth) / 2 - eventLeft)
              , modalTranslateY = parseInt((windowHeight - modalHeight) / 2 - eventTop);
            var DetailsBgScaleY = modalHeight / eventHeight
              , MoreBgScaleX = (modalWidth - eventWidth);
            self.modal.css({
                top: eventTop + 'px',
                left: eventLeft + 'px',
                height: modalHeight + 'px',
                width: modalWidth + 'px',
            });
            transformElement(self.modal, 'translateY(' + modalTranslateY + 'px) translateX(' + modalTranslateX + 'px)');
            self.modalHeader.css({
                width: eventWidth + 'px',
            });
            self.modalBody.css({
                marginLeft: eventWidth + 'px',
            });
            self.modalBodyBg.css({
                height: eventHeight + 'px',
                width: '1px',
            });
            transformElement(self.modalBodyBg, 'scaleY(' + DetailsBgScaleY + ') scaleX(' + MoreBgScaleX + ')');
            self.modalHeaderBg.css({
                height: eventHeight + 'px',
                width: eventWidth + 'px',
            });
            transformElement(self.modalHeaderBg, 'scaleY(' + DetailsBgScaleY + ')');
            self.modalHeaderBg.one(transitionEnd, function() {
                self.modalHeaderBg.off(transitionEnd);
                self.animating = false;
                self.element.addClass('animation-completed');
            });
        }
        if (!transitionsSupported)
            self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
    }
    ;
    SchedulePlan.prototype.closeModal = function(event) {
        var self = this;
        var mq = self.mq();
        this.animating = true;
        if (mq == 'mobile') {
            this.element.removeClass('modal-is-open');
            this.modal.one(transitionEnd, function() {
                self.modal.off(transitionEnd);
                self.animating = false;
                self.element.removeClass('content-loaded');
                event.removeClass('selected-event');
            });
        } else {
            var eventTop = event.offset().top - $(window).scrollTop()
              , eventLeft = event.offset().left
              , eventHeight = event.innerHeight()
              , eventWidth = event.innerWidth();
            var modalTop = Number(self.modal.css('top').replace('px', ''))
              , modalLeft = Number(self.modal.css('left').replace('px', ''));
            var modalTranslateX = eventLeft - modalLeft
              , modalTranslateY = eventTop - modalTop;
            self.element.removeClass('animation-completed modal-is-open');
            this.modal.css({
                width: eventWidth + 'px',
                height: eventHeight + 'px'
            });
            transformElement(self.modal, 'translateX(' + modalTranslateX + 'px) translateY(' + modalTranslateY + 'px)');
            transformElement(self.modalBodyBg, 'scaleX(0) scaleY(1)');
            transformElement(self.modalHeaderBg, 'scaleY(1)');
            this.modalHeaderBg.one(transitionEnd, function() {
                self.modalHeaderBg.off(transitionEnd);
                self.modal.addClass('no-transition');
                setTimeout(function() {
                    self.modal.add(self.modalHeader).add(self.modalBody).add(self.modalHeaderBg).add(self.modalBodyBg).attr('style', '');
                }, 10);
                setTimeout(function() {
                    self.modal.removeClass('no-transition');
                }, 20);
                self.animating = false;
                self.element.removeClass('content-loaded');
                event.removeClass('selected-event');
            });
        }
        if (!transitionsSupported)
            self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
    }
    SchedulePlan.prototype.mq = function() {
        var self = this;
        return window.getComputedStyle(this.element.get(0), '::before').getPropertyValue('content').replace(/["']/g, '');
    }
    ;
    SchedulePlan.prototype.checkEventModal = function(device) {
        this.animating = true;
        var self = this;
        var mq = this.mq();
        if (mq == 'mobile') {
            self.modal.add(self.modalHeader).add(self.modalHeaderBg).add(self.modalBody).add(self.modalBodyBg).attr('style', '');
            self.modal.removeClass('no-transition');
            self.animating = false;
        } else if (mq == 'desktop' && self.element.hasClass('modal-is-open')) {
            self.modal.addClass('no-transition');
            self.element.addClass('animation-completed');
            var event = self.events.find('.selected-event');
            var eventTop = event.offset().top - $(window).scrollTop()
              , eventLeft = event.offset().left
              , eventHeight = event.innerHeight()
              , eventWidth = event.innerWidth();
            var windowWidth = $(window).width()
              , windowHeight = $(window).height();
            var modalWidth = (windowWidth * .8 > self.modalMaxWidth) ? self.modalMaxWidth : windowWidth * .8
              , modalHeight = (windowHeight * .8 > self.modalMaxHeight) ? self.modalMaxHeight : windowHeight * .8;
            var DetailsBgScaleY = modalHeight / eventHeight
              , MoreBgScaleX = (modalWidth - eventWidth);
            setTimeout(function() {
                self.modal.css({
                    width: modalWidth + 'px',
                    height: modalHeight + 'px',
                    top: (windowHeight / 2 - modalHeight / 2) + 'px',
                    left: (windowWidth / 2 - modalWidth / 2) + 'px',
                });
                transformElement(self.modal, 'translateY(0) translateX(0)');
                self.modalBodyBg.css({
                    height: modalHeight + 'px',
                    width: '1px',
                });
                transformElement(self.modalBodyBg, 'scaleX(' + MoreBgScaleX + ')');
                self.modalHeader.css({
                    width: eventWidth + 'px',
                });
                self.modalBody.css({
                    marginLeft: eventWidth + 'px',
                });
                self.modalHeaderBg.css({
                    height: eventHeight + 'px',
                    width: eventWidth + 'px',
                });
                transformElement(self.modalHeaderBg, 'scaleY(' + DetailsBgScaleY + ')');
            }, 10);
            setTimeout(function() {
                self.modal.removeClass('no-transition');
                self.animating = false;
            }, 20);
        }
    }
    ;
    var schedules = $('.cd-schedule');
    var objSchedulesPlan = []
      , windowResize = false;
    if (schedules.length > 0) {
        schedules.each(function() {
            objSchedulesPlan.push(new SchedulePlan($(this)));
        });
    }
    $(window).on('resize', function() {
        if (!windowResize) {
            windowResize = true;
            (!window.requestAnimationFrame) ? setTimeout(checkResize) : window.requestAnimationFrame(checkResize);
        }
    });
    $(window).keyup(function(event) {
        if (event.keyCode == 27) {
            objSchedulesPlan.forEach(function(element) {
                element.closeModal(element.events.find('.selected-event'));
            });
        }
    });
    function checkResize() {
        objSchedulesPlan.forEach(function(element) {
            element.scheduleReset();
        });
        windowResize = false;
    }
    function getScheduleTimestamp(time) {
        time = time.replace(/ /g, '');
        var timeArray = time.split(':');
        var timeStamp = parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]);
        return timeStamp;
    }
    function transformElement(element, value) {
        element.css({
            '-moz-transform': value,
            '-webkit-transform': value,
            '-ms-transform': value,
            '-o-transform': value,
            'transform': value
        });
    }
});
