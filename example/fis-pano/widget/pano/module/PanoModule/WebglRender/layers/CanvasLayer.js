    var Layer = require('common:widget/pano/module/PanoModule/WebglRender/layers/Layer.js');

    var util = Four.util;
	var ANG_TO_RAD = Math.PI / 180;

    var EVENTS, getPagePosition;
    if(util.isMobile){
        EVENTS = {'start':'touchstart', 'moving':'touchmove', 'end': 'touchend'};
        getPagePosition = function(e){
            var evt = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
            return {
                x:evt.pageX,
                y:evt.pageY
            };
        }
    }else{
        EVENTS = {'start':'mousedown', 'moving':'mousemove', 'end': 'mouseup'};
        getPagePosition = function(e){
            return {
                x: e.pageX,
                y: e.pageY
            }
        };
    }
    var CanvasRenderItem = function(){
        this.draw = function(){};
    }
    var cp = CanvasRenderItem.prototype;

    var CanvasLayer = Four.util.extend(Layer, {
        init: function(container, options){
            Layer.call(this, container, 2);

            var viewWidth, viewHeight;

            var self = this;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            this.content.appendChild(canvas);

            var onResize = function(width, height){
                viewWidth = width || container.clientWidth;
                viewHeight = height || container.clientHeight;
                canvas.width = viewWidth;
                canvas.height = viewHeight;
                self.redraw();
            }
            this.on('resize', onResize);

            var drawDelay = 0;
            var renderList = this.renderList = [];

            var pointerX, pointerY;

            var draw = function(){
                context.clearRect(0, 0, viewWidth, viewHeight);
                renderList.forEach(function(obj){
                    context.save();
                    obj.draw(context, viewWidth, viewHeight, pointerX, pointerY);
                    context.restore();
                });
            }
            var redraw = function(){
                if(drawDelay){
                    cancelAnimationFrame(drawDelay);
                }
                drawDelay = requestAnimationFrame(draw);
            }
            this.redraw = redraw;
            this.updatePointerPosition = function(screenX, screenY){
                pointerX = screenX;
                pointerY = screenY;
            }
            this.add = function(obj){
                if(typeof obj.draw === 'function'){
                    renderList.push(obj);
                }
            }
            this.remove = function(obj){
                var i = renderList.indexOf(obj);
                if(i !== -1) {
                    renderList.splice(i, 1);
                    return obj;
                }
                return null;
            }
            this.clear = function(){
                context.clearRect(0, 0, viewWidth, viewHeight);
            }
            //阻止后续的一切redraw行为，直至resume
            this.stop = function(){
                this.clear();
                if(drawDelay){
                    cancelAnimationFrame(drawDelay);
                }
                this.redraw = function(){};
            }
            //回复手动redraw
            this.resume = function(){
                this.redraw = redraw;
                this.redraw();
            }
            /*
            setInterval(function(){
                redraw();
            }, 32);
            */
            onResize();
        }
    });
    CanvasLayer.CanvasRenderItem = CanvasRenderItem;
    return CanvasLayer;
