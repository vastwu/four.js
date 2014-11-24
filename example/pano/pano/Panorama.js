define(function(require){
    var TileLayer = require('./TileLayer');
    var EventLayer = require('./EventLayer');

    var util = Four.util;

    var createViewer = function(container, dragController){
        var view = document.createElement('div');
        view.style.cssText = 'border:1px solid red;position:absolute;padding:10px;left:0;top:0;z-index:999;color:white;background-color:rgba(0,0,0,0.8)';
        container.appendChild(view);
        return view;
    }

    var Panorama = function(container, options){

        options = util.merge({
            'heading':0,
            'pitch':0,
            'zoom':3,
            'fov':65,
            'maxPitch':80,
            'minPitch':-20,
            'headingDragSpeed':0.1,
            'pitchDragSpeed':0.1
        }, options); 

        var heading = options.heading;
        var pitch = options.pitch;
        var zoom = options.zoom;
        var svid = options.svid;
        var fov = options.fov;
        var maxPitch = options.maxPitch;
        var minPitch = options.minPitch;
        var headingDragSpeed = options.headingDragSpeed;
        var pitchDragSpeed = options.pitchDragSpeed;
        var doDragInertia = 0;
        var doZoomInertia = 0;

        var heading_stack = new util.DataStack(5);
        var pitch_stack = new util.DataStack(5);

        var tileLayer = this.tileLayer = new TileLayer(container, fov);
        var eventLayer = this.eventLayer = new EventLayer(container);

        var updateLookAt = function(){
            pitch = Math.max( minPitch, Math.min( maxPitch, pitch ) );
            heading = heading % 360;
            tileLayer.setPov(heading, pitch);
        }
        this.eventLayer.onDragStart = function(){
            clearInterval(doDragInertia);
            heading_stack.clear();
            pitch_stack.clear();
        };
        this.eventLayer.onDragging = function(dh, dp){
            heading_stack.add(dh);
            pitch_stack.add(dp);
            heading += dh * headingDragSpeed;
            pitch += dp * pitchDragSpeed;
            updateLookAt();
        };
        this.eventLayer.onDragEnd = function(){
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
        this.eventLayer.onMouseWheel = function(detail){
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
                console.log(zoom);
                _fov = fov - (zoom - 3) * 20;
                tileLayer.setFov(_fov);
            }, 16);
        }
        
        tileLayer.setSvid(svid);
        tileLayer.setPov(0, 0);
    }
    var pp = Panorama.prototype;

    pp.setSid = function(sid){

    }

    return Panorama;
})
