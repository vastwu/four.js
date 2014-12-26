define(function(require){
    var config = require('./config');

    var PANO_URL = config.PANO_URL;

    var jsonp = (function(){
        var body = document.body;
        var n = 0;
        var callbacks = window.CB = {};
        return function(src, callback){
            return new Promise(function(resolve, reject){
                var script = document.createElement('script');
                var cbid = '$cb_' + (++n);
                callbacks[cbid] = function(json){
                    body.removeChild(script);
                    delete callbacks[cbid];
                    cbid = null;
                    if(json && json.result && json.result.error === 0){
                        resolve(json.content);
                    }else{
                        reject();
                    }
                };
                src += '&fn=window.CB.' + cbid;
                body.appendChild(script);
                script.src = src;
            });
        }
    })();



    /*
     * all interface must return Promise or Promise like
     *
     * */
    var Service = {
        getSData: function(sid){
            var url = PANO_URL + '?qt=scb&pc=1&sid=' + sid;
            return jsonp(url);
        }
    };


    return Service;
});
