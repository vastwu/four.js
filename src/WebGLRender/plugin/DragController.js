define(function(require){
    var util = require('WebGLRender/base/util');
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


	var DragController = function (camera, eventLayer) {
        var self = this;
        var heading_cache = new util.DataStack(5);
        var pitch_cache = new util.DataStack(5);
		eventLayer = eventLayer || document;
        var isUserInteracting = false,
            onDragStartMouseX = 0, onDragStartMouseY = 0,
            heading = 0, onDragStartLon = 0,
            pitch = 0, onDragStartLat = 0,
            phi = 0, theta = 0,
            isEnable = false,
            doInertia = false,
            pos;

        var updateLookAt = function(){
            pitch = Math.max( -20, Math.min( 80, pitch ) );
            heading = heading % 360;
            phi = ANG_TO_RAD * ( 90 - pitch );
            theta = ANG_TO_RAD * ( heading );
            // heading = 0, [x, y, z] = [1, 0, 0]
            var x = 1 * Math.sin( phi ) * Math.cos( theta );
            var y = 1 * Math.cos( phi );
            var z = 1 * Math.sin( phi ) * Math.sin( theta );
            camera.lookAt(x, y, z);
            self.onPovChanged(heading, pitch);
        }
		var onDragStart = function(event){
            pos = getPagePosition(event);
            doInertia && clearInterval(doInertia);
            doInertia = null;
            heading_cache.clear();
            pitch_cache.clear();
            event.preventDefault();
            isUserInteracting = true;
            onPointerDownPointerX = pos.x;
            onPointerDownPointerY = pos.y;
            onPointerDownLon = heading;
            onPointerDownLat = pitch;
            self.onDragStart(heading, pitch);
        }
        var onDragging = function(event){
            if ( isUserInteracting === true ) {
                pos = getPagePosition(event);
                var dh = ( onPointerDownPointerX - pos.x ) * 0.1;
                var dp = ( pos.y - onPointerDownPointerY ) * 0.1;
                heading += dh;
                pitch += dp;
	               
                onPointerDownPointerX = pos.x;
                onPointerDownPointerY = pos.y;
               
                heading_cache.add(dh);
                pitch_cache.add(dp);

	            updateLookAt();
                self.onDragging(heading, pitch);
            }
        }
        var onDragEnd = function(event){
            isUserInteracting = false;
            var h = heading_cache.getAverage();
            var p = pitch_cache.getAverage();

            self.onDragEnd(heading, pitch);
            doInertia = setInterval(function(){
                h *= 0.9;
                p *= 0.9;
                var next = false;
                if(Math.abs(h) > 0.01){
                    heading += h;
                    next = true;
                }
                if(Math.abs(p) > 0.01){
                    pitch += p;
                    next = true;
                }
                if(next === false){
                    clearInterval(doInertia);
                }else{
                    updateLookAt();
                }   
            }, 16);
        }
        var onMouseWheel = function( event ) {
            // WebKit
            var fov = camera.fov;
            if ( event.wheelDeltaY ) {
                fov += event.wheelDeltaY * 0.05;
            // Opera / Explorer 9
            } else if ( event.wheelDelta ) {
                fov += event.wheelDelta * 0.05;
            // Firefox
            } else if ( event.detail ) {
                fov -= event.detail * 1.0;
            }
            if(fov >= 0 && fov <= 13){
                camera.fov = fov;
            }
            camera.updateProjectionMatrix();
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
            isEnable = false;
        }
        // override
        this.onDragging = function(){};
        this.onDragStart = function(){};
        this.onDragEnd = function(){};
        this.onPovChanged = function(){};

        this.enable();
	}

	return util.isMobile ? TouchController : DragController;
});
