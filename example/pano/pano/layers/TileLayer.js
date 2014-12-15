define(function(require){
    var Layer = require('./Layer');
    var config = require('./../config');
    var util = Four.util;

    var IMAGE_DOMAIN = config.PANO_TILE_URL;
    var SPHERE_WIDTH_SEGMENTS = 60; 
    var SPHERE_HEIGHT_SEGMENTS = 40; 
    var ANG_TO_RAD = Math.PI / 180;

    var valueInRange = function(value, min, max){
        return value >= min && value <= max;
    }
    var getImageUrl = function(sid, x, y, z){
        //0, 1, 2
        return IMAGE_DOMAIN.replace('{port}', Math.round(Math.random() * 2))
                            .replace('{sid}', sid)
                            .replace('{x}', x || 0)
                            .replace('{y}', y || 0) 
                            .replace('{z}', z || 1);
    }
    var createGeomerys = function(radius, z){
        var geometries = {};
        var max_x = Math.pow(2, z - 1);
        var max_y = z == 1 ? 1 : Math.pow(2, z - 2);
        var each_x_rad = Math.PI * 2 / max_x;
        var each_y_rad = Math.PI / max_y;
        var ws = SPHERE_WIDTH_SEGMENTS / max_x;
        var hs = SPHERE_HEIGHT_SEGMENTS / max_y;
        var start_x_rad, start_y_rad;

        for(var i = 0; i < max_x; i++){
            for(var j = 0; j < max_y; j++){
                start_x_rad = each_x_rad * i;
                start_y_rad = each_y_rad * j;
                //var tile_texture = new Four.GLTexture(getImageUrl(sid, i, j, z));
                var tile = new Four.geometry.Sphere(radius, ws, hs, 
                                                    start_x_rad, each_x_rad, 
                                                    start_y_rad, each_y_rad);
                tile.opacity = 0;
                /*
                tile_texture.onload((function(t){
                    return function(){
                        var a = setInterval(function(){
                            t.opacity += 0.1; 
                            if(t.opacity >= 1){
                                clearInterval(a);
                            }
                        }, 16);
                    }
                })(tile));
                */
                //使用球内侧贴图,需要反转x轴坐标与贴图坐标的对应关系
                tile.scale(-1, 1, 1);
                //tile.bindTexture(tile_texture);
                tile.setConstColor(255, 0, 0, 0);
                //tiles.push(tile);
                geometries[i + '_' + j] = {
                    'item': tile,
                    'endXAng': util.rad2ang(start_x_rad + each_x_rad),
                    'endYAng': util.rad2ang(start_y_rad + each_y_rad),
                    'startXAng': util.rad2ang(start_x_rad),
                    'startYAng': util.rad2ang(start_y_rad)
                };
            }
        }
        return geometries;
    }

    var createTiles = function(sid, z, geometries){
        /*
         * z = 1: 1 x 1
         * z = 2: 2 x 1
         * z = 3: 4 x 2
         * z = 4: 8 x 4
         *      : 2^(z-1) x 2^(z-2)
         * */
        var tiles = {};
        var max_x = Math.pow(2, z - 1);
        var max_y = z == 1 ? 1 : Math.pow(2, z - 2);
        var tile_id;
        var tile;

        for(var i = 0; i < max_x; i++){
            for(var j = 0; j < max_y; j++){
                tile_id = i + '_' + j;
                tile = geometries[tile_id];
                var tile_texture = new Four.GLTexture(getImageUrl(sid, i, j, z));
                tile_texture.onload((function(t){
                    return function(){
                        var a = setInterval(function(){
                            t.opacity += 0.1; 
                            if(t.opacity >= 1){
                                clearInterval(a);
                            }
                        }, 16);
                    }
                })(tile.item));
                tile.item.bindTexture(tile_texture);
                tile.isLoaded = false;
                tiles[tile_id] = tile;
            }
        }
        return tiles;
    }
    
    var TileLayer = Four.util.extend(Layer, {
        init: function(container, fov){
            Layer.call(this, container, 1);

            var self = this;
            var heading = 0;
            var pitch = 0;
            var tiles;

            this.sid = 0;

            var viewWidth = container.clientWidth;
            var viewHeight = container.clientHeight;
            var fovY = this.fov = fov;
            var fovYHalf = fovY / 2;
            var fovX = viewWidth / viewHeight * fovY;
            var fovXHalf = fovX / 2;
            var thumb_tile;
            var geometries;

            var camera = new Four.PerspectiveCamera(fovY, viewWidth / viewHeight, 0.01, 1000);
            camera.lookAt(1, 0, 0);

            var scene =  new Four.GLScene();
            var renderer = new Four.GLRender(this.content);
            renderer.enableAlpha();


            var fill = new Four.geometry.Polygon(0.5, 60);
            fill.setConstColor(255, 255, 255, 0.8);
            fill.position(2, 0, 0);
            fill.rotate2(80, 270, 0);
            scene.add(fill);




            var updateViewPortTiles = function(){
                var one;
                var headingFilted = {};
                var selected = {};

                //随着pitch的上下变化，视野中heading所占的比例逐渐增加
                var scaleHeading = Math.abs(Math.sin(util.ang2rad(pitch)));

                var viewPitch = 90 - pitch; //to 0 - 90
                var minX = (heading - fovXHalf * (1 + scaleHeading)) % 360;
                var maxX = (heading + fovXHalf * (1 + scaleHeading)) % 360;

                var minY = viewPitch - fovYHalf;
                var maxY = viewPitch + fovYHalf;
                if(minY < 0 || maxY > 180){
                    //视野垂直越界之后,即可以看到完整的一周
                    minX = 0;
                    maxX = 360;
                }
                if(minX > maxX){
                    //视野左右边沿跨0度
                    //转成大于0和小于0的两部分
                    minX = minX - 360;
                }
                //filter heading first
                if(minX >= 0){
                    for(k in tiles){
                        one = tiles[k];
                        if(valueInRange(one.startXAng, minX, maxX) || valueInRange(one.endXAng, minX, maxX)){
                            headingFilted[k] = tiles[k];
                        }
                    }
                }else{
                    minX = 360 + minX;
                    for(k in tiles){
                        one = tiles[k];
                        if(valueInRange(one.startXAng, minX, 360) || valueInRange(one.startXAng, 0, maxX) 
                            || valueInRange(one.endXAng, minX, 360) || valueInRange(one.endXAng, 0, maxX)){
                            headingFilted[k] = tiles[k];
                        }
                    }
                }
                
                for(k in headingFilted){
                    one = headingFilted[k];
                    if(valueInRange(one.startYAng, minY, maxY) || valueInRange(one.endYAng, minY, maxY)){
                        selected[k] = tiles[k];
                    }
                }
                for(var name in selected){
                    scene.add(selected[name].item);
                    selected[name].item.texture.load();
                    //tiles[name].isLoaded = true;
                    delete tiles[name];
                }
            }
            var updateView = function(){
                //updateViewPortTiles();
                var phi = ANG_TO_RAD * ( 90 - pitch );
                var theta = ANG_TO_RAD * ( heading );
                // heading = 0, [x, y, z] = [1, 0, 0]
                var x = 1 * Math.sin( phi ) * Math.cos( theta );
                var y = 1 * Math.cos( phi );
                var z = 1 * Math.sin( phi ) * Math.sin( theta );
                camera.lookAt(x, y, z);
            }

            var redraw = function(){
                requestAnimationFrame(redraw);
                renderer.render(camera, scene);
            }
            redraw();

            this.setSid = function(sid){
                //标准模型
                if(!geometries){
                    geometries = createGeomerys(5, 4); 
                }
                //缩略图模型
                if(!thumb_tile){
                    //thumb_tile = createTiles('', 2, 1)['0_0'].item;
                    thumb_tile = new Four.geometry.Sphere(5, SPHERE_WIDTH_SEGMENTS, SPHERE_HEIGHT_SEGMENTS);
                    thumb_tile.scale(-1, 1, 1);
                    thumb_tile.setConstColor(255, 0, 0, 0);
                    scene.add(thumb_tile);
                }
                var thumb_texture = new Four.GLTexture(getImageUrl(sid, 0, 0, 1));
                thumb_tile.bindTexture(thumb_texture);
                thumb_tile.texture.load().onload(function(){
                    //缩略图完毕后开始替换瓦片
                    //500 testcode
                    //TODO 直接进行场景切换会有闪烁现象
                    setTimeout(function(){
                        tiles = createTiles(sid, 4, geometries);
                        self.emit('thumb_loaded');
                        updateViewPortTiles();
                    }, 500);
                });
            }
            this.setPov = function(new_heading, new_pitch){
                heading = new_heading;            
                pitch = new_pitch;
                updateView();
                updateViewPortTiles();
            }
            this.setFov = function(fov){
                if(fov === fovY){
                    return; 
                }
                fovY = this.fov = fov;
                fovYHalf = fovY / 2;
                fovX = viewWidth / viewHeight * fovY;
                fovXHalf = fovX / 2;
                camera.fov = fov * ANG_TO_RAD;
                camera.updateProjectionMatrix();
                updateViewPortTiles();
            }
            this.on('resize', function(width, height){
                width = width || this.content.clientWidth;
                height = height || this.content.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.viewPort(width, height);
            });

            this.add3DOverlay = function(obj){
                scene.add(obj); 
            }
            this.remove3DOverlay = function(obj){
                scene.remove(obj); 
            }
        }
    })

    return TileLayer;
});
