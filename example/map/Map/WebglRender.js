define(function(require){

    var normalize2 = function(x, y){
        var out = {};
        var len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
        }
        return out;
    }
    var normalize3 = function(x, y, z){
        var out = {};
        var len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
            out.z = z * len;
        }
        return out;
    }

    var Render = function(container){
        var camera = new Four.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.01, 1500);
        var scene = new Four.GLScene();
        var renderer = new Four.GLRender(container);
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 1100;
        camera.lookAt(0, 0, 0);
        //var dragController = new Four.plugin.DragController(camera, container);
        //renderer.enableAlpha();

        var drawList = [];
        var render = function(){
            //requestAnimationFrame(render);
            renderer.render(camera, scene);
            setTimeout(render, 50);
        }
        //setTimeout(render, 50);

        this.draw = function(items){
            return;
            drawList = items.map(function(item){
                if(item.texture){
                    return item;
                }
                var texture = new Four.GLTexture(item.url);
                texture.onload(function(image){
                });
                item.texture = texture;
                return item;


                var sizeNormailzed = normalize2(item.size, item.size);
                var positionNormailzed = normalize2(item.drawX, item.drawY);
                item.size = sizeNormailzed.x;
                //转为屏幕中心为原点位置
                item.drawX = positionNormailzed.x - 0.5;
                item.drawY = positionNormailzed.y - 0.5;
                return item;
            });
            drawList.forEach(function(item, index){
                var obj = new Four.geometry.Face();
                obj.bindTexture(item.texture);
                obj.scale(item.size, item.size);
                obj.position(item.drawX, item.drawY, 0);
                obj.update();
                scene.add(obj);
            })
        }
    }


    return Render;
})
