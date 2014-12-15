define(function(require){
    var Emiter = require('./Emiter');
    var util = require('./util');
    var config = require('./config');

    var PANO_URL = config.PANO_URL;
    var getSData = function(sid, callback){
        var url = PANO_URL + '?qt=scb&pc=1&sid=' + sid;
        util.jsonp(url, callback);
    }

    var PanoData = Four.util.extend(Emiter, {
        init:function(sid){
            Emiter.call(this);
            this.sid = sid;
        },
        panoDataLoaded:function(data){
            if(data && data.content && data.content[0]){
                this.sdata = util.copy(data.content[0], true);
                this.emit('sdata_loaded', [this.sdata]); 
            }else{
                this.emit('sdata_error');
            }
        },
        fetch:function(sid){
            if(sid){
                this.sid = sid; 
            }
            var self = this;
            getSData(this.sid, function(data){
                self.panoDataLoaded(data);
            });
        },
        get:function(k){
            return this.sdata ? this.sdata[k] : null; 
        },
        dispose:function(){
            Emiter.prototype.destory.call(this); 
            this.sdata = null;
            this.panoDataLoaded = function(){};
        }
    });
    return PanoData;
});
