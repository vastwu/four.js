define(function(require){
    var mat4 = require('WebGLRender/lib/mat4');
    
    
    /**
     * Camera 
     * 正交相机
     * @param left
     * @param right
     * @param top
     * @param bottom
     * @param near
     * @param far
     */
    var Camera = function(top, right, bottom, left, near, far){
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.zoom = 1;
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
        var dx = (this.right - this.left) / (2 * this.zoom);
        var dy = (this.top - this.bottom) / (2 * this.zoom);
        var cx = (this.right + this.left) / 2;
        var cy = (this.top + this.bottom) / 2

        mat4.identity(this.projectionMatrix);
        mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
    cp.updateViewMatrix = function(){
        mat4.identity(this.viewMatrix);
        var p = this.position;
        mat4.lookAt(this.viewMatrix, [p.x, p.y, p.z], this.target, this.up);
    }

    return Camera;
})

