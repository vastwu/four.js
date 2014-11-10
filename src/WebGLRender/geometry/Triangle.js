define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var Geometry = require('WebGLRender/geometry/Geometry');
    //三角形
    var Triangle = Geometry.extend(function(){

        Geometry.call(this);

        this.drawType = GL_CONST.TRIANGLES;

        //定点
        this.vertices = new Float32Array([
            0.0, 1, 0.0,
            -1, -1, 0.0,
            1, -1, 0.0
        ]);
        //定点索引
        this.indexes = new Uint16Array([
            0, 1, 2
        ]);

        this.numberOfIndexes = this.indexes.length;
        this.numberOfVertices = this.vertices.length / this.positionSize;

        var colors = [
            255, 0, 0, 255,     
            0, 250, 6, 255,     
            0, 0, 255, 255
        ];
        this.setCustomColor(colors);

    });
    return Triangle;
});
