define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var IS_DISPOST = undefined;

    var Texture = function(src, useCrossOrigin){
        this.src = src;
        this.useCrossOrigin = useCrossOrigin === false ? false : true;
        this.isReady = false;
        this._onload = [];
        this._loadPromise = null;
        this.buffer = null;
        this.needUpdate = false;

        //纹理拉伸方式
        this.minFilter = GL_CONST.LINEAR;
        this.magFilter = GL_CONST.LINEAR;

        //水平填充方式
        this.wrapS = GL_CONST.CLAMP_TO_EDGE;
        //垂直填充方式
        this.wrapT = GL_CONST.CLAMP_TO_EDGE;
    }
    var tp = Texture.prototype;
    tp.load = function(texture){
        if(texture){
            this.image = texture;
            this.isReady = true;
            return;
        }
        if(this.isReady !== false){
            return this._loadPromise;
        }
        var self = this;
        this._loadPromise = new Promise(function(resolve, reject){
            var image = new Image();
            image.onload = function(){
                resolve(this);
            };
            if(self.useCrossOrigin){
                image.crossOrigin = 'anonymous';
            }
            image.src = self.src;
        }).then(function(image){
            if(self.isReady === IS_DISPOST){
                return;
            }
            self.image = image;
            self.isReady = true;
            self.needUpdate = true;
            var onloadHandlers = self._onload;
            while(onloadHandlers.length > 0){
                onloadHandlers.shift()(self);
            }
        });
        return this._loadPromise;
    }
    tp.clearBuffer = function(){
        this.buffer = null;
    }
    tp.onload = function(handler){
        this._onload.push(handler);
    }
    tp.dispose = function(){
        this._onload = [];
        this.isReady = IS_DISPOST;
    }

    return Texture;
})
