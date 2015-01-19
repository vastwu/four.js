define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var glMatrix = require('WebGLRender/lib/glMatrix');
    var mat4 = glMatrix.mat4;
    var quat = glMatrix.quat;

    var toArray = function(arrLike){
        return Array.prototype.slice.apply(null, arrLike);
    }
    //default is 三角形
    var Geometry = function(){

        this.type = 'Geometry';
        this.doubleSide = false;
        this.positionStartIndex = 0;
        this.positionStep = 0;
        this.positionSize = 3;

        this.colorStartIndex = 0;
        this.colorStep = 0;
        this.colorSize = 4;

        this.opacity = 1.0;
        this.drawType = GL_CONST.TRIANGLES;
        this.needDraw = true;   //是否需要绘制

        this.vertices = new Float32Array();
        this.indexes = new Uint16Array();

        this.numberOfIndexes = this.indexes.length;
        this.numberOfVertices = this.vertices.length / this.positionSize;

        this.modelMatrix = mat4.create();

        this.setConstColor(255, 255, 255, 1);

        this.translate = {
            'position':[0, 0, 0],
            'scale':[1, 1, 1],
            'rotate':[0, 0, 0]
        };

        this.needUpdate = true;
    }
    var gp = Geometry.prototype;
    gp.scale = function(x, y, z){
        if(x || x === 0){
            this.translate.scale[0] = x;
        }
        if(y || y === 0){
            this.translate.scale[1] = y;
        }
        if(z || z === 0){
            this.translate.scale[2] = z;
        }
        this.needUpdate = true;
        return this;
    }
    gp.position = function(x, y, z){
        if(x || x === 0){
            this.translate.position[0] = x;
        }
        if(y || y === 0){
            this.translate.position[1] = y;
        }
        if(z || z === 0){
            this.translate.position[2] = z;
        }
        this.needUpdate = true;
        return this;
    }
    /**
     * 欧拉角旋转, 转换为四元数实现
     *
     * @param rx
     * @param ry
     * @param rz
     * @return {instance}
     */
    gp.rotate = function(rx, ry, rz){
        if(rx){
            rx *= Math.PI / 180;
            this.translate.rotate[0] = rx;
        }
        if(ry){
            ry *= Math.PI / 180;
            this.translate.rotate[1] = ry;
        }
        if(rz){
            rz *= Math.PI / 180;
            this.translate.rotate[2] = rz;
        }
        this.needUpdate = true;
        return this;
    }
    gp.reset = function(){
        mat4.identity(this.modelMatrix);
        return this;
    }
    gp.update = function(){
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.translate.position);

        var quatern = quat.create();
        quat.fromYawPitchRoll(quatern, this.translate.rotate[1], this.translate.rotate[0], this.translate.rotate[2]);
        mat4.multiply(this.modelMatrix, this.modelMatrix, mat4.fromQuat(mat4.create(), quatern));

        mat4.scale(this.modelMatrix, this.modelMatrix, this.translate.scale);

        this.needUpdate = false;
        return this;
    }
    gp.bindTexture = function(texture){
        if(this.texture){
            this.texture.dispose();
        }
        this.texture = texture;
        this.needUpdate = true;
        return this;
    }
    gp.setCustomColor = function(colors){
        //交叉数组
        //vertex size in bytes
        var vsib = 3 * Float32Array.BYTES_PER_ELEMENT + 4 * Uint8Array.BYTES_PER_ELEMENT;
        //vertex size in float
        var vsif = vsib / Float32Array.BYTES_PER_ELEMENT;
        var vertices = this.vertices;

        var buffer = new ArrayBuffer(this.numberOfVertices * vsib);
        var positionView = new Float32Array(buffer);
        var colorView = new Uint8Array(buffer);

        var positionSize = this.positionSize;
        var colorSize = this.colorSize;

        var i = 0, n = this.numberOfVertices, positionOffset = 0, colorOffset = 12;
        for(; i < n; i++){
            positionView[positionOffset]     = vertices[i * positionSize];
            positionView[positionOffset + 1] = vertices[i * positionSize + 1];
            positionView[positionOffset + 2] = vertices[i * positionSize + 2];

            colorView[colorOffset] = colors[i * colorSize];
            colorView[colorOffset + 1] = colors[i * colorSize + 1];
            colorView[colorOffset + 2] = colors[i * colorSize + 2];
            colorView[colorOffset + 3] = colors[i * colorSize + 3];

            positionOffset += vsif;
            colorOffset += vsib;
        }
        this.vertices = buffer;
        this.positionStartIndex = 0;
        this.colorStartIndex = 12;
        //一组点为16, 每次都越过一组数值
        this.positionStep = 16;
        this.colorStep = 16;
        this.const_color = null;
        this.needUpdate = true;
    }
    /*
     * r, g, b: 0 ~ 255
     * a: 0 ~ 1
     * */
    gp.setConstColor = function(r, g, b, a){
        //常量颜色, 所有顶点公用颜色
        this.const_color = [r / 255, g / 255, b / 255, a];
        this.needUpdate = true;
        return this;
    }
    /*
        将顶点索引模式转换为直接绘制孤立三角形模式
    */
    gp.elementsToArray = function(){
        var vertices = this.vertices;
        var indexes = this.indexes;
        var colors = this.colors;
        var uv = this.uv;
        if(!vertices || !indexes){
            return;
        }
        var new_uvs = new Float32Array(indexes.length * 2),
            new_vs = new Float32Array(indexes.length * 3),
            new_colors = new Float32Array(indexes.length * 4),
            ui, vi, ci,
            tui = 0, tvi = 0, tci = 0;

          for(var i = 0, n = indexes.length; i < n; i++){
                ui = indexes[i] * 2;
                vi = indexes[i] * 3;
                ci = indexes[i] * 4;

                new_vs[tvi] = vertices[vi];
                new_vs[tvi + 1] = vertices[vi + 1];
                new_vs[tvi + 2] = vertices[vi + 2];
                tvi += 3;

                if(colors){
                    new_colors[tci] = colors[ci];
                    new_colors[tci + 1] = colors[ci + 1];
                    new_colors[tci + 2] = colors[ci + 2];
                    new_colors[tci + 3] = colors[ci + 3];
                    tci += 4;
                }
                if(uv){
                    new_uvs[tui] = uv[ui];
                    new_uvs[tui + 1] = uv[ui + 1];
                    tui += 2;
                }
            }


        this.indexes = null;
        this.vertices = new_vs;
        this.uv = new_uvs;
        //重新设置三角形顶点个数
        this.numberOfIndexes = null;
        this.numberOfVertices = this.vertices.length / this.positionSize;

        colors && this.setCustomColor(new_colors);
    }
    gp.merge = function(){
        //var geos = toArray(arguments);

    }
    Geometry.extend = function(Child){
        var F = function(){};
        F.prototype = gp;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        return Child;
    };
    return Geometry;
})
