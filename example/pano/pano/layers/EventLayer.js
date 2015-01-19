define(function(require){
    var Layer = require('pano/layers/Layer');
    var util = require('pano/util');

	var ANG_TO_RAD = Math.PI / 180;

    var EVENTS, getPagePosition;
    if(util.isMobile){
        EVENTS = {'start':'touchstart', 'moving':'touchmove', 'end': 'touchend'};
        getPagePosition = function(e){
            var evt = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
            return {
                x:evt.pageX,
                y:evt.pageY
            };
        }
    }else{
        EVENTS = {'start':'mousedown', 'moving':'mousemove', 'end': 'mouseup'};
        getPagePosition = function(e){
            return {
                x: e.pageX,
                y: e.pageY
            }
        };
    }

    var EventLayer = Four.util.extend(Layer, {
        init: function(container, options){
            Layer.call(this, container, 3);

            this.content.style.width = '100%';
            this.content.style.height = '100%';
            var cursor = '';

            var self = this;
            var eventLayer = this.content;
            var isUserInteracting = false,
                onPointerDownPointerX,onPointerDownPointerY,
                isEnable = false,
                doInertia = false,
                pos,
                dragStartTime;

            var onDragStart = function(event){
                pos = getPagePosition(event);
                event.preventDefault();
                isUserInteracting = true;
                onPointerDownPointerX = pos.x;
                onPointerDownPointerY = pos.y;
                dragStartTime = Date.now();
                self.onDragStart();
            }
            var movingLock = false;
            var onDragging = function(event){
                pos = getPagePosition(event);
                if ( isUserInteracting === true ) {
                    var dh = onPointerDownPointerX - pos.x;
                    var dp = pos.y - onPointerDownPointerY;
                    if(Math.abs(dh) > 2 || Math.abs(dp) > 2){
                        //if more then 2px, is dragging
                        onPointerDownPointerX = pos.x;
                        onPointerDownPointerY = pos.y;

                        //stop click event
                        dragStartTime = 0;
                        self.onDragging(dh, dp);
                    }
                }
                if(movingLock === false){
                    self.onMoving(pos.x, pos.y);
                    movingLock = true;
                    setTimeout(function(){
                        movingLock = false;
                    }, 16);
                }
            }
            var onDragEnd = function(event){
                isUserInteracting = false;
                self.onDragEnd();
                var duration = Date.now() - dragStartTime;
                dragStartTime = 0;
                if(duration < 250){
                    pos = getPagePosition(event);
                    self.onClick(event, pos.x, pos.y);
                }
            }
            var onMouseWheel = function( event ) {
                var wd = 0;
                if ( event.wheelDeltaY ) {
                    // WebKit
                    wd = event.wheelDeltaY;
                } else if ( event.wheelDelta ) {
                    // Opera / Explorer 9
                    wd = event.wheelDelta;
                } else if ( event.detail ) {
                    // Firefox
                    wd = event.detail * 1.0;
                }
                self.onMouseWheel(wd);
            }
            var onResize = function(){
                self.onResize(window.innerWidth, window.innerHeight);
            }

            this.enable = function(){
                if(isEnable) {
                    return;
                }
                isEnable = true;
                eventLayer.addEventListener(EVENTS.start, onDragStart, false );
                eventLayer.addEventListener(EVENTS.moving, onDragging, false );
                eventLayer.addEventListener(EVENTS.end, onDragEnd, false );
                eventLayer.addEventListener( 'mousewheel', onMouseWheel, false );
                eventLayer.addEventListener( 'DOMMouseScroll', onMouseWheel, false);

                window.addEventListener( 'resize', onResize, false);
            }

            this.disable = function(){
                if(!isEnable){
                    return;
                }
                eventLayer.removeEventListener(EVENTS.start, onDragStart, false );
                eventLayer.removeEventListener(EVENTS.moving, onDragging, false );
                eventLayer.removeEventListener(EVENTS.end, onDragEnd, false );
                eventLayer.removeEventListener( 'mousewheel', onMouseWheel, false );
                eventLayer.removeEventListener( 'DOMMouseScroll', onMouseWheel, false);
                window.removeEventListener( 'resize', onResize, false);
                isEnable = false;
            }
            this.setCursor = function(type){
                if(type !== cursor){
                    eventLayer.style.cursor = type;
                    cursor = type;
                }
            }

            // override
            this.onDragging = function(){};
            this.onDragStart = function(){};
            this.onDragEnd = function(){};
            this.onPovChanged = function(){};
            this.onMouseWheel = function(){};
            this.onResize = function(width, height){};
            this.onMoving = function(x, y){};
            this.onClick = function(){};

            this.enable();

        }
    });
    return EventLayer;
});
