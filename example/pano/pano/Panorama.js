define(function(require){
    var TileLayer = require('./layers/TileLayer');
    var EventLayer = require('./layers/EventLayer');
    var CanvasLayer = require('./layers/CanvasLayer');
    var MouseTracker = require('./components/MouseTracker');
    var PanoData = require('./PanoData');

    var util = Four.util;

    var TRACKER_MIN_DISTANCE = 3;
    var TRACKER_MAX_DISTANCE = 50;


    var createViewer = function(container, dragController){
        var view = document.createElement('div');
        view.style.cssText = 'border:1px solid red;position:absolute;padding:10px;left:0;top:0;z-index:999;color:white;background-color:rgba(0,0,0,0.8)';
        container.appendChild(view);
        return view;
    }

    var Panorama = function(container, options){
        var debugView = createViewer(container);

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

        var panoData = this.panoData = new PanoData();
        var tileLayer = this.tileLayer = new TileLayer(container, fov);
        var canvasLayer = this.CanvasLayer = new CanvasLayer(container);
        var eventLayer = this.eventLayer = new EventLayer(container);


        //updateView
        var updateLookAt = function(){
            pitch = Math.max( minPitch, Math.min( maxPitch, pitch ) );
            heading = heading % 360;
            tileLayer.setPov(heading, pitch);
            debugView.innerHTML = 'heading:' + heading + ' ,pitch:' + pitch;
        }

        //mouseevent
        eventLayer.onDragStart = function(){
            clearInterval(doDragInertia);
            heading_stack.clear();
            pitch_stack.clear();
        };
        eventLayer.onDragging = function(dh, dp){
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

        //探面
        var tracker = new MouseTracker(0.4, 60);
        tracker.hide();
        tileLayer.add3DOverlay(tracker);

        eventLayer.onMoving = function(x, y){
            var vec3 = tileLayer.getVec3dFromScreenPixel(x, y);
            var k = -1 / vec3[1];
            var realX = vec3[0] * k;
            var realZ = vec3[2] * k;
            var distance = Math.sqrt(Math.pow(realX, 2) + Math.pow(realZ, 2));
            if(vec3[1] > 0 || distance > TRACKER_MAX_DISTANCE || distance < TRACKER_MIN_DISTANCE){
                //移动到Y正半轴或者超出min/max限定，则不再处理和显示
                tracker.hide();
                return;
            }

            var walkDistance = distance * 3;
            tracker.setCenter(realX, -1, realZ);
            tracker.show();
            //鼠标位置和球模型x轴正方向的夹角
            var x = vec3[0], z = vec3[2];
            var rad = Math.atan(Math.abs(z) / Math.abs(x));
            var ang = rad * (180 / Math.PI);
            //四个象限的atan对应的角度
            if(x > 0){
                if(z > 0){
                    //1
                    ang = ang;
                }else{
                    //4
                    ang = 360 - ang;
                }
            }else{
                if(z > 0){
                    //2
                    ang = 180 - ang;
                }else{
                    //3
                    ang += 180;
                }
            }
            //鼠标位置与正北方向夹角
            var angFromNorth = ang - panoData.get('northDir');
            angFromNorth = angFromNorth < 0 ? 360 + angFromNorth : angFromNorth;

            console.log(angFromNorth, walkDistance);
        };
        //resize
        eventLayer.onResize = function(width, height){
            tileLayer.emit('resize', [width, height]);
            canvasLayer.emit('resize', [width, height]);
        }

        //events
        tileLayer.on('thumb_loaded', function(){
        })
        panoData.on('sdata_loaded', function(sdata){
            //指向车头方向
            heading = sdata.heading + sdata.northDir;
            pitch = sdata.pitch;
            tileLayer.setSid(sdata.id);
            updateLookAt();
        });

        //interface
        pp.setPov = function(new_heading, new_pitch){
            if(new_heading || new_heading === 0){
                heading = new_heading - panoData.get('northDir');
            }
            if(new_pitch || new_pitch === 0){
                pitch = new_pitch;
            }
            updateLookAt();
        }
        pp.getPov = function(){
            return {
                'heading':heading,
                'pitch':pitch
            };
        }

        //init
        this.setSid(sid);
    }
    var pp = Panorama.prototype;

    pp.setSid = function(sid){
        var self = this;
        this.panoData.fetch(sid);
    }

    return Panorama;
})
