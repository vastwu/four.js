define(function(require){
    var EVENTS, getPagePosition;
    var isMobile = navigator.userAgent.toLowerCase().match(/iphone|android/);
    if(isMobile){
        EVENTS = {
            'dragStart':'touchstart', 
            'dragging':'touchmove', 
            'dragEnd': 'touchend'
        };
        getPagePosition = function(e){
            var evt = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0]; 
            return {
                x:evt.pageX,
                y:evt.pageY
            };
        } 
    }else{
        EVENTS = {
            'dragStart':'mousedown', 
            'dragging':'mousemove', 
            'dragEnd': 'mouseup'
        };
        getPagePosition = function(e){
            return {
                x: e.pageX,
                y: e.pageY
            }
        };
    }

    var util = {
        isMobile:isMobile ? true : false,
        normalize2: function(x, y){
            var out = {};
            var len = x * x + y * y;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                out.x = x * len;
                out.y = y * len;
            }
            return out;
        },
        normalize3: function(x, y, z){
            var out = {};
            var len = x * x + y * y + z * z;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                out.x = x * len;
                out.y = y * len;
                out.z = z * len;
            }
            return out;
        },
        DataStack:function(size){
            var max = size;
            var arr = [];
            this.add = function(v){
                if(arr.length >= max){
                    arr.shift();
                }
                arr.push(v);
            }
            this.getAverage = function(){
                var l = arr.length;
                if(l == 0){
                    return 0; 
                }
                var sum = arr.reduce(function(sum, value){
                    return sum + value;
                })
                return sum / l;
            }
            this.clear = function(){
                arr = [];
            }
        },
        merge:function(){
            var result = {}, a, k;
            for(var i = 0, n = arguments.length; i < n; i++){
                a = arguments[i];
                if(a){
                    for(k in a){
                        result[k] = a[k]; 
                    } 
                }
            } 
            return result;
        },
        $on: function(dom, evt, handler){
            var _handler = function(e){
                hander.call(dom, handler, e, getPagePosition(e)); 
            }
            dom.addEventListener(EVENTS[evt] ? EVENTS[evt] : evt, hander, false);
            return _handler;
        },
        $off: function(dom, evt, handler){
            dom.removeEvent(EVENTS[evt] ? EVENTS[evt] : evt, hander, false);
        }
    };
    var ANG_TO_RAD = Math.PI / 180;
    util.ang2rad = function(ang){
        return ANG_TO_RAD * ang;
    }
    util.rad2ang = function(rad){
        return rad / ANG_TO_RAD;
    }

    return util;
})
