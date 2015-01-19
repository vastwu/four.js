    var TileLayer = require('common:widget/pano/module/PanoModule/WebglRender/layers/TileLayer.js');
    var EventLayer = require('common:widget/pano/module/PanoModule/WebglRender/layers/EventLayer.js');
    var DomLayer = require('common:widget/pano/module/PanoModule/WebglRender/layers/DomLayer.js');
    var CanvasLayer = require('common:widget/pano/module/PanoModule/WebglRender/layers/CanvasLayer.js');
    var MouseTracker = require('common:widget/pano/module/PanoModule/WebglRender/components/MouseTracker.js');
    var PanoModel = require('common:widget/pano/module/PanoModule/WebglRender/models/PanoModel.js');
    var Service = require('common:widget/pano/module/PanoModule/WebglRender/Service.js');
    var Emiter = require('common:widget/pano/module/PanoModule/WebglRender/Emiter.js');
    var util = require('common:widget/pano/module/PanoModule/WebglRender/util.js');
    var config = require('common:widget/pano/module/PanoModule/WebglRender/config.js');
    var ArrowManager = require('common:widget/pano/module/PanoModule/WebglRender/ArrowManager.js');
    var DomOverlay = require('common:widget/pano/module/PanoModule/WebglRender/components/DomOverlay.js');


    var TRACKER_MIN_DISTANCE = config.TRACKER_MIN_DISTANCE;
    var TRACKER_MAX_DISTANCE = config.TRACKER_MAX_DISTANCE;
    var ARROW_AUTOHIDDEN_DELAY = config.ARROW_AUTOHIDDEN_DELAY;

    /**
     *
     * @events: pov_changed, sdata_loaded, thumb_loaded, before_pano_changed, after_pano_changed
     *
     * @return {instance}
     */
    var Panorama = util.extend(Emiter, {
        'init':function(container, options){
            var panoContainer = document.createElement('div');
            panoContainer.style.cssText = [
                'overflow:hidden',
                'width:100%',
                'height:100%',
                'position:relative'
            ].join(';');
            container.appendChild(panoContainer);

            options = util.merge({
                'heading':0,
                'pitch':0,
                'zoom':3,
                'fov':65,
                'maxPitch':80,
                'minPitch':-20,
                'headingDragSpeed':0.07,
                'pitchDragSpeed':0.07
            }, options);

            //应用层保存的heading = 0始终表示正北，所有与偏北角的转化只传递到tileLayer
            var heading = options.heading;
            var pitch = options.pitch;
            var zoom = options.zoom;
            var sid = options.sid;
            var fov = options.fov;
            var maxPitch = options.maxPitch;
            var minPitch = options.minPitch;
            var headingDragSpeed = options.headingDragSpeed;
            var pitchDragSpeed = options.pitchDragSpeed;
            var doDragInertia = 0;
            var doZoomInertia = 0;
            var self = this;

            var heading_stack = new util.DataStack(10);
            var pitch_stack = new util.DataStack(10);

            var panoModel = this.panoModel = new PanoModel();
            var tileLayer = this.tileLayer = new TileLayer(panoContainer, fov);
            var canvasLayer = this.CanvasLayer = new CanvasLayer(panoContainer);
            var eventLayer = this.eventLayer = new EventLayer(panoContainer);
            var domLayer = this.domLayer = new DomLayer(panoContainer);
            //TODO 强耦合，需要更合理的结构
            domLayer.bind(tileLayer.getCamera(), panoModel);
            var arrowManager = this.arrowManager = new ArrowManager(canvasLayer);
            var isAnimation = false;

            arrowManager.on('mouseIn', function(arrow){
                eventLayer.setCursor('pointer');
            });
            arrowManager.on('mouseOut', function(arrow){
                eventLayer.setCursor('default');
            });
            arrowManager.on('click', function(arrow, pid, dir){
                eventLayer.setCursor('default');
                self.setPanoId(pid, dir);
            });

            //updateView
            var updateLookAt = function(){
                pitch = Math.max( minPitch, Math.min( maxPitch, pitch ) );

                heading = heading % 360;
                if(heading < 0){
                    //0 ~ 360
                    heading = 360 + heading;
                }
                //传递给模型的heading需要做指北角修正
                //保留两位小数，降低精度, 防止偏北角计算中的极小误差导致画面抖动
                var geometryHeading = heading.toFixed(2) * 1;

                canvasLayer.redraw();
                tileLayer.setPov(geometryHeading, pitch);
                //domLayer直接根据bind camera更新所以无需传入heading/pitch，
                //且必须在tileLayer.setPov之后更新
                domLayer.sync();
                arrowManager.sync(heading, pitch);
                self.emit('pov_changed', [heading,  pitch]);
            }
            var updateArrows = function(){
                eventLayer.setCursor('default');
                arrowManager.clear();
                var northDir = panoModel.get('northDir');
                var topologies = panoModel.get('topologies');
                //console.log(topologies);
                topologies.forEach(function(topology){
                    arrowManager.add(topology.pid, topology.dir);
                });
                arrowManager.sync(heading, pitch);
            }

            //mouseevent
            eventLayer.onDragStart = function(){
                clearInterval(doDragInertia);
                heading_stack.clear();
                pitch_stack.clear();
            };
            eventLayer.onDragging = function(dh, dp){
                if(isAnimation){
                    return;
                }
                heading_stack.add(dh);
                pitch_stack.add(dp);
                heading += dh * headingDragSpeed;
                pitch += dp * pitchDragSpeed;
                updateLookAt();
            };
            eventLayer.onDragEnd = function(){
                //惯性
                var h = heading_stack.getAverage();
                var p = pitch_stack.getAverage();
                if(Math.abs(p) > 0.01 || Math.abs(h) > 0.01){
                    doDragInertia = setInterval(function(){
                        h *= 0.8;
                        p *= 0.8;
                        var next = false;
                        if(Math.abs(h) > 0.01){
                            heading += h;
                            next = true;
                        }
                        if(Math.abs(p) > 0.01){
                            pitch += p;
                            next = true;
                        }
                        if(next === false){
                            clearInterval(doDragInertia);
                        }else{
                            updateLookAt();
                        }
                    }, 16);
                }
            };
            eventLayer.onMouseWheel = function(detail){
                clearInterval(doZoomInertia);
                var _fov;
                var zoomTarget = zoom;
                if(detail > 0){
                    zoomTarget = zoom + 1;
                }else if(detail < 0){
                    zoomTarget = zoom - 1;
                }
                zoomTarget = Math.max(3, zoomTarget);
                zoomTarget = Math.min(5, zoomTarget);
                var dz = (zoomTarget - zoom) / 10;
                if(dz === 0){
                    return;
                }
                doZoomInertia = setInterval(function(){
                    zoom += dz;
                    if((dz > 0 && zoom >= zoomTarget) || (dz < 0 && zoom <= zoomTarget)){
                        clearInterval(doZoomInertia);
                        zoom = zoomTarget;
                    }
                    _fov = fov - (zoom - 3) * 20;
                    tileLayer.setFov(_fov);
                }, 16);
            }

            //鼠标跟踪探面
            var tracker = new MouseTracker(0.4, 60, canvasLayer, tileLayer);
            tracker.hide();
            tileLayer.add3DOverlay(tracker);
            canvasLayer.add(tracker.text);
            canvasLayer.redraw();

            var getDistanceAndAngleFromScreenPosition = function(x, y){
                if(isAnimation){
                    return false;
                }
                var vec3 = tileLayer.getVec3dFromScreenPixel(x, y);
                var k = -1 / vec3[1];
                var realX = vec3[0] * k;
                var realZ = vec3[2] * k;
                var distance = Math.sqrt(Math.pow(realX, 2) + Math.pow(realZ, 2));
                if(vec3[1] > 0 || distance > TRACKER_MAX_DISTANCE || distance < TRACKER_MIN_DISTANCE || arrowManager.activityArrow !== null){
                    //有某个激活的arrow箭头
                    //移动到Y正半轴或者超出min/max限定
                    //则不再处理和显示
                    return false;
                }
                var x = vec3[0];
                var z = vec3[2];
                //鼠标位置和球模型x轴正方向的夹角
                var ang = util.getAngFromAB(z, x);
                //鼠标位置与正北方向夹角
                //球模型已经修正为-z始终面对正北，+x -> -z的偏向角为+90
                var angFromNorth = ang + 90 //+ panoModel.get('northDir');
                angFromNorth = (angFromNorth < 0 ? 360 + angFromNorth : angFromNorth) % 360;

                var roadInfo = panoModel.dirOnRoad(angFromNorth)
                if(!roadInfo){
                    tracker.hide();
                    canvasLayer.redraw();
                    return false;
                }
                return {
                    'roadId':roadInfo.roadId,
                    'roadDir':roadInfo.roadDir,
                    'x':realX,
                    'z':realZ,
                    'distance':distance,
                    'angle':angFromNorth
                }
            }

            eventLayer.onMoving = function(x, y){
                var mouseData = getDistanceAndAngleFromScreenPosition(x, y);
                //通知canvas更新坐标
                canvasLayer.updatePointerPosition(x, y);
                if(mouseData === false){
                    tracker.hide();
                    canvasLayer.redraw();
                    return;
                }
                var walkDistance = mouseData.distance * 3;
                tracker.setCenter(mouseData.x, -1, mouseData.z);
                tracker.setScreenPosition(x, y);
                tracker.setText('前进' + parseInt(walkDistance, 10) + '米');
                tracker.show();
                canvasLayer.redraw();

                console.log('roadDir:', mouseData.roadDir);
            };

            eventLayer.onClick = function(e, x, y){
                if(isAnimation){
                    return;
                }
                if(tracker.isVisible()){
                    var mouseData = getDistanceAndAngleFromScreenPosition(x, y);
                    if(mouseData === false){
                        return;
                    }
                    self.emit('before_pano_changed');
                    var walkDistance = mouseData.distance * 3;

                    var dx = walkDistance * Math.sin(util.ang2rad(mouseData.angle));
                    var dy = walkDistance * Math.cos(util.ang2rad(mouseData.angle));

                    var targetX = panoModel.get('x') + dx;
                    var targetY = panoModel.get('y') + dy;
                    var currentNorthDir = panoModel.get('northDir');
                    var moveDir = mouseData.roadDir.toFixed(2) * 1;

                    //寻找目标点附近的全景
                    Service.matchStreetviewByLocation(targetX, targetY, mouseData.roadId).then(function(data){
                        if(data.id === panoModel.get('id')){
                            //change failed
                            self.emit('after_pano_changed');
                            return;
                        }
                        self.setPanoId(data.id);
                    });

                    //console.log('%d方向, 前进%d米', parseInt(mouseData.angle), parseInt(walkDistance));
                }else if(arrowManager.activityArrow){
                    self.emit('before_pano_changed');
                    arrowManager.activityArrow.onClick();
                }
            }
            //resize
            eventLayer.onResize = function(width, height){
                tileLayer.emit('resize', [width, height]);
                canvasLayer.emit('resize', [width, height]);
                domLayer.emit('resize', [width, height]);
            }
            //events
            panoModel.on('sdata_loaded', function(){
                //add all markers again when sdata_loaded
                while(waitingCoordDomMarkers.length){
                    self.addDomMarker.call(self, waitingCoordDomMarkers.shift());
                }
                self.emit('sdata_loaded');
            });
            //直接进入的全景会通过 thumb_loaded方式抛出切换结束
            //点对点的移动通过animation_finish抛出切换结束
            tileLayer.on('thumb_loaded', function(){
                updateArrows()
                updateLookAt();
                self.emit('thumb_loaded');
                self.emit('after_pano_changed');
            })
            tileLayer.on('animation_finish', function(){
                updateArrows();
                updateLookAt();
                self.emit('after_pano_changed');
            });
            this.on('before_pano_changed', function(){
                //防止重复触发,在动画过程中再次触发无效
                if(isAnimation === true){
                    return;
                }
                //景切换前隐藏井盖
                isAnimation = true;
                canvasLayer.stop();
                domLayer.hide();
                tracker.hide();
            });
            this.on('after_pano_changed', function(){
                if(isAnimation === false){
                    return;
                }
                //全景切换完成后恢复绘制
                isAnimation = false;
                canvasLayer.resume();
                domLayer.show();
                domLayer.updateCoordMarkers();
            });
            //interface
            this.setPov = function(new_heading, new_pitch){
                if(new_heading || new_heading === 0){
                    heading = new_heading;
                }
                if(new_pitch || new_pitch === 0){
                    pitch = new_pitch;
                }
                if(panoModel.isReady()){
                    updateLookAt();
                }
            }
            this.getPov = function(){
                return {
                    'heading':heading,
                    'pitch':pitch
                };
            }
            /**
             * 添加一个元素标记物
             *
             * @param elem dom 元素
             * @param x 莫卡托坐标 单位米
             * @param y 莫卡托坐标 单位米
             * @return {undefined}
             */
            var waitingCoordDomMarkers = [];
            this.addDomMarker = function(elem, x, y, options){
                var marker = elem instanceof DomOverlay ? elem : new DomOverlay(elem, x, y, options);
                if(marker.isCoordPosition()){
                    if(panoModel.isReady()){
                        domLayer.append(marker);
                    }else{
                        waitingCoordDomMarkers.push(marker);
                    }
                }else{
                    domLayer.append(marker);
                }
                return marker;
            };
            this.removeDomMarker = function(marker){
                domLayer.remove(marker);
            };

            /**
             * 切换场景点
             * @params sid 场景点id
             * @params faceToDir 前进动画中调整的heading角度
             * @return {undefined}
             */
            this.setPanoId = function(sid, faceToHeading, faceToPitch){
                var currentPanoId = panoModel.get('id');
                if(currentPanoId === sid){
                    //same id
                    return;
                }
                this.emit('before_pano_changed');
                if(currentPanoId === undefined){
                    //first enter
                    panoModel.fetch(sid).then(function(){
                        tileLayer.updateGeomery(panoModel.get('id'), panoModel.get('northDir'));
                    });
                }else{
                    //point to point
                    //当前点的信息，在fetch之后会丢失，此处要先保存下来
                    var currentNorthDir = panoModel.get('northDir');
                    var currentPanoX = panoModel.get('x');
                    var currentPanoY = panoModel.get('y');

                    panoModel.fetch(sid).then(function(){
                        var dx = panoModel.get('x') - currentPanoX;
                        var dy = panoModel.get('y') - currentPanoY;
                        //地理坐标偏向角, 由北偏
                        var dAng = util.getAngFromAB(dx, dy);
                        var moveDir = dAng.toFixed(2) * 1;
                        var nextNorthDir = panoModel.get('northDir');
                        if(faceToHeading === undefined){
                            tileLayer.updateGeomery(sid, nextNorthDir, moveDir, currentNorthDir);
                            return;
                        }
                        //TODO faceToPitch
                        var currentHeading = heading;
                        var dAng = (faceToHeading - currentHeading) % 360;
                        if(dAng > 180){
                            dAng = 360 - dAng;
                        }else if(dAng < -180){
                            dAng = 360 + dAng;
                        }
                        tileLayer.updateGeomery(sid, nextNorthDir, moveDir, currentNorthDir, function(progress){
                            self.setPov(currentHeading + dAng * progress);
                            console.debug('animation:', heading);
                        });
                    });
                }
            };
            //init
            sid && this.setPanoId(sid);
        }
    });

    return Panorama;
