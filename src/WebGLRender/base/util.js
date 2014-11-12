define(function(require){
    var util = {
        isMobile:(function(){
            var isMobile = navigator.userAgent.toLowerCase().match(/iphone|android/);
            return isMobile ? true : false;
        })(),
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
        }
    }

    return util;
})
