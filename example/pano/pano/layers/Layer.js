define(function(require){
    var Emiter = require('./../Emiter');

    var Layer = Four.util.extend(Emiter, {
        init:function(container, zIndex, tag){
            Emiter.call(this);

            zIndex = zIndex || 1;
            var content = this.content = document.createElement('div');
            content.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;z-index:' + zIndex + ';';
            container.appendChild(content);
            
            this.content = content;
        },
        setSize: function(width, height){
            this.content.style.width = width; 
            this.content.style.height = height; 
            return this;
        }
    })

    return Layer;
})
