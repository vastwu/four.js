define(function(require){
    var Layer = require('./Layer');

    var util = Four.util;
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

            var self = this;
            var eventLayer = this.content;
            var isUserInteracting = false,
                onPointerDownPointerX,onPointerDownPointerY,
                isEnable = false,
                doInertia = false,
                pos;

            var onDragStart = function(event){
                pos = getPagePosition(event);
                event.preventDefault();
                isUserInteracting = true;
                onPointerDownPointerX = pos.x;
                onPointerDownPointerY = pos.y;
                self.onDragStart();
            }
            var onDragging = function(event){
                pos = getPagePosition(event);
                if ( isUserInteracting === true ) {
                    var dh = onPointerDownPointerX - pos.x;
                    var dp = pos.y - onPointerDownPointerY;
                       
                    onPointerDownPointerX = pos.x;
                    onPointerDownPointerY = pos.y;
                   
                    self.onDragging(dh, dp);
                }else{
                    self.onMoving(pos.x, pos.y);
                }
            }
            var onDragEnd = function(event){
                isUserInteracting = false;
                self.onDragEnd();
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

            // override
            this.onDragging = function(){};
            this.onDragStart = function(){};
            this.onDragEnd = function(){};
            this.onPovChanged = function(){};
            this.onMouseWheel = function(){};
            this.onResize = function(width, height){};
            this.onMoving = function(x, y){};

            this.enable();

        }
    });
    return EventLayer;
});
