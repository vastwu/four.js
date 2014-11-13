define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var Geometry = require('WebGLRender/geometry/Geometry');
    //立方体
    var Polygon = Geometry.extend(function(){

        Geometry.call(this);

        this.drawType = GL_CONST.TRIANGLES;

        var n = 0;
        var vertices = [];
        var indexes = [];

        this.addPoint = function(x, y, z){
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            indexes.push(n++);
        }
        this.finish = function(){
            //顶点
            //3 2
            //0 1
            this.vertices = new Float32Array(vertices);
            this.indexes = new Uint16Array(indexes);

            this.numberOfIndexes = this.indexes.length;
            this.numberOfVertices = this.vertices.length / this.positionSize;

            this.elementsToArray();
        }
    });
    return Polygon;
})
