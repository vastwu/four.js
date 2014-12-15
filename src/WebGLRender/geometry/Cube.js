define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var Geometry = require('WebGLRender/geometry/Geometry');
    //立方体
    var Cube = Geometry.extend(function(){

        Geometry.call(this);

        this.type = 'cube';
        this.drawType = GL_CONST.TRIANGLES;

        //顶点 24 * 3 72
        this.vertices = new Float32Array([
            /*
            1 0
            2 3
            */
            //front
            1.0, 1.0, 1.0,  
            -1.0, 1.0, 1.0, 
            -1.0, -1.0, 1.0, 
            1.0, -1.0, 1.0,

            //back 
            1.0, 1.0, -1.0,  
            -1.0, 1.0, -1.0, 
            -1.0, -1.0, -1.0, 
            1.0, -1.0, -1.0,  

            //left
            -1.0, 1.0, 1.0,  
            -1.0, 1.0, -1.0, 
            -1.0, -1.0, -1.0, 
            -1.0, -1.0, 1.0, 

            //right
            1.0, 1.0, 1.0,  
            1.0, -1.0, 1.0, 
            1.0, -1.0, -1.0, 
            1.0, 1.0, -1.0,

            //top
            1.0, 1.0, 1.0,  
            1.0, 1.0, -1.0, 
            -1.0, 1.0, -1.0, 
            -1.0, 1.0, 1.0,

            //bottom
            1.0, -1.0, 1.0,  
            1.0, -1.0, -1.0, 
            -1.0, -1.0,- 1.0, 
            -1.0, -1.0, 1.0
        ]);
        //定点索引 36
        this.indexes = new Uint16Array([
            0, 1, 2, 0, 2, 3,       //front
            4, 6, 5, 4, 7, 6,       //back
            8, 9, 10, 8, 10, 11,    //left
            12, 13, 14, 12, 14, 15, //right
            16, 17, 18, 16, 18, 19, //top   
            20, 22, 21, 20, 23, 22  //bottom
        ]);

        this.numberOfIndexes = this.indexes.length;
        this.numberOfVertices = this.vertices.length / this.positionSize;

        var colors = [
            255, 0, 0, 255,     
            255, 0, 0, 255,     
            255, 0, 0, 255,
            255, 0, 0, 255,

            0, 255, 0, 255,     
            0, 255, 0, 255,     
            0, 255, 0, 255,
            0, 255, 0, 255,

            0, 0, 255, 255,     
            0, 0, 255, 255,     
            0, 0, 255, 255,
            0, 0, 255, 255,

            255, 0, 255, 255,     
            255, 0, 255, 255,     
            255, 0, 255, 255,
            255, 0, 255, 255,

            255, 255, 255, 255,     
            255, 255, 0, 255,     
            255, 255, 0, 255,
            255, 255, 0, 255,

            0, 255, 255, 255,     
            0, 255, 255, 255,     
            0, 255, 255, 255,
            0, 255, 255, 255                      
        ];
        this.colors = colors;
        //this.setCustomColor(colors);

        this.elementsToArray();
    });
    return Cube;
})
