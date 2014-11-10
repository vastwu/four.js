define(function(require){
	var ANG_TO_RAD = Math.PI / 180;
    var isMobile = navigator.userAgent.toLowerCase().match(/iphone|android/);

    var Cache = function(n){
        var max = n;
        var arr = [];
        this.add = function(v){
            if(arr.length >= max){
                arr.shift();
            }
            arr.push(v);
        }
        this.getAverage = function(){
            var sum = arr.reduce(function(sum, value){
                return sum + value;
            })
            return sum / max;
        }
        this.clear = function(){
            arr = [];
        }
    };

	var DragController = function (camera, eventLayer) {
        var self = this;
        var heading_cache = new Cache(5);
        var pitch_cache = new Cache(5);
		eventLayer = eventLayer || document;
        var isUserInteracting = false,
            onDragStartMouseX = 0, onDragStartMouseY = 0,
            heading = 0, onDragStartLon = 0,
            pitch = 0, onDragStartLat = 0,
            phi = 0, theta = 0,
            isEnable = true;
            doInertia = false;

        var updateLookAt = function(){
            pitch = Math.max( - 85, Math.min( 85, pitch ) );
            heading = heading % 360;
            phi = ANG_TO_RAD * ( 90 - pitch );
            theta = ANG_TO_RAD * ( heading );
            var x = 500 * Math.sin( phi ) * Math.cos( theta );
            var y = 500 * Math.cos( phi );
            var z = 500 * Math.sin( phi ) * Math.sin( theta );
            camera.lookAt(x, y, z);
            self.onPovChanged(heading, pitch);
        }
		var onDragStart = function(event){
            doInertia && clearInterval(doInertia);
            doInertia = null;
            heading_cache.clear();
            pitch_cache.clear();
            event.preventDefault();
            isUserInteracting = true;
            onPointerDownPointerX = event.clientX;
            onPointerDownPointerY = event.clientY;
            onPointerDownLon = heading;
            onPointerDownLat = pitch;
            self.onDragStart(heading, pitch);
        }
        var onDragging = function(event){
            if ( isUserInteracting === true ) {
                var dh = ( onPointerDownPointerX - event.clientX ) * 0.1;
                var dp = ( event.clientY - onPointerDownPointerY ) * 0.1;
                heading += dh;
                pitch += dp;
	               
                onPointerDownPointerX = event.clientX;
                onPointerDownPointerY = event.clientY;
               
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
            if ( event.wheelDeltaY ) {
                camera.fov -= event.wheelDeltaY * 0.05;
            // Opera / Explorer 9
            } else if ( event.wheelDelta ) {
                camera.fov -= event.wheelDelta * 0.05;
            // Firefox
            } else if ( event.detail ) {
                camera.fov += event.detail * 1.0;
            }
            camera.updateProjectionMatrix();
        }
        eventLayer.addEventListener( 'mousedown', onDragStart, false );
        eventLayer.addEventListener( 'mousemove', onDragging, false );
        eventLayer.addEventListener( 'mouseup', onDragEnd, false );
        eventLayer.addEventListener( 'mousewheel', onMouseWheel, false );
        eventLayer.addEventListener( 'DOMMouseScroll', onMouseWheel, false);

        this.enable = function(){
            if(isEnable) {
                return;
            }
            isEnable = true;
            eventLayer.addEventListener( 'mousedown', onDragStart, false );
            eventLayer.addEventListener( 'mousemove', onDragging, false );
            eventLayer.addEventListener( 'mouseup', onDragEnd, false );
            eventLayer.addEventListener( 'mousewheel', onMouseWheel, false );
            eventLayer.addEventListener( 'DOMMouseScroll', onMouseWheel, false);
        }

        this.disable = function(){
            if(!isEnable){
                return;
            }
            eventLayer.removeEventListener( 'mousedown', onDragStart, false );
            eventLayer.removeEventListener( 'mousemove', onDragging, false );
            eventLayer.removeEventListener( 'mouseup', onDragEnd, false );
            eventLayer.removeEventListener( 'mousewheel', onMouseWheel, false );
            eventLayer.removeEventListener( 'DOMMouseScroll', onMouseWheel, false);    
            isEnable = false;
        }
        // override
        this.onDragging = function(){};
        this.onDragStart = function(){};
        this.onDragEnd = function(){};
        this.onPovChanged = function(){};
	}


	var TouchController = function (camera, eventLayer) {
        var self = this;
        var heading_cache = new Cache(5);
        var pitch_cache = new Cache(5);
		eventLayer = eventLayer || document;
        var isUserInteracting = false,
            onDragStartMouseX = 0, onDragStartMouseY = 0,
            heading = 0, onDragStartLon = 0,
            pitch = 0, onDragStartLat = 0,
            phi = 0, theta = 0,
            isEnable = true;
            doInertia = false;

        var updateLookAt = function(){
            pitch = Math.max( - 85, Math.min( 85, pitch ) );
            heading = heading % 360;
            phi = ANG_TO_RAD * ( 90 - pitch );
            theta = ANG_TO_RAD * ( heading );
            var x = 500 * Math.sin( phi ) * Math.cos( theta );
            var y = 500 * Math.cos( phi );
            var z = 500 * Math.sin( phi ) * Math.sin( theta );
            camera.lookAt(x, y, z);
            self.onPovChanged(heading, pitch);
        }
		var onDragStart = function(event){
            doInertia && clearInterval(doInertia);
            doInertia = null;
            heading_cache.clear();
            pitch_cache.clear();
            event.preventDefault();
            var touch = event.touches[0];
            isUserInteracting = true;
            onPointerDownPointerX = touch.clientX;
            onPointerDownPointerY = touch.clientY;
            onPointerDownLon = heading;
            onPointerDownLat = pitch;
            self.onDragStart(heading, pitch);
        }
        var onDragging = function(event){
            if ( isUserInteracting === true ) {
                var touch = event.touches[0];
                var dh = ( onPointerDownPointerX - touch.clientX ) * 0.1;
                var dp = ( touch.clientY - onPointerDownPointerY ) * 0.1;
                heading += dh;
                pitch += dp;
	               
                onPointerDownPointerX = touch.clientX;
                onPointerDownPointerY = touch.clientY;
               
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
            if ( event.wheelDeltaY ) {
                camera.fov -= event.wheelDeltaY * 0.05;
            // Opera / Explorer 9
            } else if ( event.wheelDelta ) {
                camera.fov -= event.wheelDelta * 0.05;
            // Firefox
            } else if ( event.detail ) {
                camera.fov += event.detail * 1.0;
            }
            camera.updateProjectionMatrix();
        }
        eventLayer.addEventListener( 'touchstart', onDragStart, false );
        eventLayer.addEventListener( 'touchmove', onDragging, false );
        eventLayer.addEventListener( 'touchend', onDragEnd, false );
        //eventLayer.addEventListener( 'mousewheel', onMouseWheel, false );
        //eventLayer.addEventListener( 'DOMMouseScroll', onMouseWheel, false);

        this.enable = function(){
            if(isEnable) {
                return;
            }
            isEnable = true;
            eventLayer.addEventListener( 'touchstart', onDragStart, false );
            eventLayer.addEventListener( 'touchmove', onDragging, false );
            eventLayer.addEventListener( 'touchend', onDragEnd, false );
            //eventLayer.addEventListener( 'mousewheel', onMouseWheel, false );
            //eventLayer.addEventListener( 'DOMMouseScroll', onMouseWheel, false);
        }

        this.disable = function(){
            if(!isEnable){
                return;
            }
            eventLayer.removeEventListener( 'mousedown', onDragStart, false );
            eventLayer.removeEventListener( 'mousemove', onDragging, false );
            eventLayer.removeEventListener( 'mouseup', onDragEnd, false );
            eventLayer.removeEventListener( 'mousewheel', onMouseWheel, false );
            eventLayer.removeEventListener( 'DOMMouseScroll', onMouseWheel, false);    
            isEnable = false;
        }
        // override
        this.onDragging = function(){};
        this.onDragStart = function(){};
        this.onDragEnd = function(){};
        this.onPovChanged = function(){};
	}

	return isMobile ? TouchController : DragController;
});
