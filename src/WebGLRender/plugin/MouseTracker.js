define(function(require){
    var util = require('WebGLRender/base/util');
    var glMatrix = require('WebGLRender/lib/glMatrix');
    var vec2 = glMatrix.vec2;
    var vec3 = glMatrix.vec3;
    var mat4 = glMatrix.mat4;
	var ANG_TO_RAD = Math.PI / 180;

	var MouseTracker = function (eventLayer, camera) {
        this.children = [];
        //var round = new Four.geometry.Sphere(10, 0, 0);

        var width = eventLayer.clientWidth;
        var height = eventLayer.clientHeight;

        eventLayer.addEventListener('mousemove', function(e){
            var leftTop = camera.getVec3dFromScreenPixel(0, 0, width, height);
            var rightTop = camera.getVec3dFromScreenPixel(width, 0, width, height);
            var leftBottom = camera.getVec3dFromScreenPixel(0, height, width, height);
            var rightBottom = camera.getVec3dFromScreenPixel(width, height, width, height);

            console.log(vector);
        })
	}

    return MouseTracker;
});
