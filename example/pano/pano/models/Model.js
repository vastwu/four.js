define(function(require){
    var Emiter = require('pano/Emiter');

    var dataCache = {};

    var createMid = (function(){
        var n = 0;
        return function(){
            return '$m' + (n++);
        }
    })();

    var Model = Four.util.extend(Emiter, {
        init:function(){
            Emiter.call(this);
            this._mid = createMid();
            this._fetchPromise = null;
            this._isReady = false;
            dataCache[this._mid] = {};
        },
        def:function(k){
            var data = dataCache[this._mid];
            if(Array.isArray(k)){
                k.forEach(function(name){
                    data[name] = '';
                });
            }else{
                data[k] = '';
            }
        },
        set:function(k, v){
            var data = dataCache[this._mid];
            if(k in data){
                data[k] = v;
            }else{
                throw new Error('undefined variable name');
            }
        },
        get:function(k){
            return dataCache[this._mid][k];
        },
        /**
         * fetch
         * @override
         */
        fetch:function(){

        },
        /**
         * dataLoaded
         * @override
         */
        dataLoaded:function(){

        },
        destory:function(){
            Emiter.prototype.destory.call(this);
            delete dataCache[this._mid];
            this._mid = null;
        }
    });
    return Model;
})
