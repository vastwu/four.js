define(function(){

    var util_extends = {
        'doNothing':function(){},
        'animation':function(duration, timingFunction, renderer, fps){
            var start = Date.now(), dt, progress;
            var nextTick = requestAnimationFrame;
            if(fps !== undefined){
                var each = 1000 / fps;
                nextTick = function(handler){
                    setTimeout(function(){
                        renderer();
                    }, each);
                };
            }
            var animHandler = function(){
                dt = Date.now() - start;
                progress = timingFunction(dt / duration);
                if(dt < duration){
                    nextTick(animHandler);
                }else{
                    progress = 1;
                }
                renderer(progress);
            };
            nextTick(animHandler);
        },
        'toHumpCase':(function(){
            var cache = {};
            return function(str){
                if(cache[str]){
                    return cache[str];
                }
                var newName = str.length === 2 ? str.toLowerCase() : str.substr(0,1).toLowerCase() + str.substr(1);
                cache[str] = newName;
                return newName;
            }
        })(),
        'isArray':function(a){
            return Array.isArray(a);
        },
        'isObject':function(a){
            var tp = typeof a;
            return tp === 'function' || tp === 'object' && a !== null;
        },
        'copy':function(obj, toHumpCase){
            if(util.isArray(obj)){
                return obj.map(function(v){
                    return util.copy(v, toHumpCase);
                }, true)
            }else if(util.isObject(obj)){
                var r = {};
                var nk;
                for(var k in obj){
                    nk = toHumpCase ? util.toHumpCase(k) : k;
                    r[nk] = util.copy(obj[k], toHumpCase);
                }
                return r;
            }else{
                return obj;
            }
        },
        /**
         *
         * @params a 对边
         * @params b 临边
         * @return {angle}
         */
        'getAngFromAB':function(a, b){
            var rad = Math.atan(Math.abs(a) / Math.abs(b));
            var ang = this.rad2ang(rad);// rad * (180 / Math.PI);
            if(b > 0){
                if(a > 0){
                    //1
                    ang = ang;
                }else{
                    //4
                    ang = 360 - ang;
                }
            }else{
                if(a > 0){
                    //2
                    ang = 180 - ang;
                }else{
                    //3
                    ang += 180;
                }
            }
            return ang;
        }
    };

    var util = Four.util.merge(Four.util, util_extends);

    return util;
});
