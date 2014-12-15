define(function(require){
    var util = require('WebGLRender/base/util');
    var glMatrix = require('WebGLRender/lib/glMatrix');
    var vec2 = glMatrix.vec2;
    var vec3 = glMatrix.vec3;
    var mat4 = glMatrix.mat4;
	var ANG_TO_RAD = Math.PI / 180;
    
    var Camera = function(fovy, aspect, near, far){
        this.fov = fovy * Math.PI / 180;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.position = {x:0, y:0, z:0};

        this.up = [0, 1, 0];
        this.target = [0, 0, 0];

        this.updateProjectionMatrix();
    }

    var cp = Camera.prototype;

    cp.setPosition = function(x, y, z){
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.updateViewMatrix();
    }
    cp.lookAt = function(x, y, z){
        this.target = [x, y, z];
        this.updateViewMatrix();
    }
    cp.updateProjectionMatrix = function(){
        mat4.identity(this.projectionMatrix);
        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
    }
    cp.updateViewMatrix = function(){
        mat4.identity(this.viewMatrix);
        var p = this.position;
        mat4.lookAt(this.viewMatrix, [p.x, p.y, p.z], this.target, this.up);
    }

    /**
     * getVec3dFromScreenPixel
     * 屏幕坐标转是三维坐标
     * @param screenX
     * @param screenY
     * @param viewWidth
     * @param viewHeight
     * @return {undefined}
     */
    cp.getVec3dFromScreenPixel = function(screenX, screenY, viewWidth, viewHeight){
        var x = screenX - viewWidth / 2;
        var y = viewHeight / 2 - screenY;
        var p = util.normalize2(x, y);

        //逆投影矩阵
        var tpm = mat4.create();
        mat4.transpose(tpm, this.projectionMatrix);

        //逆视口矩阵
        var tvm = mat4.create();
        mat4.transpose(tvm, this.viewMatrix);
        
        var vector = vec3.create();
        //反投影
        vec3.transformMat4(vector, [p.x, p.y, -this.near], tpm);
        //反视口
        vec3.transformMat4(vector, vector, tvm);
        //归一化
        vec3.normalize(vector, vector);

        return [vector[0], vector[1], vector[2]];
    }

    return Camera;
})

