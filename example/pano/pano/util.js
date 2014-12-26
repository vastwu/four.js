define(function(){



    var util = {
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
        }
    }

    return util;
});
