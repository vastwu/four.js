define(function(require){
    var Service = require('./Service');
    var Emiter = require('./Emiter');
    var util = require('./util');

    var eachRoadsPano = function(sdata, handler){
        //return true if want to break
        sdata.roads.some(function(road, roadIndex){
            return road.panos.some(function(pano, panoIndex){
                return handler(pano, panoIndex, road, roadIndex);
            })
        });
    }
    var fixer = {
        'sdata':function(sdata){
            var fixed = {
                'admission':'',
                'date':'',
                'deviceHeight':'',
                'enters':[]
            };
            fixed = util.copy(sdata, true);
            //单位转换为米,原始数据为厘米
            fixed.x /= 100;
            fixed.y /= 100;
            fixed.rx /= 100;
            fixed.ry /= 100;
            var x = fixed.x;
            var y = fixed.y;
            /*
            eachRoadsPano(fixed, function(pano){
                pano.x /= 100;
                pano.y /= 100;
                pano.dir = pano.dIR;
                //距离当前点得距离
                pano.distance = parseInt(Math.sqrt(Math.pow(pano.x - x, 2) + Math.pow(pano.y - y, 2)), 10);
            });
            */
            return fixed;
        }

    };


    var PanoData = Four.util.extend(Emiter, {
        init:function(sid){
            Emiter.call(this);
            this.sid = sid;
        },
        panoDataLoaded:function(data){
            if(data && data[0]){
                this.sdata = fixer.sdata(data[0]);
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
            Service.getSData(this.sid).then(function(data){
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
