define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var Geometry = require('WebGLRender/geometry/Geometry');
    //立方体
    var Face = Geometry.extend(function(){

        Geometry.call(this);

        this.drawType = GL_CONST.TRIANGLES;

        //顶点
        //3 2
        //0 1
        this.vertices = new Float32Array([
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,  
            1.0, 1.0, 0.0, 
            -1.0, 1.0, 0.0
        ]);
        this.indexes = new Uint16Array([
            0, 1, 2, 0, 2, 3
        ]);
        this.uv = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]);
        this.numberOfIndexes = this.indexes.length;
        this.numberOfVertices = this.vertices.length / this.positionSize;

        this.elementsToArray();

    });
    return Face;
})
