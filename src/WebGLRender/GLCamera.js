define(function(require){
    var mat4 = require('WebGLRender/lib/gl-matrix').mat4;
    
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

    return Camera;
})

