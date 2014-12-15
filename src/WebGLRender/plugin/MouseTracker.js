define(function(require){
    var util = require('WebGLRender/base/util');
    var Sphere = require('WebGLRender/geometry/Sphere');
    var glMatrix = require('WebGLRender/lib/glMatrix');
    var vec2 = glMatrix.vec2;
    var vec3 = glMatrix.vec3;
    var mat4 = glMatrix.mat4;
	var ANG_TO_RAD = Math.PI / 180;

	var MouseTracker = function (eventLayer) {
        return;
        this.children = [];
        //var round = new Four.geometry.Sphere(10, 0, 0);

        var width = eventLayer.clientWidth;
        var height = eventLayer.clientHeight;
        var fillFace = new Four.Face();

        var vertices = [0, 0, 0];
        var indexes = [];

        var radius = 1;
        var rad = 0;
        var segments = 4;
        var each_segments = Math.PI * 2 / segments;

        for(var i = 0; i < segments; i++){
            rad = i * each_segments;
            x = 0;
            y = Math.sin(rad) * radius;
            z = Math.cos(rad) * radius;;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            numberOfVerctices++;
        }
        //除圆心外的定点数
        var n = vertices.length / 3 - 1;

        fillFace.position(3, 0, 0);


        return;
        eventLayer.addEventListener('mousemove', function(e){
            var leftTop = camera.getVec3dFromScreenPixel(0, 0, width, height);
            var rightTop = camera.getVec3dFromScreenPixel(width, 0, width, height);
            var leftBottom = camera.getVec3dFromScreenPixel(0, height, width, height);
            var rightBottom = camera.getVec3dFromScreenPixel(width, height, width, height);

            console.log(leftTop, rightTop, leftBottom, rightBottom);
        });
	}

    return MouseTracker;
});
