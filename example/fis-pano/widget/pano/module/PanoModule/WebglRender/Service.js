    var config = require('common:widget/pano/module/PanoModule/WebglRender/config.js');
    var Deferred = require('common:widget/pano/module/PanoModule/WebglRender/Deferred.js');

    var PANO_URL = config.PANO_URL;

    var jsonp = (function(){
        var body = document.body;
        var n = 0;
        var callbacks = window.CB = {};
        return function(src, callback){
            var df = new Deferred();
            var script = document.createElement('script');
            var cbid = '$cb_' + (++n);
            callbacks[cbid] = function(json){
                body.removeChild(script);
                delete callbacks[cbid];
                cbid = null;
                if(json && json.result && json.result.error === 0){
                    df.resolve(json.content);
                }else{
                    df.reject();
                }
            };
            src += '&fn=window.CB.' + cbid;
            body.appendChild(script);
            script.src = src;
            return df;
        }
    })();

    var jsonToQuery = function(params){
        var s = [];
        for(var k in params){
            s.push(k + '=' + params[k]);
        }
        return s.join('&');
    }

    /*
     * all interface must return Promise or Promise like
     *
     * */
    var Service = {
        getSData: function(sid){
            var url = PANO_URL + '?qt=scb&pc=1&sid=' + sid;
            return jsonp(url);
        },
        matchStreetviewByLocation:function(x, y, rid, level, mode){
            //请求单点匹配服务
            var url = PANO_URL + '?' + jsonToQuery({
                qt: 'qsdata',
                x: x,
                y: y,
                l: level || 15,
                roadid:rid,
                action: 0, //action为0表示只返回街景ID，为1表示街景详情信息
                time: mode || 'day',
                t: new Date().getTime()
            });

            return jsonp(url);

            /*
            baidu.jsonp(url,function(res){
                if( res&&
                    res.result&&
                    res.result.error == 0&&
                    res.content) {
                    var cont=res.content,
                        pid=cont.id,
                        x=parseFloat(cont.x/100),
                        y=parseFloat(cont.y/100),
                        pt=new BMap.Point(x,y);
                    callback({
                        type:'brief',
                        content:{
                            id:pid,
                            point:pt
                        },
                        error:0
                    });
                }else{
                    callback({error:1});
                }
            }, {cbtype: 'fn'});
            */
        }
    };


    return Service;
