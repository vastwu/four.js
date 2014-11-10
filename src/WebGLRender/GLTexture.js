define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');

    var Texture = function(src){
        this.isReady = false;
        this._onload = [];

        //纹理拉伸方式
        this.minFilter = GL_CONST.LINEAR;
        this.magFilter = GL_CONST.LINEAR;

        //水平填充方式
        this.wrapS = GL_CONST.CLAMP_TO_EDGE;
        //垂直填充方式
        this.wrapT = GL_CONST.CLAMP_TO_EDGE;

        var image = new Image();
        var self = this;
        image.onload = function(){
            self._loadCompleted(this); 
        };
        //image.crossOrigin = 'anonymous';
        image.src = src;

    }
    var tp = Texture.prototype;

    tp.onload = function(handler){
        this._onload.push(handler);
    }
    tp._loadCompleted = function(image){
        this.image = image; 
        this.isReady = true;
        while(this._onload.length > 0){
            this._onload.shift()(this);
        }
    }

    return Texture;
})
