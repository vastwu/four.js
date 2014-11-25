define(function(require){
    var Layer = require('./Layer');

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
            }
            this.on('resize', onResize);
            onResize();

            var renderList = this.renderList = [];

            var redraw = this.redraw = function(){
                context.clearRect(0, 0, viewWidth, viewHeight);
                renderList.forEach(function(obj){
                    context.save(); 
                    obj.draw(context); 
                    context.restore();
                })
            }
            /*
            canvas.addEventListener('mousemove', function(e){
                tracker.centerX = e.pageX;
                tracker.centerY = e.pageY;
                redraw();
            });
            */
            //this.redraw();

            this.add = function(obj){
                if(typeof obj.draw === 'function'){
                    renderList.push(obj);    
                } 
            }
            this.remove = function(obj){
                for(var i = 0, n = renderList.length; i < n; i++){
                    if(obj === renderList[i]){
                        renderList.splice(i, 1);
                        return obj;
                    }
                } 
                return null;
            }
        }
    });
    CanvasLayer.CanvasRenderItem = CanvasRenderItem;
    return CanvasLayer;
});
