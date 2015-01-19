define(function(require){
    var Emiter = require('pano/Emiter');
    var util = require('pano/util');


    var getDomSize = function(elem){
        var display = false;
        var originalDisplay = elem.getAttribute('originalDisplay') || '';
        if(elem.style.display === 'none'){
            display = true;
            elem.style.display = originalDisplay;
        }
        var size = {
            width:elem.offsetWidth,
            height:elem.offsetHeight
        };
        if(display){
            elem.style.display = 'none';
        }
        return size;
    }

    var DomOverlay = util.extend(Emiter, {
        'init':function(elem, x, y, options){
            var markerContainer = document.createElement('div');
            markerContainer.style.cssText = 'absolute:absolute;left:0px;top:0px;';
            markerContainer.appendChild(elem);
            this.container = markerContainer;
            this.elem = elem;
            this.coordX = x;
            this.coordY = y;
            this.x = x;
            this.y = y;
            //width, height用于确定是否在屏幕中，推荐在添加时指定
            //否则每次会读一次clientWidth/clientHeight
            //性能损耗较严重
            this.width = 0;
            this.height = 0;
            this.position3D = [0, 0, 0];
            //标记是否应该显示
            this.isVisible = true;
            //标记是否在视野内
            this.isInViewport = true;
            //标记当前的显隐状态
            //display为true表示正在显示，否则为元素的原始display至，不会等于false
            this.display = true;
            this.options = util.merge({
                'isCoordPosition':false,
                'markerHeight':0,
                'autoResize':false  //是否自动更新尺寸，每次绘制时均会重新获取，性能损耗较大
            }, options);

            //align center, center
            //elem.style.transform = 'translate(-50%, -50%)';

        },
        'resize':function(width, height){
            var size = getDomSize(this.elem);
            this.width = size.width;
            this.height = size.height;
        },
        'getSize':function(){
            if(this.options.autoResize === true || this.width === 0 || this.height === 0){
                this.resize();
            }
            return {
                'width':this.width,
                'height':this.height
            };
        },
        'getMarkerHeight':function(){
            return this.options.markerHeight;
        },
        'isCoordPosition':function(){
            return this.options.isCoordPosition;
        },
        'setVisible':function(visible){
            this.isVisible = visible;
        },
        'redraw':function(){
            var needDraw = false;
            if(this.isVisible === true && this.isInViewport === true){
                needDraw = true;
            }
            if(true === needDraw){
                //需要绘制，则一定需要更新坐标
                this.container.style.transform = 'translate(' + this.x + 'px, ' + this.y + 'px)';
            }
            //!! 显隐操作在elem上，并非操作container
            if(true === needDraw && true !== this.display){
                //需要绘制，但是当前为非显示状态，显示操作
                this.elem.style.display = this.display;
                this.display = true;
            }else if(false === needDraw && true === this.display){
                //不需要绘制，但是当前为显示状态，隐藏操作
                //保存当前的display状态，并隐藏
                this.display = this.elem.style.display;
                this.elem.setAttribute('originalDisplay', this.display);
                this.elem.style.display = 'none';
            }
        }
    });

    return DomOverlay;
})
