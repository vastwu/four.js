define(function(require){
    var Shaders = require('WebGLRender/base/Shaders');

    var loadShader = function(gl, type, source){
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            throw new Error('Error compiling shader' + gl.getShaderInfoLog(shader));
            gl.deleteSHader(shader); 
            return null;
        }
        return shader;
    }
    var Program = function(gl){
        var vShader = loadShader(gl, gl.VERTEX_SHADER, Shaders.mVertexShader);
        var fShader = loadShader(gl, gl.FRAGMENT_SHADER, Shaders.baseFragmentShader);
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vShader);
        gl.attachShader(shaderProgram, fShader);
        gl.linkProgram(shaderProgram);
        if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
            throw new Error('failed to setup shaders');
        }
        this.program = shaderProgram;
        var attr = {};
        attr.textureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        attr.position = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        attr.color = gl.getAttribLocation(shaderProgram, "aVertexColor");

        for(var id in attr){
            gl.enableVertexAttribArray(attr[id]);
        }
        this.attr = attr;

        this.uniformMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        this.uniformProjMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
        this.uniformItemMatrix = gl.getUniformLocation(shaderProgram, "uItemMatrix");
        this.uniformDrawTexture = gl.getUniformLocation(shaderProgram, "uDrawTexture");
        this.uniformSampler = gl.getUniformLocation(shaderProgram, "uSampler");
        this.uniformOpacity = gl.getUniformLocation(shaderProgram, "uOpacity");

    }

    return Program;
})
