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
    var clampToMaxSize = function(image, maxSize){
        if(image.width > maxSize || image.height > maxSize){
            var scale = maxSize / Math.max(image.width, image.height);
            var canvas = document.createElement('canvas');
            canvas.width = Math.floor(image.width * scale);
            canvas.height = Math.floor(image.height * scale);
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            return canvas;
        }         
        return image
    }
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


        texture.image = clampToMaxSize(texture.image, gl.MAX_TEXTURE_SIZE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        //gl.generateMipmap( gl.TEXTURE_2D );
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
                //gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
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

        if(rendererStatus.enableAlpha){
            var alpha = item.opacity === undefined ? 1.0 : item.opacity; 
            gl.uniform1f(program.uniformOpacity, alpha);
        }else{
            gl.uniform1f(program.uniformOpacity, 1.0);
        }
        gl.drawArrays(gl[item.drawType], 0, item.numberOfVertices);
    }
    var drawDebugLine = function(gl, program, item){
        //debug line
        gl.uniform1i(program.uniformDrawTexture, false);
        gl.disableVertexAttribArray(program.attr.color);
        gl.vertexAttrib4f(program.attr.color, 1.0, 1.0, 1.0, 1.0);
        gl.drawArrays(gl.LINES, 0, item.numberOfVertices);
    }
    var isSupport = function(){
        return true; 
    }
    var initGLContext = function(canvas){
        var gl;
        try{ 
            gl = canvas.getContext('experimental-webgl') || canvas.getContext('webgl'); 
        }catch(e){}
        if(!gl){
            return false;
        }
        return gl;
    }

    var Render = function(container, isDebug){
        //isDebug = true;
        var canvas = this._canvas = document.createElement('canvas'); 
        var gl = this._gl = initGLContext(canvas);
        if(gl === false){
            this.isSupport = function(){
                return false;
            }
        }else{
            this.isSupport = function(){
                return true;
            }
        }
        //启用深度测试
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        //激活面剔除
        gl.enable(gl.CULL_FACE);
        //启用融合
        //gl.enable(gl.BLEND);
        //融合方式
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        var glProgram = this._glProgram = new GLProgram(gl);
        gl.useProgram(glProgram.program);

        this.viewPort(container.clientWidth, container.clientHeight);
        container.appendChild(canvas);


        var rendererStatus = this.rendererStatus = {
            doubleSide: false,
            enableAlpha: false,
            alpha: false
        }

        var renderObjects;
        if(isDebug){
            renderObjects = function(camera, renderList){
                renderList.forEach(function(obj){
                    if(obj.children && obj.children.length > 0){
                        renderObjects(camera, obj.children);
                    }else{
                        draw(gl, glProgram, rendererStatus, obj, camera);
                        drawDebugLine(gl, glProgram, obj);
                    }
                });           
            }
        }else{
            renderObjects = function(camera, renderList){
                renderList.forEach(function(obj){
                    if(obj.children && obj.children.length > 0){
                        renderObjects(camera, obj.children);
                    }else{
                        draw(gl, glProgram, rendererStatus, obj, camera);
                    }
                });           
            }
        }
        this.render = function(camera, scene){
            this.clear();
            renderObjects(camera, scene.children);
        }
    }
    var rp = Render.prototype;
    rp.enableAlpha = function(){
        //使用透明度支持
        //透明度支持需要启用混合模式,并关闭深度测试
        var gl = this._gl;
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        this.rendererStatus.enableAlpha = true;
    }
    rp.disableAlpha = function(){
        var gl = this._gl;
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        this.rendererStatus.enableAlpha = false;
    }
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
