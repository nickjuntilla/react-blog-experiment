// Sticky Plugin v1.0.2 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 2/14/2011
// Date: 16/04/2015
// Website: http://labs.anthonygarand.com/sticky
// Description: Makes an element on the page stick on the screen as you scroll
//       It will only set the 'top' and 'position' of your element, you
//       might need to adjust the width in some cases.

(function($) {
    var slice = Array.prototype.slice; // save ref to original slice()
    var splice = Array.prototype.splice; // save ref to original slice()

  var defaults = {
      topSpacing: 0,
      bottomSpacing: 0,
      className: 'is-sticky',
      wrapperClassName: 'sticky-wrapper',
      center: false,
      getWidthFrom: '',
      widthFromWrapper: true, // works only when .getWidthFrom is empty
      responsiveWidth: false
    },
    $window = $(window),
    $document = $(document),
    sticked = [],
    windowHeight = $window.height(),
    scroller = function() {
      var scrollTop = $window.scrollTop(),
        documentHeight = $document.height(),
        dwh = documentHeight - windowHeight,
        extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

      for (var i = 0; i < sticked.length; i++) {
        var s = sticked[i],
          elementTop = s.stickyWrapper.offset().top,
          etse = elementTop - s.topSpacing - extra;

	//update height in case of dynamic content
	s.stickyWrapper.css('height', s.stickyElement.outerHeight());

        if (scrollTop <= etse) {
          if (s.currentTop !== null) {
            s.stickyElement
              .css({
                'width': '',
                'position': '',
                'top': ''
              });
            s.stickyElement.parent().removeClass(s.className);
            s.stickyElement.trigger('sticky-end', [s]);
            s.currentTop = null;
          }
        }
        else {
          var newTop = documentHeight - s.stickyElement.outerHeight()
            - s.topSpacing - s.bottomSpacing - scrollTop - extra;
          if (newTop < 0) {
            newTop = newTop + s.topSpacing;
          } else {
            newTop = s.topSpacing;
          }
          if (s.currentTop != newTop) {
            var newWidth;
            if ( s.getWidthFrom ) {
                newWidth = $(s.getWidthFrom).width() || null;
            }
            else if(s.widthFromWrapper) {
                newWidth = s.stickyWrapper.width();
            }
            if ( newWidth == null ) {
                newWidth = s.stickyElement.width();
            }
            s.stickyElement
              .css('width', newWidth)
              .css('position', 'fixed')
              .css('top', newTop);

            s.stickyElement.parent().addClass(s.className);

            if (s.currentTop === null) {
              s.stickyElement.trigger('sticky-start', [s]);
            } else {
              // sticky is started but it have to be repositioned
              s.stickyElement.trigger('sticky-update', [s]);
            }

            if (s.currentTop === s.topSpacing && s.currentTop > newTop || s.currentTop === null && newTop < s.topSpacing) {
              // just reached bottom || just started to stick but bottom is already reached
              s.stickyElement.trigger('sticky-bottom-reached', [s]);
            } else if(s.currentTop !== null && newTop === s.topSpacing && s.currentTop < newTop) {
              // sticky is started && sticked at topSpacing && overflowing from top just finished
              s.stickyElement.trigger('sticky-bottom-unreached', [s]);
            }

            s.currentTop = newTop;
          }
        }
      }
    },
    resizer = function() {
      windowHeight = $window.height();

      for (var i = 0; i < sticked.length; i++) {
        var s = sticked[i];
        var newWidth = null;
        if ( s.getWidthFrom ) {
            if ( s.responsiveWidth === true ) {
                newWidth = $(s.getWidthFrom).width();
            }
        }
        else if(s.widthFromWrapper) {
            newWidth = s.stickyWrapper.width();
        }
        if ( newWidth != null ) {
            s.stickyElement.css('width', newWidth);
        }
      }
    },
    methods = {
      init: function(options) {
        var o = $.extend({}, defaults, options);
        return this.each(function() {
          var stickyElement = $(this);

          var stickyId = stickyElement.attr('id');
          var stickyHeight = stickyElement.outerHeight();
          var wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName
          var wrapper = $('<div></div>')
            .attr('id', wrapperId)
            .addClass(o.wrapperClassName);

          stickyElement.wrapAll(wrapper);

          var stickyWrapper = stickyElement.parent();

          if (o.center) {
            stickyWrapper.css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
          }

          if (stickyElement.css("float") == "right") {
            stickyElement.css({"float":"none"}).parent().css({"float":"right"});
          }

          stickyWrapper.css('height', stickyHeight);

          o.stickyElement = stickyElement;
          o.stickyWrapper = stickyWrapper;
          o.currentTop    = null;

          sticked.push(o);
        });
      },
      update: scroller,
      unstick: function(options) {
        return this.each(function() {
          var that = this;
          var unstickyElement = $(that);

          var removeIdx = -1;
          var i = sticked.length;
          while ( i-- > 0 )
          {
            if (sticked[i].stickyElement.get(0) === that)
            {
                splice.call(sticked,i,1);
                removeIdx = i;
            }
          }
          if(removeIdx != -1)
          {
            unstickyElement.unwrap();
            unstickyElement
              .css({
                'width': '',
                'position': '',
                'top': '',
                'float': ''
              })
            ;
          }
        });
      }
    };

  // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
  if (window.addEventListener) {
    window.addEventListener('scroll', scroller, false);
    window.addEventListener('resize', resizer, false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', scroller);
    window.attachEvent('onresize', resizer);
  }

  $.fn.sticky = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };

  $.fn.unstick = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.unstick.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }

  };
  $(function() {
    setTimeout(scroller, 0);
  });
})(jQuery);


/*!
Waypoints - 3.1.1
Copyright Â© 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var n in t){var r=t[n];for(var s in this.waypoints[n]){var a,l,h,p,u,c=this.waypoints[n][s],d=c.options.offset,f=c.triggerPoint,w=0,y=null==f;c.element!==c.element.window&&(w=c.adapter.offset()[r.offsetProp]),"function"==typeof d?d=d.apply(c):"string"==typeof d&&(d=parseFloat(d),c.options.offset.indexOf("%")>-1&&(d=Math.ceil(r.contextDimension*d/100))),a=r.contextScroll-r.contextOffset,c.triggerPoint=w+a-d,l=f<r.oldScroll,h=c.triggerPoint>=r.oldScroll,p=l&&h,u=!l&&!h,!y&&p?(c.queueTrigger(r.backward),o[c.group.id]=c.group):!y&&u?(c.queueTrigger(r.forward),o[c.group.id]=c.group):y&&r.oldScroll>=c.triggerPoint&&(c.queueTrigger(r.forward),o[c.group.id]=c.group)}}for(var g in o)o[g].flushTriggers();return this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();

/*!
Waypoints Infinite Scroll Shortcut - 3.1.1
Copyright Â© 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(n){this.options=i.extend({},t.defaults,n),this.container=this.options.element,"auto"!==this.options.container&&(this.container=this.options.container),this.$container=i(this.container),this.$more=i(this.options.more),this.$more.length&&(this.setupHandler(),this.waypoint=new o(this.options))}var i=window.jQuery,o=window.Waypoint;t.prototype.setupHandler=function(){this.options.handler=i.proxy(function(){this.options.onBeforePageLoad(),this.destroy(),this.$container.addClass(this.options.loadingClass),i.get(i(this.options.more).attr("href"),i.proxy(function(t){var n=i(i.parseHTML(t)),e=n.find(this.options.more),s=n.find(this.options.items);s.length||(s=n.filter(this.options.items)),this.$container.append(s),this.$container.removeClass(this.options.loadingClass),e.length||(e=n.filter(this.options.more)),e.length?(this.$more.replaceWith(e),this.$more=e,this.waypoint=new o(this.options)):this.$more.remove(),this.options.onAfterPageLoad()},this))},this)},t.prototype.destroy=function(){this.waypoint&&this.waypoint.destroy()},t.defaults={container:"auto",items:".infinite-item",more:".infinite-more-link",offset:"bottom-in-view",loadingClass:"infinite-loading",onBeforePageLoad:i.noop,onAfterPageLoad:i.noop},o.Infinite=t}();

/*!
Waypoints Inview Shortcut - 3.1.1
Copyright Â© 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(){}function e(t){this.options=i.Adapter.extend({},e.defaults,t),this.axis=this.options.horizontal?"horizontal":"vertical",this.waypoints=[],this.createWaypoints()}var i=window.Waypoint;e.prototype.createWaypoints=function(){for(var t={vertical:[{down:"enter",up:"exited",offset:"100%"},{down:"entered",up:"exit",offset:"bottom-in-view"},{down:"exit",up:"entered",offset:0},{down:"exited",up:"enter",offset:function(){return-this.adapter.outerHeight()}}],horizontal:[{right:"enter",left:"exited",offset:"100%"},{right:"entered",left:"exit",offset:"right-in-view"},{right:"exit",left:"entered",offset:0},{right:"exited",left:"enter",offset:function(){return-this.adapter.outerWidth()}}]},e=0,i=t[this.axis].length;i>e;e++){var o=t[this.axis][e];this.createWaypoint(o)}},e.prototype.createWaypoint=function(t){var e=this;this.waypoints.push(new i({element:this.options.element,handler:function(t){return function(i){e.options[t[i]].call(this,i)}}(t),offset:t.offset,horizontal:this.options.horizontal}))},e.prototype.destroy=function(){for(var t=0,e=this.waypoints.length;e>t;t++)this.waypoints[t].destroy();this.waypoints=[]},e.defaults={enter:t,entered:t,exit:t,exited:t},i.Inview=e}();

/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */
(function(a){function d(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=!0,g=0,h=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),h=e,c.axis!==undefined&&c.axis===c.HORIZONTAL_AXIS&&(h=0,g=-1*e),c.wheelDeltaY!==undefined&&(h=c.wheelDeltaY/120),c.wheelDeltaX!==undefined&&(g=-1*c.wheelDeltaX/120),d.unshift(b,e,g,h),(a.event.dispatch||a.event.handle).apply(this,d)}var b=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var c=b.length;c;)a.event.fixHooks[b[--c]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=b.length;a;)this.addEventListener(b[--a],d,!1);else this.onmousewheel=d},teardown:function(){if(this.removeEventListener)for(var a=b.length;a;)this.removeEventListener(b[--a],d,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);


/*
 * jQuery mCustomScrollbar
 */
(function(c){var b={init:function(e){var f={set_width:false,set_height:false,horizontalScroll:false,scrollInertia:950,mouseWheel:true,mouseWheelPixels:"auto",autoDraggerLength:true,autoHideScrollbar:false,snapAmount:null,snapOffset:0,scrollButtons:{enable:false,scrollType:"continuous",scrollSpeed:"auto",scrollAmount:40},advanced:{updateOnBrowserResize:true,updateOnContentResize:false,autoExpandHorizontalScroll:false,autoScrollOnFocus:true,normalizeMouseWheelDelta:false},contentTouchScroll:true,callbacks:{onScrollStart:function(){},onScroll:function(){},onTotalScroll:function(){},onTotalScrollBack:function(){},onTotalScrollOffset:0,onTotalScrollBackOffset:0,whileScrolling:function(){}},theme:"light"},e=c.extend(true,f,e);return this.each(function(){var m=c(this);if(e.set_width){m.css("width",e.set_width)}if(e.set_height){m.css("height",e.set_height)}if(!c(document).data("mCustomScrollbar-index")){c(document).data("mCustomScrollbar-index","1")}else{var t=parseInt(c(document).data("mCustomScrollbar-index"));c(document).data("mCustomScrollbar-index",t+1)}m.wrapInner("<div class='mCustomScrollBox mCS-"+e.theme+"' id='mCSB_"+c(document).data("mCustomScrollbar-index")+"' style='position:relative; height:100%; overflow:hidden; max-width:100%;' />").addClass("mCustomScrollbar _mCS_"+c(document).data("mCustomScrollbar-index"));var g=m.children(".mCustomScrollBox");if(e.horizontalScroll){g.addClass("mCSB_horizontal").wrapInner("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />");var k=g.children(".mCSB_h_wrapper");k.wrapInner("<div class='mCSB_container' style='position:absolute; left:0;' />").children(".mCSB_container").css({width:k.children().outerWidth(),position:"relative"}).unwrap()}else{g.wrapInner("<div class='mCSB_container' style='position:relative; top:0;' />")}var o=g.children(".mCSB_container");if(c.support.touch){o.addClass("mCS_touch")}o.after("<div class='mCSB_scrollTools' style='position:absolute;'><div class='mCSB_draggerContainer'><div class='mCSB_dragger' style='position:absolute;' oncontextmenu='return false;'><div class='mCSB_dragger_bar' style='position:relative;'></div></div><div class='mCSB_draggerRail'></div></div></div>");var l=g.children(".mCSB_scrollTools"),h=l.children(".mCSB_draggerContainer"),q=h.children(".mCSB_dragger");if(e.horizontalScroll){q.data("minDraggerWidth",q.width())}else{q.data("minDraggerHeight",q.height())}if(e.scrollButtons.enable){if(e.horizontalScroll){l.prepend("<a class='mCSB_buttonLeft' oncontextmenu='return false;'></a>").append("<a class='mCSB_buttonRight' oncontextmenu='return false;'></a>")}else{l.prepend("<a class='mCSB_buttonUp' oncontextmenu='return false;'></a>").append("<a class='mCSB_buttonDown' oncontextmenu='return false;'></a>")}}g.bind("scroll",function(){if(!m.is(".mCS_disabled")){g.scrollTop(0).scrollLeft(0)}});m.data({mCS_Init:true,mCustomScrollbarIndex:c(document).data("mCustomScrollbar-index"),horizontalScroll:e.horizontalScroll,scrollInertia:e.scrollInertia,scrollEasing:"mcsEaseOut",mouseWheel:e.mouseWheel,mouseWheelPixels:e.mouseWheelPixels,autoDraggerLength:e.autoDraggerLength,autoHideScrollbar:e.autoHideScrollbar,snapAmount:e.snapAmount,snapOffset:e.snapOffset,scrollButtons_enable:e.scrollButtons.enable,scrollButtons_scrollType:e.scrollButtons.scrollType,scrollButtons_scrollSpeed:e.scrollButtons.scrollSpeed,scrollButtons_scrollAmount:e.scrollButtons.scrollAmount,autoExpandHorizontalScroll:e.advanced.autoExpandHorizontalScroll,autoScrollOnFocus:e.advanced.autoScrollOnFocus,normalizeMouseWheelDelta:e.advanced.normalizeMouseWheelDelta,contentTouchScroll:e.contentTouchScroll,onScrollStart_Callback:e.callbacks.onScrollStart,onScroll_Callback:e.callbacks.onScroll,onTotalScroll_Callback:e.callbacks.onTotalScroll,onTotalScrollBack_Callback:e.callbacks.onTotalScrollBack,onTotalScroll_Offset:e.callbacks.onTotalScrollOffset,onTotalScrollBack_Offset:e.callbacks.onTotalScrollBackOffset,whileScrolling_Callback:e.callbacks.whileScrolling,bindEvent_scrollbar_drag:false,bindEvent_content_touch:false,bindEvent_scrollbar_click:false,bindEvent_mousewheel:false,bindEvent_buttonsContinuous_y:false,bindEvent_buttonsContinuous_x:false,bindEvent_buttonsPixels_y:false,bindEvent_buttonsPixels_x:false,bindEvent_focusin:false,bindEvent_autoHideScrollbar:false,mCSB_buttonScrollRight:false,mCSB_buttonScrollLeft:false,mCSB_buttonScrollDown:false,mCSB_buttonScrollUp:false});if(e.horizontalScroll){if(m.css("max-width")!=="none"){if(!e.advanced.updateOnContentResize){e.advanced.updateOnContentResize=true}}}else{if(m.css("max-height")!=="none"){var s=false,r=parseInt(m.css("max-height"));if(m.css("max-height").indexOf("%")>=0){s=r,r=m.parent().height()*s/100}m.css("overflow","hidden");g.css("max-height",r)}}m.mCustomScrollbar("update");if(e.advanced.updateOnBrowserResize){var i,j=c(window).width(),u=c(window).height();c(window).bind("resize."+m.data("mCustomScrollbarIndex"),function(){if(i){clearTimeout(i)}i=setTimeout(function(){if(!m.is(".mCS_disabled")&&!m.is(".mCS_destroyed")){var w=c(window).width(),v=c(window).height();if(j!==w||u!==v){if(m.css("max-height")!=="none"&&s){g.css("max-height",m.parent().height()*s/100)}m.mCustomScrollbar("update");j=w;u=v}}},150)})}if(e.advanced.updateOnContentResize){var p;if(e.horizontalScroll){var n=o.outerWidth()}else{var n=o.outerHeight()}p=setInterval(function(){if(e.horizontalScroll){if(e.advanced.autoExpandHorizontalScroll){o.css({position:"absolute",width:"auto"}).wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />").css({width:o.outerWidth(),position:"relative"}).unwrap()}var v=o.outerWidth()}else{var v=o.outerHeight()}if(v!=n){m.mCustomScrollbar("update");n=v}},300)}})},update:function(){var n=c(this),k=n.children(".mCustomScrollBox"),q=k.children(".mCSB_container");q.removeClass("mCS_no_scrollbar");n.removeClass("mCS_disabled mCS_destroyed");k.scrollTop(0).scrollLeft(0);var y=k.children(".mCSB_scrollTools"),o=y.children(".mCSB_draggerContainer"),m=o.children(".mCSB_dragger");if(n.data("horizontalScroll")){var A=y.children(".mCSB_buttonLeft"),t=y.children(".mCSB_buttonRight"),f=k.width();if(n.data("autoExpandHorizontalScroll")){q.css({position:"absolute",width:"auto"}).wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />").css({width:q.outerWidth(),position:"relative"}).unwrap()}var z=q.outerWidth()}else{var w=y.children(".mCSB_buttonUp"),g=y.children(".mCSB_buttonDown"),r=k.height(),i=q.outerHeight()}if(i>r&&!n.data("horizontalScroll")){y.css("display","block");var s=o.height();if(n.data("autoDraggerLength")){var u=Math.round(r/i*s),l=m.data("minDraggerHeight");if(u<=l){m.css({height:l})}else{if(u>=s-10){var p=s-10;m.css({height:p})}else{m.css({height:u})}}m.children(".mCSB_dragger_bar").css({"line-height":m.height()+"px"})}var B=m.height(),x=(i-r)/(s-B);n.data("scrollAmount",x).mCustomScrollbar("scrolling",k,q,o,m,w,g,A,t);var D=Math.abs(q.position().top);n.mCustomScrollbar("scrollTo",D,{scrollInertia:0,trigger:"internal"})}else{if(z>f&&n.data("horizontalScroll")){y.css("display","block");var h=o.width();if(n.data("autoDraggerLength")){var j=Math.round(f/z*h),C=m.data("minDraggerWidth");if(j<=C){m.css({width:C})}else{if(j>=h-10){var e=h-10;m.css({width:e})}else{m.css({width:j})}}}var v=m.width(),x=(z-f)/(h-v);n.data("scrollAmount",x).mCustomScrollbar("scrolling",k,q,o,m,w,g,A,t);var D=Math.abs(q.position().left);n.mCustomScrollbar("scrollTo",D,{scrollInertia:0,trigger:"internal"})}else{k.unbind("mousewheel focusin");if(n.data("horizontalScroll")){m.add(q).css("left",0)}else{m.add(q).css("top",0)}y.css("display","none");q.addClass("mCS_no_scrollbar");n.data({bindEvent_mousewheel:false,bindEvent_focusin:false})}}},scrolling:function(h,p,m,j,w,e,A,v){var k=c(this);if(!k.data("bindEvent_scrollbar_drag")){var n,o;if(c.support.msPointer){j.bind("MSPointerDown",function(H){H.preventDefault();k.data({on_drag:true});j.addClass("mCSB_dragger_onDrag");var G=c(this),J=G.offset(),F=H.originalEvent.pageX-J.left,I=H.originalEvent.pageY-J.top;if(F<G.width()&&F>0&&I<G.height()&&I>0){n=I;o=F}});c(document).bind("MSPointerMove."+k.data("mCustomScrollbarIndex"),function(H){H.preventDefault();if(k.data("on_drag")){var G=j,J=G.offset(),F=H.originalEvent.pageX-J.left,I=H.originalEvent.pageY-J.top;D(n,o,I,F)}}).bind("MSPointerUp."+k.data("mCustomScrollbarIndex"),function(x){k.data({on_drag:false});j.removeClass("mCSB_dragger_onDrag")})}else{j.bind("mousedown touchstart",function(H){H.preventDefault();H.stopImmediatePropagation();var G=c(this),K=G.offset(),F,J;if(H.type==="touchstart"){var I=H.originalEvent.touches[0]||H.originalEvent.changedTouches[0];F=I.pageX-K.left;J=I.pageY-K.top}else{k.data({on_drag:true});j.addClass("mCSB_dragger_onDrag");F=H.pageX-K.left;J=H.pageY-K.top}if(F<G.width()&&F>0&&J<G.height()&&J>0){n=J;o=F}}).bind("touchmove",function(H){H.preventDefault();H.stopImmediatePropagation();var K=H.originalEvent.touches[0]||H.originalEvent.changedTouches[0],G=c(this),J=G.offset(),F=K.pageX-J.left,I=K.pageY-J.top;D(n,o,I,F)});c(document).bind("mousemove."+k.data("mCustomScrollbarIndex"),function(H){if(k.data("on_drag")){var G=j,J=G.offset(),F=H.pageX-J.left,I=H.pageY-J.top;D(n,o,I,F)}}).bind("mouseup."+k.data("mCustomScrollbarIndex"),function(x){k.data({on_drag:false});j.removeClass("mCSB_dragger_onDrag")})}k.data({bindEvent_scrollbar_drag:true})}function D(G,H,I,F){if(k.data("horizontalScroll")){k.mCustomScrollbar("scrollTo",(j.position().left-(H))+F,{moveDragger:true,trigger:"internal"})}else{k.mCustomScrollbar("scrollTo",(j.position().top-(G))+I,{moveDragger:true,trigger:"internal"})}}if(c.support.touch&&k.data("contentTouchScroll")){if(!k.data("bindEvent_content_touch")){var l,B,r,s,u,C,E;p.bind("touchstart",function(x){x.stopImmediatePropagation();l=x.originalEvent.touches[0]||x.originalEvent.changedTouches[0];B=c(this);r=B.offset();u=l.pageX-r.left;s=l.pageY-r.top;C=s;E=u});p.bind("touchmove",function(x){x.preventDefault();x.stopImmediatePropagation();l=x.originalEvent.touches[0]||x.originalEvent.changedTouches[0];B=c(this).parent();r=B.offset();u=l.pageX-r.left;s=l.pageY-r.top;if(k.data("horizontalScroll")){k.mCustomScrollbar("scrollTo",E-u,{trigger:"internal"})}else{k.mCustomScrollbar("scrollTo",C-s,{trigger:"internal"})}})}}if(!k.data("bindEvent_scrollbar_click")){m.bind("click",function(F){var x=(F.pageY-m.offset().top)*k.data("scrollAmount"),y=c(F.target);if(k.data("horizontalScroll")){x=(F.pageX-m.offset().left)*k.data("scrollAmount")}if(y.hasClass("mCSB_draggerContainer")||y.hasClass("mCSB_draggerRail")){k.mCustomScrollbar("scrollTo",x,{trigger:"internal",scrollEasing:"draggerRailEase"})}});k.data({bindEvent_scrollbar_click:true})}if(k.data("mouseWheel")){if(!k.data("bindEvent_mousewheel")){h.bind("mousewheel",function(H,J){var G,F=k.data("mouseWheelPixels"),x=Math.abs(p.position().top),I=j.position().top,y=m.height()-j.height();if(k.data("normalizeMouseWheelDelta")){if(J<0){J=-1}else{J=1}}if(F==="auto"){F=100+Math.round(k.data("scrollAmount")/2)}if(k.data("horizontalScroll")){I=j.position().left;y=m.width()-j.width();x=Math.abs(p.position().left)}if((J>0&&I!==0)||(J<0&&I!==y)){H.preventDefault();H.stopImmediatePropagation()}G=x-(J*F);k.mCustomScrollbar("scrollTo",G,{trigger:"internal"})});k.data({bindEvent_mousewheel:true})}}if(k.data("scrollButtons_enable")){if(k.data("scrollButtons_scrollType")==="pixels"){if(k.data("horizontalScroll")){v.add(A).unbind("mousedown touchstart MSPointerDown mouseup MSPointerUp mouseout MSPointerOut touchend",i,g);k.data({bindEvent_buttonsContinuous_x:false});if(!k.data("bindEvent_buttonsPixels_x")){v.bind("click",function(x){x.preventDefault();q(Math.abs(p.position().left)+k.data("scrollButtons_scrollAmount"))});A.bind("click",function(x){x.preventDefault();q(Math.abs(p.position().left)-k.data("scrollButtons_scrollAmount"))});k.data({bindEvent_buttonsPixels_x:true})}}else{e.add(w).unbind("mousedown touchstart MSPointerDown mouseup MSPointerUp mouseout MSPointerOut touchend",i,g);k.data({bindEvent_buttonsContinuous_y:false});if(!k.data("bindEvent_buttonsPixels_y")){e.bind("click",function(x){x.preventDefault();q(Math.abs(p.position().top)+k.data("scrollButtons_scrollAmount"))});w.bind("click",function(x){x.preventDefault();q(Math.abs(p.position().top)-k.data("scrollButtons_scrollAmount"))});k.data({bindEvent_buttonsPixels_y:true})}}function q(x){if(!j.data("preventAction")){j.data("preventAction",true);k.mCustomScrollbar("scrollTo",x,{trigger:"internal"})}}}else{if(k.data("horizontalScroll")){v.add(A).unbind("click");k.data({bindEvent_buttonsPixels_x:false});if(!k.data("bindEvent_buttonsContinuous_x")){v.bind("mousedown touchstart MSPointerDown",function(y){y.preventDefault();var x=z();k.data({mCSB_buttonScrollRight:setInterval(function(){k.mCustomScrollbar("scrollTo",Math.abs(p.position().left)+x,{trigger:"internal",scrollEasing:"easeOutCirc"})},17)})});var i=function(x){x.preventDefault();clearInterval(k.data("mCSB_buttonScrollRight"))};v.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",i);A.bind("mousedown touchstart MSPointerDown",function(y){y.preventDefault();var x=z();k.data({mCSB_buttonScrollLeft:setInterval(function(){k.mCustomScrollbar("scrollTo",Math.abs(p.position().left)-x,{trigger:"internal",scrollEasing:"easeOutCirc"})},17)})});var g=function(x){x.preventDefault();clearInterval(k.data("mCSB_buttonScrollLeft"))};A.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",g);k.data({bindEvent_buttonsContinuous_x:true})}}else{e.add(w).unbind("click");k.data({bindEvent_buttonsPixels_y:false});if(!k.data("bindEvent_buttonsContinuous_y")){e.bind("mousedown touchstart MSPointerDown",function(y){y.preventDefault();var x=z();k.data({mCSB_buttonScrollDown:setInterval(function(){k.mCustomScrollbar("scrollTo",Math.abs(p.position().top)+x,{trigger:"internal",scrollEasing:"easeOutCirc"})},17)})});var t=function(x){x.preventDefault();clearInterval(k.data("mCSB_buttonScrollDown"))};e.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",t);w.bind("mousedown touchstart MSPointerDown",function(y){y.preventDefault();var x=z();k.data({mCSB_buttonScrollUp:setInterval(function(){k.mCustomScrollbar("scrollTo",Math.abs(p.position().top)-x,{trigger:"internal",scrollEasing:"easeOutCirc"})},17)})});var f=function(x){x.preventDefault();clearInterval(k.data("mCSB_buttonScrollUp"))};w.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",f);k.data({bindEvent_buttonsContinuous_y:true})}}function z(){var x=k.data("scrollButtons_scrollSpeed");if(k.data("scrollButtons_scrollSpeed")==="auto"){x=Math.round((k.data("scrollInertia")+100)/40)}return x}}}if(k.data("autoScrollOnFocus")){if(!k.data("bindEvent_focusin")){h.bind("focusin",function(){h.scrollTop(0).scrollLeft(0);var x=c(document.activeElement);if(x.is("input,textarea,select,button,a[tabindex],area,object")){var G=p.position().top,y=x.position().top,F=h.height()-x.outerHeight();if(k.data("horizontalScroll")){G=p.position().left;y=x.position().left;F=h.width()-x.outerWidth()}if(G+y<0||G+y>F){k.mCustomScrollbar("scrollTo",y,{trigger:"internal"})}}});k.data({bindEvent_focusin:true})}}if(k.data("autoHideScrollbar")){if(!k.data("bindEvent_autoHideScrollbar")){h.bind("mouseenter",function(x){h.addClass("mCS-mouse-over");d.showScrollbar.call(h.children(".mCSB_scrollTools"))}).bind("mouseleave touchend",function(x){h.removeClass("mCS-mouse-over");if(x.type==="mouseleave"){d.hideScrollbar.call(h.children(".mCSB_scrollTools"))}});k.data({bindEvent_autoHideScrollbar:true})}}},scrollTo:function(e,f){var i=c(this),o={moveDragger:false,trigger:"external",callbacks:true,scrollInertia:i.data("scrollInertia"),scrollEasing:i.data("scrollEasing")},f=c.extend(o,f),p,g=i.children(".mCustomScrollBox"),k=g.children(".mCSB_container"),r=g.children(".mCSB_scrollTools"),j=r.children(".mCSB_draggerContainer"),h=j.children(".mCSB_dragger"),t=draggerSpeed=f.scrollInertia,q,s,m,l;if(!k.hasClass("mCS_no_scrollbar")){i.data({mCS_trigger:f.trigger});if(i.data("mCS_Init")){f.callbacks=false}if(e||e===0){if(typeof(e)==="number"){if(f.moveDragger){p=e;if(i.data("horizontalScroll")){e=h.position().left*i.data("scrollAmount")}else{e=h.position().top*i.data("scrollAmount")}draggerSpeed=0}else{p=e/i.data("scrollAmount")}}else{if(typeof(e)==="string"){var v;if(e==="top"){v=0}else{if(e==="bottom"&&!i.data("horizontalScroll")){v=k.outerHeight()-g.height()}else{if(e==="left"){v=0}else{if(e==="right"&&i.data("horizontalScroll")){v=k.outerWidth()-g.width()}else{if(e==="first"){v=i.find(".mCSB_container").find(":first")}else{if(e==="last"){v=i.find(".mCSB_container").find(":last")}else{v=i.find(e)}}}}}}if(v.length===1){if(i.data("horizontalScroll")){e=v.position().left}else{e=v.position().top}p=e/i.data("scrollAmount")}else{p=e=v}}}if(i.data("horizontalScroll")){if(i.data("onTotalScrollBack_Offset")){s=-i.data("onTotalScrollBack_Offset")}if(i.data("onTotalScroll_Offset")){l=g.width()-k.outerWidth()+i.data("onTotalScroll_Offset")}if(p<0){p=e=0;clearInterval(i.data("mCSB_buttonScrollLeft"));if(!s){q=true}}else{if(p>=j.width()-h.width()){p=j.width()-h.width();e=g.width()-k.outerWidth();clearInterval(i.data("mCSB_buttonScrollRight"));if(!l){m=true}}else{e=-e}}var n=i.data("snapAmount");if(n){e=Math.round(e/n)*n-i.data("snapOffset")}d.mTweenAxis.call(this,h[0],"left",Math.round(p),draggerSpeed,f.scrollEasing);d.mTweenAxis.call(this,k[0],"left",Math.round(e),t,f.scrollEasing,{onStart:function(){if(f.callbacks&&!i.data("mCS_tweenRunning")){u("onScrollStart")}if(i.data("autoHideScrollbar")){d.showScrollbar.call(r)}},onUpdate:function(){if(f.callbacks){u("whileScrolling")}},onComplete:function(){if(f.callbacks){u("onScroll");if(q||(s&&k.position().left>=s)){u("onTotalScrollBack")}if(m||(l&&k.position().left<=l)){u("onTotalScroll")}}h.data("preventAction",false);i.data("mCS_tweenRunning",false);if(i.data("autoHideScrollbar")){if(!g.hasClass("mCS-mouse-over")){d.hideScrollbar.call(r)}}}})}else{if(i.data("onTotalScrollBack_Offset")){s=-i.data("onTotalScrollBack_Offset")}if(i.data("onTotalScroll_Offset")){l=g.height()-k.outerHeight()+i.data("onTotalScroll_Offset")}if(p<0){p=e=0;clearInterval(i.data("mCSB_buttonScrollUp"));if(!s){q=true}}else{if(p>=j.height()-h.height()){p=j.height()-h.height();e=g.height()-k.outerHeight();clearInterval(i.data("mCSB_buttonScrollDown"));if(!l){m=true}}else{e=-e}}var n=i.data("snapAmount");if(n){e=Math.round(e/n)*n-i.data("snapOffset")}d.mTweenAxis.call(this,h[0],"top",Math.round(p),draggerSpeed,f.scrollEasing);d.mTweenAxis.call(this,k[0],"top",Math.round(e),t,f.scrollEasing,{onStart:function(){if(f.callbacks&&!i.data("mCS_tweenRunning")){u("onScrollStart")}if(i.data("autoHideScrollbar")){d.showScrollbar.call(r)}},onUpdate:function(){if(f.callbacks){u("whileScrolling")}},onComplete:function(){if(f.callbacks){u("onScroll");if(q||(s&&k.position().top>=s)){u("onTotalScrollBack")}if(m||(l&&k.position().top<=l)){u("onTotalScroll")}}h.data("preventAction",false);i.data("mCS_tweenRunning",false);if(i.data("autoHideScrollbar")){if(!g.hasClass("mCS-mouse-over")){d.hideScrollbar.call(r)}}}})}if(i.data("mCS_Init")){i.data({mCS_Init:false})}}}function u(w){this.mcs={top:k.position().top,left:k.position().left,draggerTop:h.position().top,draggerLeft:h.position().left,topPct:Math.round((100*Math.abs(k.position().top))/Math.abs(k.outerHeight()-g.height())),leftPct:Math.round((100*Math.abs(k.position().left))/Math.abs(k.outerWidth()-g.width()))};switch(w){case"onScrollStart":i.data("mCS_tweenRunning",true).data("onScrollStart_Callback").call(i,this.mcs);break;case"whileScrolling":i.data("whileScrolling_Callback").call(i,this.mcs);break;case"onScroll":i.data("onScroll_Callback").call(i,this.mcs);break;case"onTotalScrollBack":i.data("onTotalScrollBack_Callback").call(i,this.mcs);break;case"onTotalScroll":i.data("onTotalScroll_Callback").call(i,this.mcs);break}}},stop:function(){var g=c(this),e=g.children().children(".mCSB_container"),f=g.children().children().children().children(".mCSB_dragger");d.mTweenAxisStop.call(this,e[0]);d.mTweenAxisStop.call(this,f[0])},disable:function(e){var j=c(this),f=j.children(".mCustomScrollBox"),h=f.children(".mCSB_container"),g=f.children(".mCSB_scrollTools"),i=g.children().children(".mCSB_dragger");f.unbind("mousewheel focusin mouseenter mouseleave touchend");h.unbind("touchstart touchmove");if(e){if(j.data("horizontalScroll")){i.add(h).css("left",0)}else{i.add(h).css("top",0)}}g.css("display","none");h.addClass("mCS_no_scrollbar");j.data({bindEvent_mousewheel:false,bindEvent_focusin:false,bindEvent_content_touch:false,bindEvent_autoHideScrollbar:false}).addClass("mCS_disabled")},destroy:function(){var e=c(this);e.removeClass("mCustomScrollbar _mCS_"+e.data("mCustomScrollbarIndex")).addClass("mCS_destroyed").children().children(".mCSB_container").unwrap().children().unwrap().siblings(".mCSB_scrollTools").remove();c(document).unbind("mousemove."+e.data("mCustomScrollbarIndex")+" mouseup."+e.data("mCustomScrollbarIndex")+" MSPointerMove."+e.data("mCustomScrollbarIndex")+" MSPointerUp."+e.data("mCustomScrollbarIndex"));c(window).unbind("resize."+e.data("mCustomScrollbarIndex"))}},d={showScrollbar:function(){this.stop().animate({opacity:1},"fast")},hideScrollbar:function(){this.stop().animate({opacity:0},"fast")},mTweenAxis:function(g,i,h,f,o,y){var y=y||{},v=y.onStart||function(){},p=y.onUpdate||function(){},w=y.onComplete||function(){};var n=t(),l,j=0,r=g.offsetTop,s=g.style;if(i==="left"){r=g.offsetLeft}var m=h-r;q();e();function t(){if(window.performance&&window.performance.now){return window.performance.now()}else{if(window.performance&&window.performance.webkitNow){return window.performance.webkitNow()}else{if(Date.now){return Date.now()}else{return new Date().getTime()}}}}function x(){if(!j){v.call()}j=t()-n;u();if(j>=g._time){g._time=(j>g._time)?j+l-(j-g._time):j+l-1;if(g._time<j+1){g._time=j+1}}if(g._time<f){g._id=_request(x)}else{w.call()}}function u(){if(f>0){g.currVal=k(g._time,r,m,f,o);s[i]=Math.round(g.currVal)+"px"}else{s[i]=h+"px"}p.call()}function e(){l=1000/60;g._time=j+l;_request=(!window.requestAnimationFrame)?function(z){u();return setTimeout(z,0.01)}:window.requestAnimationFrame;g._id=_request(x)}function q(){if(g._id==null){return}if(!window.requestAnimationFrame){clearTimeout(g._id)}else{window.cancelAnimationFrame(g._id)}g._id=null}function k(B,A,F,E,C){switch(C){case"linear":return F*B/E+A;break;case"easeOutQuad":B/=E;return -F*B*(B-2)+A;break;case"easeInOutQuad":B/=E/2;if(B<1){return F/2*B*B+A}B--;return -F/2*(B*(B-2)-1)+A;break;case"easeOutCubic":B/=E;B--;return F*(B*B*B+1)+A;break;case"easeOutQuart":B/=E;B--;return -F*(B*B*B*B-1)+A;break;case"easeOutQuint":B/=E;B--;return F*(B*B*B*B*B+1)+A;break;case"easeOutCirc":B/=E;B--;return F*Math.sqrt(1-B*B)+A;break;case"easeOutSine":return F*Math.sin(B/E*(Math.PI/2))+A;break;case"easeOutExpo":return F*(-Math.pow(2,-10*B/E)+1)+A;break;case"mcsEaseOut":var D=(B/=E)*B,z=D*B;return A+F*(0.499999999999997*z*D+-2.5*D*D+5.5*z+-6.5*D+4*B);break;case"draggerRailEase":B/=E/2;if(B<1){return F/2*B*B*B+A}B-=2;return F/2*(B*B*B+2)+A;break}}},mTweenAxisStop:function(e){if(e._id==null){return}if(!window.requestAnimationFrame){clearTimeout(e._id)}else{window.cancelAnimationFrame(e._id)}e._id=null},rafPolyfill:function(){var f=["ms","moz","webkit","o"],e=f.length;while(--e>-1&&!window.requestAnimationFrame){window.requestAnimationFrame=window[f[e]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[f[e]+"CancelAnimationFrame"]||window[f[e]+"CancelRequestAnimationFrame"]}}};d.rafPolyfill.call();c.support.touch=!!("ontouchstart" in window);c.support.msPointer=window.navigator.msPointerEnabled;var a=("https:"==document.location.protocol)?"https:":"http:";c.event.special.mousewheel||document.write('<script src="'+a+'//cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.0.6/jquery.mousewheel.min.js"><\/script>');c.fn.mCustomScrollbar=function(e){if(b[e]){return b[e].apply(this,Array.prototype.slice.call(arguments,1))}else{if(typeof e==="object"||!e){return b.init.apply(this,arguments)}else{c.error("Method "+e+" does not exist")}}}})(jQuery);


/*
 * jQuery dropdown: A simple dropdown plugin
 * Inspired by Bootstrap: http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * Copyright 2011 Cory LaViska for A Beautiful Site, LLC. (http://abeautifulsite.net/)
 * Dual licensed under the MIT or GPL Version 2 licenses
*/
if(jQuery) (function($) {
	
	$.extend($.fn, {
		dropdown: function(method, data) {
			
			switch( method ) {
				case 'hide':
					hideDropdowns();
					return $(this);
				case 'attach':
					return $(this).attr('data-dropdown', data);
				case 'detach':
					hideDropdowns();
					return $(this).removeAttr('data-dropdown');
				case 'disable':
					return $(this).addClass('dropdown-disabled');
				case 'enable':
					hideDropdowns();
					return $(this).removeClass('dropdown-disabled');
			}
			
		}
	});
	
	function showMenu(event) {
		
		var trigger = $(this),
			dropdown = $( $(this).attr('data-dropdown') ),
			isOpen = trigger.hasClass('dropdown-open'),
			hOffset = parseInt($(this).attr('data-horizontal-offset') || 0),
			vOffset = parseInt($(this).attr('data-vertical-offset') || 0);
		
		if( trigger !== event.target && $(event.target).hasClass('dropdown-ignore') ) return;
		
		event.preventDefault();
		event.stopPropagation();
		
		hideDropdowns();
		
		if( isOpen || trigger.hasClass('dropdown-disabled') ) return;
												
		dropdown
			.css({
				left: dropdown.hasClass('anchor-right') ? 
					trigger.offset().left - (dropdown.outerWidth() - trigger.outerWidth()) + hOffset : trigger.offset().left + hOffset,
				top: trigger.offset().top + trigger.outerHeight() + vOffset
			})
			.show();
		
		trigger.addClass('dropdown-open');
		
	};
	
	function hideDropdowns(event) {
		
		var targetGroup = event ? $(event.target).parents().andSelf() : null;
		if( targetGroup && targetGroup.is('.dropdown-menu') && !targetGroup.is('a') ) return;
		
		$('body')
			.find('.dropdown-menu').hide().end()
			.find('[data-dropdown]').removeClass('dropdown-open');
	};
	
	$(function () {
		$('body').on('click.dropdown', '[data-dropdown]', showMenu);
		$('html').on('click.dropdown', hideDropdowns);
		// Hide on resize (IE7/8 trigger this when any element is resized...)
    if ( $.browser ) {
      if( !$.browser.msie || ($.browser.msie && $.browser.version >= 9) ) {
        $(window).on('resize.dropdown', hideDropdowns);
      }
    }
	});
	
})(jQuery);


/*
 *  Sharrre.com - Make your sharing widget!
 *  Version: beta 1.3.3 
 *  Author: Julien Hany
 *  License: MIT http://en.wikipedia.org/wiki/MIT_License or GPLv2 http://en.wikipedia.org/wiki/GNU_General_Public_License
 *
 *  Modifications by Jerry Thompson
 *
 *  Changes: Added Reddit and Tumblr basic support
 */

/*
 * urlCurl: 'http://' + UPX.Site.domain + '/wp-content/themes/ur_v3/libs/sharrre.php',
 */

;(function ( $, window, document, undefined ) {

  /* Defaults
  ================================================== */
	var pluginName = 'sharrre',
	defaults = {
		className: 'sharrre',
		share: {
			googlePlus: false,
			facebook: false,
			twitter: false,
			stumbleupon: false,
			pinterest: false,
			reddit: false,
			tumblr: false
		},
		shareTotal: 0,
		minShowCount: 9,
		template: '',
		templateTotalSlug: '{total}',
		title: UPX.PageData.title,
		shorturl: UPX.PageData.shorturl != null ? UPX.PageData.shorturl : UPX.PageData.url, 
		url: UPX.PageData.url, 
		text: UPX.PageData.title,
		description: UPX.PageData.summary,
		image: UPX.PageData.image,
		urlCurl: 'http://cdn.widgets.uproxx.com/sharrre/sharrre.php',
		count: {}, //counter by social network
		total: 0,  //total of sharing
		shorterTotal: true, //show total by k or M when number is to big
		enableHover: true, //disable if you want to personalize hover event with callback
		enableCounter: true, //disable if you just want use buttons
		enableTracking: false, //tracking with google analitycs
		hover: function(){}, //personalize hover event with this callback function
		hide: function(){}, //personalize hide event with this callback function
		click: function(){}, //personalize click event with this callback function
		render: function(){}, //personalize render event with this callback function
		buttons: {  //settings for buttons
			googlePlus : {  //http://www.google.com/webmasters/+1/button/
				url: '',  //if you need to personnalize button url
				urlCount: false,  //if you want to use personnalize button url on global counter
				size: 'medium',
				lang: 'en-US',
				annotation: ''
			},
			facebook: { //http://developers.facebook.com/docs/reference/plugins/like/
				url: '',  //if you need to personalize url button
				urlCount: false,  //if you want to use personnalize button url on global counter
				action: 'like',
				layout: 'button_count',
				width: '',
				send: 'false',
				faces: 'false',
				colorscheme: '',
				font: '',
				lang: 'en_US',
				title: '',
				description: '',
				image: '',
			},
			twitter: {  //http://twitter.com/about/resources/tweetbutton
				url: '',  //if you need to personalize url button
				urlCount: false,  //if you want to use personnalize button url on global counter
				count: 'horizontal',
				hashtags: '',
				via: '',
				related: '',
				lang: 'en'
			},
			stumbleupon: {  //http://www.stumbleupon.com/badges/
				url: '',  //if you need to personalize url button
				urlCount: false,  //if you want to use personnalize button url on global counter
				layout: '1'
			},
			pinterest: { //http://pinterest.com/about/goodies/
				url: '',  //if you need to personalize url button
				media: '',
				description: '',
				layout: 'horizontal'
			},
			reddit: { //http://www.reddit.com/buttons/
				url: '',  //if you need to personalize url button
				urlCount: false,  //if you want to use personnalize button url on global counter
				layout: '1'
			},
			tumblr: { // todo
				url: '',  //if you need to personalize url button
				urlCount: false,  //if you want to use personnalize button url on global counter
				layout: '1',
				summary: '',
				media: '',
				property: '',
			}
		}
	},
	/* Json URL to get count number
	================================================== */
	urlJson = {
		googlePlus: "",
		//new FQL method by Sire
		facebook: "https://graph.facebook.com/fql?q=SELECT%20url,%20normalized_url,%20share_count,%20like_count,%20comment_count,%20total_count,commentsbox_count,%20comments_fbid,%20click_count%20FROM%20link_stat%20WHERE%20url=%27{url}%27&callback=?",
		twitter: "",
		// stumbleupon: "http://www.stumbleupon.com/services/1.01/badge.getinfo?url={url}&format=jsonp&callback=?",
		stumbleupon: "",
		pinterest: "",
		reddit: "http://www.reddit.com/api/info.json?url={url}&callback=?",
		tumblr: "",
	},
	
	/* Load share buttons asynchronously
	================================================== */
	loadButton = {
		googlePlus : function(self){
			var sett = self.options.buttons.googlePlus;
			$(self.element).find('.buttons').append('<div class="button googleplus"><div class="g-plusone" data-size="'+sett.size+'" data-href="'+(sett.url !== '' ? sett.url : self.options.url)+'" data-annotation="'+sett.annotation+'"></div></div>');
			window.___gcfg = {
				lang: self.options.buttons.googlePlus.lang
			};
			var loading = 0;
			if(typeof gapi === 'undefined' && loading == 0){
				loading = 1;
				(function() {
					var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
					po.src = '//apis.google.com/js/plusone.js';
					var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
				})();
			} else {
				gapi.plusone.go();
			}
		},
		
		facebook : function(self){
			var sett = self.options.buttons.facebook;
			$(self.element).find('.buttons').append('<div class="button facebook"><div id="fb-root"></div><div class="fb-like" data-href="'+(sett.url !== '' ? sett.url : self.options.url)+'" data-send="'+sett.send+'" data-layout="'+sett.layout+'" data-width="'+sett.width+'" data-show-faces="'+sett.faces+'" data-action="'+sett.action+'" data-colorscheme="'+sett.colorscheme+'" data-font="'+sett.font+'" data-via="'+sett.via+'"></div></div>');
			var loading = 0;
			if(typeof FB === 'undefined' && loading == 0){
				loading = 1;
				(function(d, s, id) {
					var js, fjs = d.getElementsByTagName(s)[0];
					if (d.getElementById(id)) {return;}
					js = d.createElement(s); js.id = id;
					js.src = '//connect.facebook.net/'+sett.lang+'/all.js#xfbml=1';
					fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'facebook-jssdk'));
			} else {
				FB.XFBML.parse();
			}
		},
		
		twitter : function(self){
			var sett = self.options.buttons.twitter;
			$(self.element).find('.buttons').append('<div class="button twitter"><a href="https://twitter.com/share" class="twitter-share-button" data-url="'+(sett.shorturl !== '' ? sett.shorturl : self.options.shorturl)+'" data-count="'+sett.count+'" data-text="'+self.options.text+'" data-via="'+sett.via+'" data-hashtags="'+sett.hashtags+'" data-related="'+sett.related+'" data-lang="'+sett.lang+'">Tweet</a></div>');
			var loading = 0;
			if(typeof twttr === 'undefined' && loading == 0){
				loading = 1;
				(function() {
					var twitterScriptTag = document.createElement('script');
					twitterScriptTag.type = 'text/javascript';
					twitterScriptTag.async = true;
					twitterScriptTag.src = '//platform.twitter.com/widgets.js';
					var s = document.getElementsByTagName('script')[0];
					s.parentNode.insertBefore(twitterScriptTag, s);
				})();
			} else {
				$.ajax({ url: '//platform.twitter.com/widgets.js', dataType: 'script', cache:true}); //http://stackoverflow.com/q/6536108
			}
		},
		
		stumbleupon : function(self){
			var sett = self.options.buttons.stumbleupon;
			$(self.element).find('.buttons').append('<div class="button stumbleupon"><su:badge layout="'+sett.layout+'" location="'+(sett.url !== '' ? sett.url : self.options.url)+'"></su:badge></div>');
			var loading = 0;
			if(typeof STMBLPN === 'undefined' && loading == 0){
				loading = 1;
				(function() {
					var li = document.createElement('script');li.type = 'text/javascript';li.async = true;
					li.src = '//platform.stumbleupon.com/1/widgets.js'; 
					var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(li, s);
				})();
				s = window.setTimeout(function(){
					if(typeof STMBLPN !== 'undefined'){
						STMBLPN.processWidgets();
						clearInterval(s);
					}
				},500);
			} else {
				STMBLPN.processWidgets();
			}
		},

		pinterest : function(self){
			var sett = self.options.buttons.pinterest;
			$(self.element).find('.buttons').append('<div class="button pinterest"><a href="http://pinterest.com/pin/create/button/?url='+(sett.url !== '' ? sett.url : self.options.url)+'&media='+sett.media+'&description='+sett.description+'" class="pin-it-button" count-layout="'+sett.layout+'">Pin It</a></div>');
			(function() {
				var li = document.createElement('script'); li.type = 'text/javascript'; li.async = true;
				li.src = '//assets.pinterest.com/js/pinit.js'; 
				var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(li, s);
			})();
		},
	
		reddit : function(self){
			var sett = self.options.buttons.reddit;
			$(self.element).find('.buttons').append('<div class="button reddit"><a href="http://my.reddit.com/submit" onclick="window.open(\'http://my.reddit.com/submit?url=\' + encodeURIComponent(\''+(sett.url !== '' ? sett.url : self.options.url)+'\')); return false" rel="nofollow external"><img src="http://www.reddit.com/static/spreddit5.gif" alt="submit to reddit" border="0" /></a></div>');
		},
	
		tumblr : function(self){
			var sett = self.options.buttons.tumblr;
			var caption = '<a href="' + (sett.url !== '' ? sett.url : self.options.url) + '" target="_blank"><b>' + (sett.title !== '' ? sett.title : self.options.title)  + '</b></a><p>' + sett.summary + '</p><p>Source: <a href="' + (sett.url !== '' ? sett.url : self.options.url) + '" target="_blank">' + sett.property + '</a></p>';
			$(self.element).find('.buttons').append('<div class="button tumblr"><a href="javascript:;;" onclick="window.open(\'http://www.tumblr.com/share/photo?source='+encodeURIComponent(sett.media)+'&caption='+encodeURIComponent(caption)+'&clickthru='+encodeURIComponent((sett.url !== '' ? sett.url : self.options.url))+'\', \'tumblr\', \'toolbar=no,width=700,height=400\'); return false" title="Share on Tumblr" style="display:inline-block; text-indent:-9999px; overflow:hidden; width:63px; height:20px; background:url(\'http://platform.tumblr.com/v1/share_2.png\') top left no-repeat transparent;">Share on Tumblr</a></div>');
		}
	},

	/* Tracking for Google Analytics
	================================================== */
	tracking = {
		googlePlus: function(){},
		facebook: function(){
			fb = window.setInterval(function(){
				if (typeof FB !== 'undefined') {
					FB.Event.subscribe('edge.create', function(targetUrl) {
						if (typeof(_gaq) !== 'undefined') {
							_gaq.push(['_trackSocial', 'facebook', 'like', targetUrl]);
						}
					});
					FB.Event.subscribe('edge.remove', function(targetUrl) {
						if (typeof(_gaq) !== 'undefined') {
							_gaq.push(['_trackSocial', 'facebook', 'unlike', targetUrl]);
						}
					});
					FB.Event.subscribe('message.send', function(targetUrl) {
						if (typeof(_gaq) !== 'undefined') {
							_gaq.push(['_trackSocial', 'facebook', 'send', targetUrl]);
						}
					});
					clearInterval(fb);
				}
			},1000);
		},
		twitter: function(){
			tw = window.setInterval(function(){
				if (typeof twttr !== 'undefined') {
					twttr.events.bind('tweet', function(event) {
						if (event) {
							if (typeof(_gaq) !== 'undefined') {
								_gaq.push(['_trackSocial', 'twitter', 'tweet']);
							}
						}
					});
					clearInterval(tw);
				}
			},1000);
		},
		stumbleupon: function(){},
		pinterest: function(){
			//if somenone find a solution, mail me !
		},
		reddit: function(){
			if (typeof(_gaq) !== 'undefined') {
				_gaq.push(['_trackSocial', 'reddit', 'share']);
			}
		},
		tumblr: function(){
			 if (typeof(_gaq) !== 'undefined') {
				_gaq.push(['_trackSocial', 'tumblr', 'share']);
			}
		},
	},

	/* Popup for each social network
	================================================== */
	popup = {
		googlePlus: function(opt){
			window.open("https://plus.google.com/share?hl="+opt.buttons.googlePlus.lang+"&url="+encodeURIComponent((opt.buttons.googlePlus.url !== '' ? opt.buttons.googlePlus.url : opt.url)), "", "toolbar=0, status=0, width=900, height=500");
		},
		facebook: function(opt){
			window.open("https://www.facebook.com/dialog/feed?display=popup&app_id=" + UPX.Site.fb_app_id + "&name="+encodeURIComponent((opt.buttons.facebook.title!== '' ? opt.buttons.facebook.title : opt.title))+"&description="+encodeURIComponent((opt.buttons.facebook.description!== '' ? opt.buttons.facebook.description : opt.description))+"&link="+encodeURIComponent((opt.buttons.facebook.url !== '' ? opt.buttons.facebook.url : opt.url))+"&picture="+encodeURIComponent((opt.buttons.facebook.image!== '' ? opt.buttons.facebook.image : opt.image)) + "&redirect_uri=http://widgets.uproxx.com/fb/close.php", "", "toolbar=0, status=0, width=650, height=415");
		},
		twitter: function(opt){
			window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(opt.text)+"&url="+encodeURIComponent((opt.buttons.twitter.url !== '' ? opt.buttons.twitter.url : opt.url))+(opt.buttons.twitter.via !== '' ? '&via='+opt.buttons.twitter.via : ''), "", "toolbar=0, status=0, width=650, height=440");
		},
		stumbleupon: function(opt){
			window.open('http://www.stumbleupon.com/badge/?url='+encodeURIComponent((opt.buttons.delicious.url !== '' ? opt.buttons.delicious.url : opt.url)), 'stumbleupon', 'toolbar=no,width=550,height=550');
		},
		pinterest: function(opt){
			window.open('http://pinterest.com/pin/create/button/?url='+encodeURIComponent((opt.buttons.pinterest.url !== '' ? opt.buttons.pinterest.url : opt.url))+'&media='+encodeURIComponent(opt.buttons.pinterest.media)+'&description='+opt.buttons.pinterest.description, 'pinterest', 'toolbar=no,width=700,height=300');
		},
		reddit: function(opt){
			window.open('http://my.reddit.com/submit?url='+encodeURIComponent((opt.buttons.reddit.url !== '' ? opt.buttons.reddit.url : opt.url)), 'reddit', 'toolbar=no,width=700,height=300');
		},
		tumblr: function(opt){
			var caption = '<a href="' + (sett.url !== '' ? sett.url : opt.buttons.tumblr.url) + '" target="_blank"><b>' + (sett.title !== '' ? sett.title : opt.buttons.tumblr.title)  + '</b></a><p>' + opt.buttons.tumblr.summary + '</p><p>Source: <a href="' + (opt.buttons.tumblr.url !== '' ? opt.buttons.tumblr.url : opt.url) + '" target="_blank">' + opt.buttons.tumblr.property + '</a></p>';
			window.open('http://www.tumblr.com/share/photo?source=' + encodeURIComponent(opt.buttons.tumblr.media) + '&caption='+encodeURIComponent(caption)+'&clickthru='+encodeURIComponent((opt.buttons.tumblr.url !== '' ? opt.buttons.tumblr.url : opt.url)), 'tumblr', 'toolbar=no,width=700,height=300');
		},
	};

	/* Plugin constructor
	================================================== */
	function Plugin( element, options ) {
		this.element = element;

		this.options = $.extend( true, {}, defaults, options);
		this.options.share = options.share; //simple solution to allow order of buttons

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	};
  
	/* Initialization method
	================================================== */
	Plugin.prototype.init = function () {
		var self = this;
		if(this.options.urlCurl !== ''){
			/*
			urlJson.googlePlus = this.options.urlCurl + '?url={url}&type=googlePlus'; // PHP script for GooglePlus...
			urlJson.stumbleupon = this.options.urlCurl + '?url={url}&type=stumbleupon'; // PHP script for Stumbleupon...
			urlJson.reddit = this.options.urlCurl + '?url={url}&type=reddit'; // PHP script for reddit...
			*/
		}
		$(this.element).addClass(this.options.className); //add class

		//HTML5 Custom data
		if(typeof $(this.element).data('title') !== 'undefined'){
			this.options.title = $(this.element).attr('data-title');
		}
		if(typeof $(this.element).data('url') !== 'undefined'){
			this.options.url = $(this.element).data('url');
		}
		if(typeof $(this.element).data('text') !== 'undefined'){
			this.options.text = $(this.element).data('text');
		}

		//how many social website have been selected
		$.each(this.options.share, function(name, val) {
			if(val === true){
				self.options.shareTotal ++;
			}
		});
	
		if(self.options.enableCounter === true){  //if for some reason you don't need counter
			//get count of social share that have been selected
			$.each(this.options.share, function(name, val) {
				if(val === true){
					//self.getSocialJson(name);
					try {
						self.getSocialJson(name);
					} catch(e){
					}
				}
			});
		} else if(self.options.template !== ''){  //for personalized button (with template)
			this.options.render(this, this.options);
		} else{ // if you want to use official button like example 3 or 5
			this.loadButtons();
		}
	
		//add hover event
		$(this.element).hover(function(){
			//load social button if enable and 1 time
			if($(this).find('.buttons').length === 0 && self.options.enableHover === true){
				self.loadButtons();
			}
			self.options.hover(self, self.options);
		}, function(){
			self.options.hide(self, self.options);
		});
	
		//click event
		$(this.element).click(function(){
			self.options.click(self, self.options);
			return false;
		});	
	};
  
	/* loadButtons methode
	================================================== */
	Plugin.prototype.loadButtons = function () {
		var self = this;
		$(this.element).append('<div class="buttons"></div>');
		$.each(self.options.share, function(name, val) {
			if(val == true){
				loadButton[name](self);
				if(self.options.enableTracking === true){ //add tracking
					tracking[name]();
				}
			}
		});
	};
  
	/* getSocialJson methode
	================================================== */
	Plugin.prototype.getSocialJson = function (name) {
		var self = this,
		count = 0,
		url = urlJson[name].replace('{url}', encodeURIComponent(this.options.url));

		if(this.options.buttons[name].urlCount === true && this.options.buttons[name].url !== ''){
			url = urlJson[name].replace('{url}', this.options.buttons[name].url);
		}

		if(url != '' && self.options.urlCurl !== ''){  //urlCurl = '' if you don't want to used PHP script but used social button

		$.getJSON(url, function(json){
			if(typeof json.count !== "undefined"){  //GooglePlus, Stumbleupon, Twitter and Digg
				var temp = json.count + '';
				temp = temp.replace('\u00c2\u00a0', '');  //remove google plus special chars
				count += parseInt(temp, 10);
			} else if(typeof json.count !== "undefined"){  //get the reddit count
				count += parseInt(json.count, 10);
			} else if(json.data && json.data.length > 0 && typeof json.data[0].total_count !== "undefined"){ //Facebook total count
				count += parseInt(json.data[0].total_count, 10);
			} else if(typeof json.shares !== "undefined"){  //Facebook
				count += parseInt(json.shares, 10);
			} else if(typeof json[0] !== "undefined"){  //Stumbleupon
		
			}
			self.options.count[name] = count;
			self.options.total += count;
			self.renderer();
			self.rendererPerso();
		  })
			.error(function() { 
				self.options.count[name] = 0;
				self.rendererPerso();
			});
		} else {
			self.renderer();
			self.options.count[name] = 0;
			self.rendererPerso();
		}
	};
  
	/* launch render methode
	================================================== */
	Plugin.prototype.rendererPerso = function () {
		//check if this is the last social website to launch render
		var shareCount = 0;
		for (e in this.options.count) { shareCount++; }
		if(shareCount === this.options.shareTotal){
			this.options.render(this, this.options);
		}
	};
  
	/* render methode
	================================================== */
	Plugin.prototype.renderer = function () {
	
		var total = this.options.total,
		long_total = total,
		template = this.options.template,
		templateTotalSlug = this.options.templateTotalSlug;
		
		if(this.options.shorterTotal === true){  //format number like 1.2k or 5M
			total = this.shorterTotal(total);
		}

		if(template !== ''){  //if there is a template
			if (long_total > this.options.minShowCount){
				template = template.replace(templateTotalSlug, total);
			} else {
				template = '';
			}
			$(this.element).html(template);
		}
	};
  
	/* format total numbers like 1.2k or 5M
	================================================== */
	Plugin.prototype.shorterTotal = function (num) {
		if (num >= 1e6){
			num = (num / 1e6).toFixed(2) + "M"
		} else if (num >= 1e3){ 
			num = (num / 1e3).toFixed(1) + "k"
		}
		return num;
	};
  
	/* Methode for open popup
	================================================== */
	Plugin.prototype.openPopup = function (site) {
		popup[site](this.options);  //open
		if(this.options.enableTracking === true){ //tracking!
			var tracking = {
				googlePlus: {site: 'Google', action: '+1'},
				facebook: {site: 'facebook', action: 'like'},
				twitter: {site: 'twitter', action: 'tweet'},
				stumbleupon: {site: 'stumbleupon', action: 'add'},
				pinterest: {site: 'pinterest', action: 'pin'},
				tumblr: {site: 'tumblr', action: 'tumble'},
			};
			if (typeof(_gaq) !== 'undefined') {
				_gaq.push(['_trackSocial', tracking[site].site, tracking[site].action]);
			}
		}
	};
  
	/* Methode for add +1 to a counter
	================================================== */
	Plugin.prototype.simulateClick = function () {
		var html = $(this.element).html();
		$(this.element).html(html.replace(this.options.total, this.options.total+1));
	};
  
	/* Methode for add +1 to a counter
	================================================== */
	Plugin.prototype.update = function (url, text) {
		if(url !== ''){
			this.options.url = url;
		}
		if(text !== ''){
			this.options.text = text;
		}
	};

	/* A really lightweight plugin wrapper around the constructor, preventing against multiple instantiations
	================================================== */
	$.fn[pluginName] = function ( options ) {
		var args = arguments;
		if (options === undefined || typeof options === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			return this.each(function () {
				var instance = $.data(this, 'plugin_' + pluginName);
				if (instance instanceof Plugin && typeof instance[options] === 'function') {
					instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
				}
			});
		}
	};
})(jQuery, window, document);;
var UPROXX_CoreVer = '20150113';
var wasPortrait = -1;
var overlay_shown = true;

function space2Plus(str){
	return str.split(' ').join('+');
}

/*
 * Load into DOM
 */
function loadjscssfile(filename, filetype){
	if (filetype=="js"){ //if filename is a external JavaScript file
		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", filename)
	}
	else if (filetype=="css"){ //if filename is an external CSS file
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
}

/*
 * Check to see if user is using iOS device
 */
function isMobileUser(typeOfUser){
	var agent = navigator.userAgent.toLowerCase();
	var iphone = ( agent.indexOf('iphone') != -1 );
	var ipad = ( agent.indexOf('ipad') != -1 );
	var ios = ( iphone || ipad );
	
	if ( typeOfUser == 'mobile-only' ) {
		if ( iphone ) {
			return true;
		} else {
			return false;
		}
	}

	if ( ios ) {
		return true;
	} else {
		return false;
	}
}


/*
 * Load iOS CSS modifications
 */
if ( isMobileUser() ) {
	document.getElementsByTagName("body")[0].className += " mobile";
	loadjscssfile("http://p.uproxxcdn.com/global/css/ios.css", "css");
}


/*
 * FancyBox - Ext
 */
// document.domain = "local.tom";

function fancybox_resize(w, h) {
	
	if (h > 0) { 
		jQuery('.fancybox-inner, .fancybox-skin, .fancybox-wrap').css({ height: h });
		jQuery.fancybox.update();
		jQuery.fancybox.toggle();
	}	
}

function fancybox_block(url){
	jQuery("#fancybox-overlay, #fancybox-close").unbind();
	jQuery("#fancybox-close").click(function(){
		window.location.reload();
	});
}

/*
 * Email Signup 
 */
function isValidEmailAddress(emailAddress) {
	var pattern = new 	RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
	return pattern.test(emailAddress);
}
function processDialogSignupForm() {
	jQuery("#email_dialog_status").hide();

	var email = jQuery("#email_dialog_form input#email").val();
	if (email == "" || email == "Enter your email address" || !isValidEmailAddress(email) ) {
		jQuery("#email_dialog_status").html('This field is required.');
		jQuery("#email_dialog_form input#email").focus();
		return false;
	}

	var dataString = 'email=' + email;
	jQuery("#email_dialog_status").html('Sending the bits to our servers... Please wait.');

	jQuery.ajax({
		type: "POST",
		url: "http://" + uproxx_site_domain + "/signup/signup.php",
		data: dataString,
		error: function() {
			jQuery("#email_dialog_form").hide();
			jQuery('#email_dialog_status').html("Sorry.  The bits aren't making it from you to our server over the interwebs.  Please try again later.");
		},
		success: function() {
			jQuery("#email_dialog_form").hide();
			jQuery('#email_dialog_status').hide();
			jQuery('#email_dialog p.message').html("<h3>Thank You</h3>We\'ve received your subscription request and have added you to The Daily Breakdown.");
		}
	});
	return false;
}


function isValidNumber(num){
  isAlpha = /[(A-Z)|(a-z)]/ ;	
  if( isAlpha.test(num)) {
	return 0;
  }
  return 1;
}


/*
 * Handles opening lightbox with action url
 */
function build_lb(href, w, h) {
	jQuery.fancybox({
		autoResize: false,
		autoSize: false,
		href: href,
		type: 'iframe',
		scrolling: 'no',
		width: w,
		height: h,
		padding: 0,
		margin: 0
	});

}

/*
 * Social Login
 */
function build_oauth_dialog(type) {
	var uproxx_action_href = 'http://profile.uproxx.com/signup/';
	if (type == 'fb') {
		build_lb(uproxx_action_href + "?action=fbauth&social=facebook&back_url=" + uproxxsso_back, 650, 440);
	}
	if (type == 'tw') {
		build_lb(uproxx_action_href + "?action=twauth&social=twitter&back_url=" + uproxxsso_back, 650, 290);
	}
	return false;
}

/*
 * User Login
 */
function build_login_dialog() {
	var uproxx_href = 'http://profile.uproxx.com/signin';
	var back = window.location.href;

	if ( isMobileUser('mobile-only') || window.uproxx_force_mobile ) {
		window.location.href = uproxx_href + "/mobile/?back_url=" + back;
	} else {
		if ( isMobileUser() ) {
			window.location.href = uproxx_href + "/page/?back_url=" + back;
		} else {
			build_lb(uproxx_href + "/?popup=1&skin=upx-new&back_url=" + back, 920, 550);
		}
	}
	return false;
}

/*
 * User Signup
 */
function build_signup_dialog() {
	var uproxx_href = 'http://profile.uproxx.com/signup';
	var back = window.location.href;

	if ( isMobileUser('mobile-only') || window.uproxx_force_mobile ) {
		window.location.href = uproxx_href + "/mobile/?back_url=" + back;
	} else {
		if ( isMobileUser() ) {
			window.location.href = uproxx_href + "/page/?back_url=" + back;
		} else {
			build_lb(uproxx_href + "?popup=1&skin=upx-new&back_url=" + back, 920, 550);
		}
	}
	return false;
}

// deprecated
function build_info_dialog() {
	build_lb('http://profile.uproxx.com/about.php', 650, 415);
}


/*
 * Display user mini profile
 */
function build_profile_dialog(uproxx_id) {
	if ( isValidNumber(uproxx_id) ) {
		build_lb('http://profile.uproxx.com/u/' + uproxx_id + '/embed', 650, 415);
	}

	return false;
}


/*
 * Display embed comment
 */
function build_embed_dialog(blog_id, comment_id) {
	if ( isValidNumber(blog_id) && isValidNumber(comment_id) ) {
		build_lb('http://profile.uproxx.com/embed/comment/' + blog_id + '/' + comment_id, 530, 380);
	}

	return false;
}


/*
 * Check comment submission for non-empty value
 */
function checkComment() {
	if ( jQuery('textarea#comment').val() == '' ) {
		alert('Please enter a comment first.');
		return false;
	}
	return true;
}

/*
 * Encodes text into html
 */
function htmlEncode(value){ 
  return jQuery('<div/>').text(value).html(); 
} 


/*
 * Decodes HTML to straight text
 */
function htmlDecode(value){ 
  return jQuery('<div/>').html(value).text(); 
}


/*
 * BV Integration - credit behavior with custom buttons
 */
function credit_behavior(share_type) {	

	if( !UPX.SocoData.user_id || !UPX.SocoData.site_id || !UPX.PageData.id ){
		return false;

	} else if( share_type != 'tw' && share_type != 'fb' && share_type != 'em' ){
		return false;
	}

	jQuery.ajax("http://profile.uproxx.com/api/user-share", {
		data: {
			blog_id: UPX.SocoData.site_id, 
			post_id: UPX.PageData.id,
			user_id: UPX.SocoData.user_id,
			share_type: share_type,
			device: 'desktop'
		}
	});
}

/*
 *  UPROXX Share
 *  Version: 1.7
 *  Author: Jerry Thompson, Max Puhalevich
 *	Copyright 2015 UPROXX Media, Inc.
 *	
 *	Renders all inline share buttons within the article views.
 */
function UPROXX_bigshare(){	
	
	// Only init on story pages
	if ( null !== THRED && 'story' === THRED.PageData.type ) {

		/** Init shares **/
		jQuery(".top_share_widget:not(.processed)").each( function(){

			var obj = jQuery( this );
			obj.addClass( "processed" );

			var post = obj.parents( ".post-data" ),
				url = post.data( "url" ),
				short_url = post.data( "shorturl" ) ? post.data( "shorturl" ) : url,
				title = post.data( "title" ),
				title_tw = post.data( "title-tw" ),
				title_fb = post.data( "title-fb" ),
				summary = post.data( "excerpt" ),
				thumb = post.data( "thumb" ),
				twitter_handle = UPX.Site.twitter_handle,
				fb_app_id = UPX.Site.fb_app_id;

			// Set section specific Twitter handles
			if ( url.toLowerCase().indexOf( "dimemag" ) >= 0 ) {
				twitter_handle = 'DimeMag';
			} else if ( url.toLowerCase().indexOf( "smokingsection" ) >= 0 ) {
				twitter_handle = 'TSSCrew';
			} else if ( url.toLowerCase().indexOf( "sports" ) >= 0 ) {
				twitter_handle = 'UPROXXSports';
			}

			// Find all email divs and convert into a clickable button
			obj.find( ".top_share_em" ).each( function(){
				var elem = jQuery( this );

				elem.on( "click", function(){
					// Build the email action as per RFC2368
					var email_action = 'mailto:?subject=' + encodeURIComponent( title ) + '&body=' + encodeURIComponent( 'I just read this article on UPROXX:\r\n\r\n' + title + '\r\n' + summary + '\r' + short_url );

					if ( true === THRED.SocoData.logged_in ) {
						credit_behavior( 'em' );
					}

					window.location.href = email_action;
					if ( 'undefined' !== typeof(_gaq) ) {
						_gaq.push(['_trackEvent', 'Big Share', 'Email', htmlDecode( title )]);
					}
				});
			});

			// Find all Twitter buttons and convert to clickable
			obj.find( ".top_share_tw" ).each( function(){
				var elem = jQuery( this );

				elem.on( "click", function(){
					window.open( "https://twitter.com/intent/tweet?text=" + encodeURIComponent( title_tw ) + "&url=" + encodeURIComponent( short_url ) + ( twitter_handle !== '' ? '&via=' + encodeURIComponent( twitter_handle ) : '' ), "", "toolbar=0, status=0, width=650, height=440" );

					if ( 'undefined' !== typeof(_gaq) ) {
						_gaq.push(['_trackEvent', 'Big Share', 'Twitter', htmlDecode(title_tw)]);
					}
								
					if ( true === THRED.SocoData.logged_in ) {
						credit_behavior('tw');
					}
				});
			});

			// Find all Facebook buttons and convert to clickable
			obj.find( ".top_share_fb" ).each( function(){
				var elem = jQuery( this );

				elem.on( "click", function(){
					window.open( "https://www.facebook.com/dialog/feed?display=popup&app_id=" + encodeURIComponent( UPX.Site.fb_app_id ) + "&name=" + encodeURIComponent( title_fb ) + "&description=" + encodeURIComponent( ( summary !== null ? summary : '' ) ) + "&link=" + encodeURIComponent( url ) + "&picture=" + encodeURIComponent( thumb !== null ? thumb : '' ) + "&redirect_uri=http://widgets.uproxx.com/fb/close.php", "", "toolbar=0, status=0, width=650, height=415" );

					if ( typeof(_gaq) !== 'undefined' ) {
						_gaq.push(['_trackEvent', 'Big Share', 'Facebook', htmlDecode(title_fb)]);
					}
								
					if ( true === THRED.SocoData.logged_in ) {
						credit_behavior('tw');
					}
				});
			});

			obj.find( ".top_share_count" ).each(function(){
				var elem = jQuery( this );

				elem.sharrre({
					share: { 
						twitter: false,
						facebook: true,
						googlePlus: false,
						stumbleupon: false
					},
					minShowCount: 25,
					templateTotalSlug: '<!--sharetotal-->',
					url: url,
					template: '<span class="count"></span> <!--sharetotal-->',
					enableHover: false,
					enableTracking: false,
				});
			});	
		});//End each
	}
};
jQuery(document).ready(UPROXX_bigshare);


/*
 * UPROXX ButtonShare
 * Version: 1.0
 * Author: Jerry Thompson
 */
function UPROXX_ButtonShare(){

	var share_url = '',
		twitter_handle = 'UPROXX';

	// Set section specific Twitter handles
	if ( UPX.ButtonShare.url.toLowerCase().indexOf("dimemag") >= 0 ) {
		twitter_handle = 'DimeMag';
	} else if ( UPX.ButtonShare.url.toLowerCase().indexOf("smokingsection") >= 0 ) {
		twitter_handle = 'TSSCrew';
	} else if ( UPX.ButtonShare.url.toLowerCase().indexOf("sports") >= 0 ) {
		twitter_handle = 'UPROXXSports';
	}

	if ( UPX.ButtonShare.shorturl ) {
		share_url = UPX.ButtonShare.shorturl;
	} else {
		share_url = UPX.ButtonShare.url;
	}

	switch (UPX.ButtonShare.type){
		case 'tw':
			window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(UPX.ButtonShare.title_tw)+"&url="+encodeURIComponent(share_url)+(twitter_handle !== '' ? '&via='+ encodeURIComponent( twitter_handle ) : ''), "", "toolbar=0, status=0, width=650, height=440");
			if (typeof(_gaq) !== 'undefined') {
				_gaq.push(['_trackEvent', 'Mini Button Share', 'Twitter', htmlDecode(UPX.ButtonShare.title_tw)]);
			}
			break;
		case 'fb':
			window.open("https://www.facebook.com/dialog/feed?display=popup&app_id=" + encodeURIComponent( UPX.Site.fb_app_id ) + "&name="+encodeURIComponent(UPX.ButtonShare.title_fb)+"&description="+encodeURIComponent((UPX.ButtonShare.text !== null ? UPX.ButtonShare.text : ''))+"&link="+encodeURIComponent(share_url)+"&picture="+encodeURIComponent((UPX.ButtonShare.image !== null ? UPX.ButtonShare.image : '')) + "&redirect_uri=http://widgets.uproxx.com/fb/close.php", "", "toolbar=0, status=0, width=650, height=415");
			if (typeof(_gaq) !== 'undefined') {
				_gaq.push(['_trackEvent', 'Mini Button Share', 'Facebook', htmlDecode(UPX.ButtonShare.title_fb)]);
			}
			break;
		case 'gg':
			window.open("https://plus.google.com/share?hl=en-US&url="+encodeURIComponent(share_url), "", "toolbar=0, status=0, width=900, height=500");
			if (typeof(_gaq) !== 'undefined') {
				_gaq.push(['_trackEvent', 'Mini Button Share', 'GooglePlus', htmlDecode(UPX.ButtonShare.title)]);
			}
			break;
	}
}


/**
 * Track page view of the loaded post
 * @returns {undefined}
 */
function uproxx_track_page_view(url, title){
	
	if(!url){
		return false;
	}
	
	if(window.adBlockOn){
		adBlockDetected();
	}

	title = title ? title: "";

	/** Remove category from url **/
	url = url.replace("/category/", "/");

	/** Get relative url **/
	var relativeUrl = url.replace( uproxx_main_object.uproxx_site_url, "" );

	/** Get canonical url **/
	var canonicalUrl = UPX.PageData.canonical;
		relativeCanonicalUrl = canonicalUrl.replace( uproxx_main_object.uproxx_site_url, "" );

	/** Google analytics **/
	if(window._gaq) {
		_gaq.push(["_trackPageview", relativeUrl]);
	}

	/** Quantcast **/
	if(window.__qc){
		__qc.qpixelsent = [];
		_qevents.push({ 
			qacct: _qacct
		});
		__qc.firepixels();
	}

	/** Chartbeat **/
	if(window.pSUPERFLY){
		pSUPERFLY.virtualPage( relativeCanonicalUrl, title );
	}

	/** comScore **/
	if(window.COMSCORE){
		COMSCORE.beacon({ c1:2, c2:8430760, c3:"", c4:url, c5:"", c6:"", c7:url, c15:""});
	}

	/** Parsely **/
	if(window.PARSELY){
		PARSELY.beacon.trackPageView({
			url: url, 
			urlref: window.location.href,
			js: 1,
			action_name: "next"
		});
	}

}

(function($) {
	$(document).ready(function() {
		
		// For home & digest pages
		if ( UPX != null && UPX.PageData.format == "digest" ) {

		}

		// For story pages
		if ( UPX != null && UPX.PageData.type == "story" ) {

		}

		// For topic pages
		if ( UPX != null && UPX.PageData.type == "topic" ) {

		}
	});
})(jQuery);


/*
*   jQuery.stickyPanel
*   ----------------------
*   version: 1.4.1
*   date: 7/21/11
*
*   Copyright (c) 2011 Donny Velazquez
*   http://donnyvblog.blogspot.com/
*   http://code.google.com/p/sticky-panel/
*   
*   Licensed under the Apache License 2.0
*
*/
(function ($) {

    $.fn.stickyPanel = function (options) {

        var options = $.extend({}, $.fn.stickyPanel.defaults, options);
        if(options.donotOverlap){
	        var div = $(options.donotOverlap);
	        if(div.length){
		        options.donotOverlapDiv = div;
	        }else {
		        options.donotOverlap = null;
	        }
        }

        return this.each(function () {
            $(window).bind("scroll.stickyPanel", { selected: $(this), options: options }, Scroll);
        });

    };

    function Scroll(event) {
        
        var node = event.data.selected;
        var o = event.data.options;

        var isMobile = navigator.userAgent.toLowerCase().indexOf('mobile') > 0;

        var windowHeight = $(window).height();
        var nodeHeight = node.outerHeight(true);
        var scrollTop = $(document).scrollTop();
        
        //MAX
        if(o.donotOverlapDiv){
            var footerTop = o.donotOverlapDiv.offset().top;
            var footerHeight = o.donotOverlapDiv.outerHeight(true);
        }
        //

        // when top of window reaches the top of the panel detach
        if (!isMobile && /** MAX **/ !node.data("PanelsFixed") && /**/
        	scrollTop <= $(document).height() - windowHeight && // Fix for rubberband scrolling in Safari on Lion
        	scrollTop > node.offset().top - o.topPadding) {

            // topPadding
            var newNodeTop = 0;
            if (o.topPadding != "undefined") {
                newNodeTop = newNodeTop + o.topPadding;
            }

            // get left before adding spacer
            if ( o.leftPos != "undefined" ) {
            	var nodeLeft = o.leftPos;
			} else {
				var nodeLeft = node.offset().left;
			}
			
            // save panels top
            node.data("PanelsTop", node.offset().top - newNodeTop);

            // MOVED: savePanelSpace before afterDetachCSSClass to handle afterDetachCSSClass changing size of node
            // savePanelSpace
            if (o.savePanelSpace == true) {
                var nodeWidth = node.outerWidth(true);
                var nodeCssfloat = node.css("float");
                var nodeCssdisplay = node.css("display");
                var randomNum = Math.ceil(Math.random() * 9999); /* Pick random number between 1 and 9999 */
                node.data("PanelSpaceID", "stickyPanelSpace" + randomNum);
                node.before("<div id='" + node.data("PanelSpaceID") + "' style='width:" + nodeWidth + "px;height:" + nodeHeight + "px;float:" + nodeCssfloat + ";display:" + nodeCssdisplay + ";'>&nbsp;</div>");
            }

            // afterDetachCSSClass
            if (o.afterDetachCSSClass != "") {
                node.addClass(o.afterDetachCSSClass);
            }

            // save inline css
            node.data("Original_Inline_CSS", (!node.attr("style") ? "" : node.attr("style")));
                       
            // detach panel
            node.css({
                "margin": 0,
                "left": nodeLeft,
                "top": newNodeTop,
                "position": "fixed"
            });
            
            //MAX
            node.data("PanelsFixed", true);
        }
        
        //MAX
        if(o.donotOverlap && node.data("PanelsFixed")){
	        
	        var topPad = o.topPadding? o.topPadding * 1: 0;
	        var parentOffset = node.parent().offset();
			
	        if(scrollTop + topPad + nodeHeight >= footerTop - o.bottomPadding){            
            	node.css({"position": "absolute", "top": footerTop - o.bottomPadding - nodeHeight - parentOffset.top});
                
            }else if(o.topPadding){
                node.css({"position": "fixed", "top": o.topPadding});
            }
        }
        
        // ADDED: css top check to avoid continuous reattachment
        if (scrollTop <= node.data("PanelsTop") && node.css("top") != "auto") {

            if (o.savePanelSpace == true) {
                $("#" + node.data("PanelSpaceID")).remove();
            }

            // attach panel
            node.attr("style", node.data("Original_Inline_CSS"));

            if (o.afterDetachCSSClass != "") {
                node.removeClass(o.afterDetachCSSClass);
            }
            
            //MAX
            node.data("PanelsFixed", false);
        }
    };

    $.fn.stickyPanel.defaults = {
        topPadding: 0,
        // Use this to set the top margin of the detached panel.
        bottomPadding: 0,

        afterDetachCSSClass: "",
        // This class is applied when the panel detaches.

        savePanelSpace: false
        // When set to true the space where the panel was is kept open.
    };

})(jQuery);

/**
 * Comment removal for editorials only
 */
jQuery(document).ready(function(){

	jQuery("body").delegate(".remove-comment", "click", function(){

		if( !confirm("Are you sure you want to remove this comment?")){
			return false;
		}

		var obj = jQuery(this);
		var id = obj.data("id");
		var blog_id = UPX.SocoData.site_id;

		jQuery("li#comment-" + id).hide();

		jQuery.ajax( "http://profile.uproxx.com/admin/ajax-remove-comment.php", {
			data: {id: id, blog_id: blog_id },
			dataType: "jsonp",
			success: function( data ) {
				if(data.errorMsg){
					alert(data.errorMsg);
				}else if(!data.success){
					alert("Something went wrong");
				}
			}
		});

		return false;
	});
	
});

/** Set cookies **/
function uproxxSetCookie(c_name, value, expiredays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + expiredays);
	document.cookie = c_name + "=" + escape(value) + ((expiredays==null) ? "" : ";expires=" + exdate.toUTCString()) + "; path=/";
}

/** Get cookies **/
function uproxxGetCookie(c_name) {
	if (document.cookie.length > 0){
		c_start = document.cookie.indexOf(c_name + "=");
		if (c_start!=-1){
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(";", c_start);
			if (c_end == -1){
				c_end=document.cookie.length;
			}
			return unescape(document.cookie.substring(c_start, c_end));
		}
	}
	return "";
};