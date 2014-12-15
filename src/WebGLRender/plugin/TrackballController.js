define(function(require){
	var ANG_TO_RAD = Math.PI / 180;
    var util = require('WebGLRender/base/util');

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

    var TrackballController = function(domElement, camera, ballRadius){
        var eventLayer = domElement;
        var camera = camera;
        var radius = radius;

        var isUserInteracting = false;
        var heading = 0;
        var pitch = 0;
        var pageX = 0;
        var pageY = 0;
        var doInertia = false;
        var lastDraggingTime = null;

        var heading_stack = new util.DataStack(5);
        var pitch_stack = new util.DataStack(5);
        var isEnable = false;

        var x = 0, y = 0, z = 0, pos, r;

        var updateCamera = function(){
            heading = heading % 360;

            if(pitch > 180){
                pitch = pitch - 360; 
            }else if(pitch < -180){
                pitch = 360 + pitch; 
            }

            if(pitch < -90 || pitch > 90){
                camera.up = [0, -1, 0];
            }else{
                camera.up = [0, 1, 0];
            }

            r = ballRadius * Math.cos(ANG_TO_RAD * pitch);
            x = Math.cos(ANG_TO_RAD * heading) * r;
            y = Math.sin(ANG_TO_RAD * pitch) * ballRadius;
            z = Math.sin(ANG_TO_RAD * heading) * r;

            camera.setPosition(x, y, z);
        }

        var onDragStart = function(e){
            pos = getPagePosition(e);
            heading_stack.clear();
            pitch_stack.clear();
            pageX = pos.x;
            pageY = pos.y;
            isUserInteracting = true;
            doInertia && clearInterval(doInertia);
        }
        var onDragging = function(e){
            if(isUserInteracting){
                pos = getPagePosition(e);
                var dx = (pos.x - pageX) * 0.5;
                var dy = (pos.y - pageY) * 0.5;
                pageX = pos.x;
                pageY = pos.y;
                
                heading_stack.add(dx);
                pitch_stack.add(dy);

                heading += dx;
                pitch += dy;

                updateCamera(); 
                lastDraggingTime = Date.now();
            }
        }
        var onDragEnd = function(e){
            //e = getEvents(e);
            isUserInteracting = false;
            var h = heading_stack.getAverage();
            var p = pitch_stack.getAverage();
            if(Date.now() - lastDraggingTime >= 100){
                return;
            }
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
                    updateCamera();
                }   
            }, 16);
        }
        var onZoom = function(event){
            var dr = 0;
            if ( event.wheelDeltaY ) {
                dr = event.wheelDeltaY;
            // Opera / Explorer 9
            } else if ( event.wheelDelta ) {
                dr = event.wheelDelta;
            // Firefox
            } else if ( event.detail ) {
                dr = -event.detail;
            }
            ballRadius -= dr * 0.01;
            updateCamera();

        }

        this.setPosition = function(new_heading, new_pitch){
            heading = new_heading;
            pitch = new_pitch;
            updateCamera();
        }
        this.enable = function(){
            if(isEnable) {
                return;
            }
            isEnable = true;
            eventLayer.addEventListener( EVENTS.start, onDragStart, false );
            eventLayer.addEventListener( EVENTS.moving, onDragging, false );
            eventLayer.addEventListener( EVENTS.end, onDragEnd, false );
            eventLayer.addEventListener( 'mousewheel', onZoom, false );
            eventLayer.addEventListener( 'DOMMouseScroll', onZoom, false);
        }
        this.disable = function(){
            if(!isEnable){
                return;
            }
            eventLayer.removeEventListener( EVENTS.start, onDragStart, false );
            eventLayer.removeEventListener( EVENTS.moving, onDragging, false );
            eventLayer.removeEventListener( EVENTS.end, onDragEnd, false );
            isEnable = false;
        }
        this.enable();
    }

    return TrackballController;
})
