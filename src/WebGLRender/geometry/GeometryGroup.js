define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var Geometry = require('WebGLRender/geometry/Geometry');
    var glMatrix = require('WebGLRender/lib/glMatrix');

    var Triangle = Geometry.extend(function(){

        Geometry.call(this);
        this.drawType = undefined;

        this.bind = function(g){
            //line same value
            g.modelMatrix = this.modelMatrix;
        };
        this.unbind = function(g){
            if(g.modelMatrix === this.modelMatrix){
                //copy for unlink
                g.modelMatrix = this.modelMatrix.slice();
            }
        };
    });
    return Triangle;
});
