    var config = require('common:widget/pano/module/PanoModule/WebglRender/config.js');
    var util = require('common:widget/pano/module/PanoModule/WebglRender/util.js');
    var Emiter = require('common:widget/pano/module/PanoModule/WebglRender/Emiter.js');
    var Arrow = require('common:widget/pano/module/PanoModule/WebglRender/components/Arrow.js');
    var glMatrix = Four.glMatrix;
    var mat4 = glMatrix.mat4;

    var ARROW_SIZE = config.ARROW_SIZE;

    var arrowsPool = [];

    //回收
    var recycling = function(arrow){
        arrow.dispose();
        arrowsPool.push(arrow);
    }
    var use = function(){
        if(arrowsPool.length > 0){
            return arrowsPool.shift();
        }
        return new Arrow();
    }

    var Manager = Four.util.extend(Emiter, {
        init:function(canvasLayer){
            this.projectionMatrix = mat4.create();
            this.viewMatrix = mat4.create();

            mat4.lookAt(this.viewMatrix,
                    [0, 2, 4],  //position
                    [0, 0, 0],    //target
                    [0, 1, 0]);   //up
            mat4.perspective(this.projectionMatrix,
                    45 * Math.PI / 180, //fovy
                    1,  //aspect
                    0.0001,    //near
                    1000);  //far

            this.canvasLayer = canvasLayer;
            this.activityArrow = null;
            this.arrowData = {};
        },
        add:function(pid, arrowDir){
            var arrow = use();
            arrow.setDir(arrowDir);
            var arrowData = {
                'arrow':arrow,
                'pid':pid,
                'dir':arrowDir
            };
            var self = this;
            arrow.onMouseIn = function(){
                self.activityArrow = this;
                self.emit('mouseIn', [this]);
            }
            arrow.onMouseOut = function(){
                self.activityArrow = null;
                self.emit('mouseOut', [this]);
            }
            arrow.onClick = function(){
                var ad = self.arrowData['dir_' + this.dir];
                self.emit('click', [this, ad.pid, ad.dir]);
            }
            this.canvasLayer.add(arrow);
            this.arrowData['dir_' + arrowDir] = arrowData;
        },
        clear:function(){
            var canvasLayer = this.canvasLayer;
            var ad, k;
            for(k in this.arrowData){
                ad = this.arrowData[k];
                canvasLayer.remove(ad.arrow);
                recycling(ad.arrow)
                ad.pid = null;
                ad.dir = null;
                ad.arrow = null;
            };
            this.activityArrow = null;
            this.arrowData = {};
        },
        sync:function(heading, pitch){
            var ad, k;
            var viewMatrix = this.viewMatrix;
            var projectionMatrix = this.projectionMatrix;
            var size = ARROW_SIZE;

            //TODO 此处箭头随pitch的变化体验还有优化空间，
            //目前大部分为经验值设定
            var radPitch = util.ang2rad(pitch + 5);
            var ty = Math.sin(radPitch) * 4;
            glMatrix.mat4.identity(viewMatrix);
            glMatrix.mat4.lookAt(viewMatrix,
                    [0, 2, 4],  //position
                    [0, ty, 0],    //target
                    [0, 1, 0]);   //up

            for(k in this.arrowData){
                ad = this.arrowData[k];
                ad.arrow
                    .rotate(0, heading - ad.dir, 0)
                    .update();

                ad.arrow.updateDrawPoints(function(modelMatrix, points, drawPoints){
                    var drawIndex = 0;
                    for(var i = 0, n = points.length; i < n; i+= 3){
                        var out = [points[i], points[i + 1], points[i + 2], 1];

                        glMatrix.vec4.transformMat4(out, out, modelMatrix);
                        glMatrix.vec4.transformMat4(out, out, viewMatrix);
                        glMatrix.vec4.transformMat4(out, out, projectionMatrix);

                        drawPoints[drawIndex] = (out[0] / out[3]) * size;
                        //canvas坐标与建模坐标的y轴相反
                        drawPoints[drawIndex + 1] = -(out[1] / out[3]) * size;
                        drawIndex += 2;
                    }
                })
            };

        }
    });

    return Manager;
