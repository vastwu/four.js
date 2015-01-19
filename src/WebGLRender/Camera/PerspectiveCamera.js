define(function(require){
    var util = require('WebGLRender/base/util');
    var glMatrix = require('WebGLRender/lib/glMatrix');
    var vec2 = glMatrix.vec2;
    var vec3 = glMatrix.vec3;
    var vec4 = glMatrix.vec4;
    var mat4 = glMatrix.mat4;
	var ANG_TO_RAD = Math.PI / 180;

    var Camera = function(fovy, aspect, near, far){
        this.fov = fovy * ANG_TO_RAD;
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
     * 正投影，获取物体的二维投影坐标
     *
     * @param x 点坐标x
     * @param y 点坐标y
     * @param z 点坐标z
     * @param modelMatrix   物体变换矩阵
     * @return [x, y, z, w]
     */
    cp.project = function(x, y, z, modelMatrix){
        var out = [x, y, z, 1];
        modelMatrix && vec4.transformMat4(out, out, modelMatrix);
        vec4.transformMat4(out, out, this.viewMatrix);
        if(out[2] >= 0){
            //on back
            return false;
        }
        vec4.transformMat4(out, out, this.projectionMatrix);
        out[0] = out[0] / out[3];
        out[1] = out[1] / out[3];
        out[2] = out[2] / out[3];
        out[3] = 1;
        return out;
    }
    /**
     * 反投影，获取二维点的三维坐标
     * @param screenX
     * @param screenY
     * @param viewWidth
     * @param viewHeight
     * @return {undefined}
     */
    cp.unProject = function(screenX, screenY, viewWidth, viewHeight){
        var half_w = viewWidth / 2;
        var half_h = viewHeight / 2;

        var x = (screenX - half_w) / half_w;
        var y = (half_h - screenY) / half_h;

        //逆投影矩阵
        var tpm = mat4.create();
        mat4.invert(tpm, this.projectionMatrix);

        //逆视口矩阵
        var tvm = mat4.create();
        mat4.invert(tvm, this.viewMatrix);

        var vector = vec3.create();
        //反投影
        vec3.transformMat4(vector, [x, y, -this.near], tpm);
        //反视口
        vec3.transformMat4(vector, vector, tvm);
        //归一化
        vec3.normalize(vector, vector);

        return [vector[0], vector[1], vector[2]];
    }

    return Camera;
})

