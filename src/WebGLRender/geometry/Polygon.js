define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var Geometry = require('WebGLRender/geometry/Geometry');
    //多边形
    var Polygon = Geometry.extend(function(radius, segments){

        Geometry.call(this);

        this.drawType = GL_CONST.TRIANGLES;

        n = segments || 20;
        radius = radius || 0.5;

        var rad, x, y, z, i, eachRad = Math.PI * 2 / n;
        var vertices = [0, 0, 0];
        var indexes = [];

        for(i = 0; i < n; i++){
            rad = eachRad * i;
            x = Math.cos(rad) * radius;
            y = Math.sin(rad) * radius;
            z = 0;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            if(i < n - 1){
                indexes.push(0); 
                indexes.push(i + 1); 
                indexes.push(i + 2); 
            }else{
                indexes.push(0); 
                indexes.push(n); 
                indexes.push(1); 
            }

        }

        this.vertices = new Float32Array(vertices);
        this.indexes = new Float32Array(indexes);


        this.elementsToArray();


        /*
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
        */
    });
    return Polygon;
})
