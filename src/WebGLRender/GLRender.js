define(function(require){
    var GLProgram = require('WebGLRender/GLProgram');

    var createGlVerticesBuffer = function(gl, vertices){
        var bf = gl.createBuffer(); 
        gl.bindBuffer(gl.ARRAY_BUFFER, bf);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        return bf;
    }

    /*
    var createGlIndexesBuffer = function(gl, indexes){
        var indexesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);
        return indexesBuffer
    }
    */
    var createGlTexture = function(gl, texture, texture_index){
        //初始化texture
        var textureBuffer = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
        //Y轴翻转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false /*texture.premultiplyAlpha*/ );
        //gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4 /*texture.unpackAlignment*/ );

        //水平、垂直填充方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[texture.wrapS]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[texture.wrapT]);
        //纹理过滤
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[texture.magFilter]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[texture.minFilter]);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.generateMipmap( gl.TEXTURE_2D );
        return textureBuffer;
    }

    var draw = function(gl, program, rendererStatus, item, camera){
        var verticesBuffer = item.verticesBuffer,
            indexesBuffer = item.indexesBuffer,
            textureBuffer,
            attr = program.attr;

        if(item.doubleSide === true && rendererStatus.doubleSide === false){
            //关闭剔除背面
            gl.disable(gl.CULL_FACE);
            rendererStatus.doubleSide = true;
        }else if(item.doubleSide === false && rendererStatus.doubleSide === true){
            //开启剔除背面
            gl.enable(gl.CULL_FACE);
            rendererStatus.doubleSide = false;
        }

        //顶点buffer
        if(verticesBuffer){
            gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        }else{
            verticesBuffer = createGlVerticesBuffer(gl, item.vertices);
            item.verticesBuffer = verticesBuffer;
        }
        gl.vertexAttribPointer(attr.position, item.positionSize, gl.FLOAT, false, item.positionStep, item.positionStartIndex);
        gl.enableVertexAttribArray(attr.position);

        //索引buffer, 停用
        /*
        if(indexesBuffer){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexesBuffer);
        }else{
            if(item.indexes){
                indexesBuffer = createGlIndexesBuffer(gl, item.indexes);
                item.indexesBuffer = indexesBuffer;
            }
        }
        */

        //上传变换矩阵
        gl.uniformMatrix4fv(program.uniformMVMatrix, false, camera.viewMatrix);
        gl.uniformMatrix4fv(program.uniformProjMatrix, false, camera.projectionMatrix);
        gl.uniformMatrix4fv(program.uniformItemMatrix, false, item.modelMatrix);

        var texture = item.texture, uvBuffer = item.uvBuffer;
        if(texture && texture.isReady){
            //启用贴图标志
            gl.uniform1i(program.uniformDrawTexture, true);
            gl.enableVertexAttribArray(attr.textureCoord);
            if(uvBuffer){
                gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
                gl.vertexAttribPointer(attr.textureCoord, 2, gl.FLOAT, false, 0, 0);
            }else{
                //绑定纹理坐标
                uvBuffer = createGlVerticesBuffer(gl, item.uv);
                gl.vertexAttribPointer(attr.textureCoord, 2, gl.FLOAT, false, 0, 0);
                item.uvBuffer = uvBuffer;
            }
            if(texture.buffer){
                //直接绑定和激活
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture.buffer);
                gl.uniform1i(program.uniformSampler, 0);
            }else{
                //初始化texture
                textureBuffer = createGlTexture(gl, texture)
                //给第0个纹理设置 uSampler
                gl.uniform1i(program.uniformSampler, 0);
                gl.bindTexture(gl.TEXTURE_2D, null);
                texture.buffer = textureBuffer;
            }
        }else{
            gl.disableVertexAttribArray(attr.textureCoord);
            gl.uniform1i(program.uniformDrawTexture, false);
        }

        var const_color = item.const_color;
        if(const_color){
            //常量颜色
            gl.disableVertexAttribArray(attr.color);
            gl.vertexAttrib4f(attr.color, const_color[0], const_color[1], const_color[2], const_color[3]);
        }else{
            gl.enableVertexAttribArray(attr.color);
            gl.vertexAttribPointer(attr.color, item.colorSize, gl.UNSIGNED_BYTE, true, item.colorStep, item.colorStartIndex);
        }

        gl.uniform3f(program.uniformDiffuse, 1, 1, 1);
        gl.uniform1f(program.uniformOpacity, 1.0);

        gl.drawArrays(gl[item.drawType], 0, item.numberOfVertices);
    }
    var isSupport = function(){
        return true; 
    }
    var initGLContext = function(canvas){
        var gl;
        try{ 
            gl = canvas.getContext('experimental-webgl'); 
        }catch(e){}
        if(!gl){
            return null;
        }
        return gl;
    }

    var Render = function(container){
        var canvas = this._canvas = document.createElement('canvas'); 
        var gl = this._gl = initGLContext(canvas);
        //深度测试
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        //激活面剔除
        gl.enable(gl.CULL_FACE);
        //启用融合
        gl.enable(gl.BLEND);

        var glProgram = this._glProgram = new GLProgram(gl);
        gl.useProgram(glProgram.program);

        this.viewPort(container.clientWidth, container.clientHeight);
        container.appendChild(canvas);


        var rendererStatus = {
            doubleSide: false
        }

        var renderObjects = function(camera, renderList){
            renderList.forEach(function(obj){
                if(obj.getItems){
                    renderObjects(camera, obj.getItems());
                }else{
                    draw(gl, glProgram, rendererStatus, obj, camera);
                }
            });           
        }
        this.render = function(camera, scene){
            this.clear();
            renderObjects(camera, scene.getItems());
        }
    }
    var rp = Render.prototype;

    rp.viewPort = function(width, height){
        this._canvas.width = width;
        this._canvas.height = height;
        this._gl.viewport(0, 0, width, height);
    }
    rp.clear = function(){
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    }

    return Render;
})
