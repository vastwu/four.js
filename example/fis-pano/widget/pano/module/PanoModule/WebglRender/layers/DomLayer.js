    var Layer = require('common:widget/pano/module/PanoModule/WebglRender/layers/Layer.js');
    var util = require('common:widget/pano/module/PanoModule/WebglRender/util.js');

    var setCoordMarkerPosition = function(marker, camera, viewWidth, viewHeight){
        var position3D = marker.position3D;
        var point = camera.project( position3D[0], position3D[1], position3D[2]);
        //var point = camera.project(0, 0, -1);
        // -1 ~ 1
        //var x = point[0] / point[3];
        //var y = point[1] / point[3];

        if(point === false){
            marker.isInViewport = false;
            return;
        }

        var size = marker.getSize();
        var m_width = size.width;
        var m_height = size.height;

        //marker的屏幕投影位置
        var rx = (point[0] + 1) * viewWidth / 2;
        var ry = (-point[1] + 1) * viewHeight / 2;

        //偏移锚点定位到marker中央
        rx = rx - m_width / 2;
        ry = ry - m_height / 2;

        if(rx > viewWidth || rx + m_width < 0
            || ry > viewHeight || ry + m_height < 0){
            //x或者y轴越界，隐藏
            marker.isInViewport = false;
            return;
        }
        marker.x = rx;
        marker.y = ry;
        marker.isInViewport = true;
    }
    var get3DPosition = function(panoX, panoY, coordX, coordY, height){
        var dx = coordX - panoX;
        var dy = coordY - panoY;
        //地理坐标偏向角, 由北偏
        //地理坐标转换为模型坐标
        var dAng = util.getAngFromAB(dx, dy);
        var dRad = util.ang2rad(dAng);
        //debug 偏北30度
        //dRad = util.ang2rad(30);
        dx = Math.sin(dRad);
        dy = Math.cos(dRad);
        //转换为xz 平面上一点
        //地理坐标北= +y(转换为xz平面后，变为+z), 东=+x
        //与右手坐标系相反，此处需要翻转转化的z轴坐标
        //获得目标点与z轴负方向的夹角
        //模型0度角定义为朝向+x
        //转换为与x轴
        //需要翻转y轴
        return [dx, height, -dy];
    }

    var DomLayer = util.extend(Layer, {
        init: function(container, options){
            Layer.call(this, container, 4);

            var viewWidth = container.clientWidth;
            var viewHeight = container.clientHeight;

            this.on('resize', function(width, height){
                viewWidth = width;
                viewHeight = height;
                this.sync();
            });

            this.content.style.width = '0px';
            this.content.style.height = '0px';
            var self = this;
            var domLayer = this.content;

            this.staticChildren = [];
            this.coordChildren = [];
            this.camera = null;
            this.panoModel = null;

            this.append = function(marker){
                this.content.appendChild(marker.container);
                if(marker.isCoordPosition()){
                    var panoX = this.panoModel.get('x');
                    var panoY = this.panoModel.get('y');
                    marker.position3D = get3DPosition(panoX, panoY, marker.coordX, marker.coordY, marker.getMarkerHeight());
                    setCoordMarkerPosition(marker, this.camera, viewWidth, viewHeight);
                    this.coordChildren.push(marker);
                }else{
                    this.staticChildren.push(marker);
                }
                marker.redraw();
            };
            this.sync = function(){
                var camera = this.camera;
                this.coordChildren.forEach(function(marker){
                    if(marker.isVisible === true){
                        setCoordMarkerPosition(marker, camera, viewWidth, viewHeight);
                    }
                    marker.redraw();
                })
            };
            this.updateCoordMarkers = function(){
                var panoX = this.panoModel.get('x');
                var panoY = this.panoModel.get('y');
                var camera = this.camera;
                this.coordChildren.forEach(function(marker){
                    if(marker.isVisible === true){
                        marker.position3D = get3DPosition(panoX, panoY, marker.coordX, marker.coordY, marker.getMarkerHeight());
                        setCoordMarkerPosition(marker, camera, viewWidth, viewHeight);
                        marker.redraw();
                    }
                });
            }
        },
        bind:function(camera, panoModel){
            this.camera = camera;
            this.panoModel = panoModel;
        },
        remove:function(marker){
            var find = marker.isCoordPosition() ? this.coordChildren : this.staticChildren;
            var i = find.indexOf(marker);
            if(i >= 0){
                find.split(i, 1);
                this.content.removeChild(marker.container);
                return true;
            }
            return false;
        },
        show:function(){
            this.content.style.display = '';
        },
        hide:function(){
            this.content.style.display = 'none';
        }
    });
    return DomLayer;
