define(function(require){
    var Service = require('pano/Service');
    var Model = require('pano/models/Model');
    var util = require('pano/util');

    var fixer = {
        'sdata':function(sdata){
            var setValues = {
                'admission':sdata.Admission,
                //单位转换为米,原始数据为厘米
                'x':sdata.X / 100,
                'y':sdata.Y / 100,
                'rx':sdata.RX / 100,
                'ry':sdata.RY / 100,
                //优先使用heading纠正偏北角，northDir为旧数据，此处提供一个换算关系
                //数据中的northDir / heading 实际为偏东角
                'northDir':(sdata.Heading ? (sdata.Heading + 90) : (270 - sdata.NorthDir + 90)) % 360,
                'moveDir':sdata.MoveDir,
                'type':sdata.Type,
                'date':sdata.Date,
                'deviceHeight':sdata.DeviceHeight,
                'heading':sdata.Heading,
                'pitch':sdata.Pitch,
                'mode':sdata.Mode,
                'roadName':sdata.RName,
            };
            if(sdata.Enters){
                setValues.enters = sdata.Enters.map(function(enter){
                    return enter;
                });
            }else{
                setValues.enters = [];
            }
            setValues.topologies = [];
            setValues.roads = sdata.Roads.map(function(road){
                var link = sdata.Links.filter(function(link){
                    return road.ID === link.RID;
                });
                link = link[0];
                var r = {
                    'roadName':road.Name,
                    'rid':road.ID,
                    'isCurrent':!!road.IsCurrent,
                    'width':road.Width,
                    'dir':link ? link.DIR : sdata.MoveDir
                };
                if(road.IsCurrent){
                    var currentPid = sdata.ID;
                    //find the order what is current point in the road
                    road.Panos.some(function(p){
                        if(p.PID === currentPid){
                            r.currentOrder = p.Order;
                            return true;
                        }
                    });
                    if('currentOrder' in r && road.Panos.length >= 2){
                        var prevPano = road.Panos[r.currentOrder - 1];
                        var currentPano = road.Panos[r.currentOrder];
                        var nextPano = road.Panos[r.currentOrder + 1];
                        if(r.currentOrder === 0){
                            //当前点是道路起点
                            setValues.topologies.push({
                                'dir':currentPano.DIR,  //notice 这里与别的下面前后都能走得逻辑不同
                                'pid':nextPano.PID,
                                'type':nextPano.Type,
                                'x':nextPano.X / 100,
                                'y':nextPano.Y / 100
                            });
                        }else if(r.currentOrder === road.Panos.length - 1){
                            //是道路终点
                            setValues.topologies.push({
                                'dir':(prevPano.DIR + 180) % 360,
                                'pid':prevPano.PID,
                                'type':prevPano.Type,
                                'x':prevPano.X / 100,
                                'y':prevPano.Y / 100
                            });
                        }else{
                            //在道路中间
                            setValues.topologies.push({
                                'dir':currentPano.DIR,
                                'pid':nextPano.PID,
                                'type':nextPano.Type,
                                'x':nextPano.X / 100,
                                'y':nextPano.Y / 100
                            });
                            setValues.topologies.push({
                                'dir':(prevPano.DIR + 180) % 360,
                                'pid':prevPano.PID,
                                'type':prevPano.Type,
                                'x':prevPano.X / 100,
                                'y':prevPano.Y / 100
                            });
                        }
                    }
                }
                return r;
            });
            sdata.Links.forEach(function(link){
                setValues.topologies.push({
                    'dir':link.DIR,
                    'pid':link.PID,
                    'type':link.Type,
                    'x':link.x / 100,
                    'y':link.y / 100
                });
            });
            for(var key in setValues){
                this.set(key, setValues[key]);
            }
        }
    };


    var PanoModel = Four.util.extend(Model, {
        init:function(sid){
            Model.call(this);
            this.def([
                'admission', 'date', 'deviceHeight',
                'enters', 'roads',
                'heading', 'pitch', 'mode', 'moveDir', 'northDir',
                'rx', 'ry', 'x', 'y', 'roadName', 'type', 'id', 'topologies'
            ]);
            this.set('id', sid);
        },
        dataLoaded:function(data){
            if(data && data[0]){
                fixer.sdata.call(this, data[0]);
                this.emit('sdata_loaded');
            }else{
                this.emit('sdata_error');
            }
        },
        fetch:function(sid){
            if(sid){
                this.set('id', sid);
            }
            var self = this;
            this._isReady = false;
            return Service.getSData(this.get('id')).then(function(data){
                self._isReady = true;
                self.fetchDeferred = null;
                self.dataLoaded(data);
            });
        },
        isReady:function(){
            return this._isReady;
        },
        dispose:function(){
            Model.prototype.destory.call(this);
            this.panoDataLoaded = function(){};
        },
        /* 应用接口 */
        dirOnRoad:function(dir){
            var roads = this.get('roads');
            var topologies = this.get('topologies');
            var tl = topologies.length;
            var roadId = null;
            var roadDir = null;
            if(!roads){
                return null;
            }
            roads.some(function(road){
                var d = Math.abs(dir - road.dir);
                d = d > 180 ? 360 - d : d;
                if(d <= 20){
                    roadId = road.rid;
                    roadDir = road.dir;
                    return true;
                }
                if(road.isCurrent && tl >= 2){
                    //检查当前路段时，如果拓扑有2个，则表示前后均可以走
                    //判断是否在翻转180度之内的范围内
                    d = Math.abs(dir - (road.dir + 180));
                    d = d > 180 ? 360 - d : d;
                    if(d <= 20){
                        roadId = road.rid;
                        roadDir = road.dir + 180;
                        return true;
                    }
                }
            });
            return roadId ? {'roadId':roadId, 'roadDir':roadDir} : null;
        },
        getTopologyPano:function(){
            return this.get('topologies');
        }
    });
    return PanoModel;
});
