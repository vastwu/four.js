    var Layer = require('common:widget/pano/module/PanoModule/WebglRender/layers/Layer.js');
    var config = require('common:widget/pano/module/PanoModule/WebglRender/config.js');
    var util = require('common:widget/pano/module/PanoModule/WebglRender/util.js');

    var IMAGE_DOMAIN = config.PANO_TILE_URL;
    var SPHERE_WIDTH_SEGMENTS = config.SPHERE_WIDTH_SEGMENTS;
    var SPHERE_HEIGHT_SEGMENTS = config.SPHERE_HEIGHT_SEGMENTS;
    var ANIMATION_MOVE_LENGTH = config.ANIMATION_MOVE_LENGTH;
    var ANIMATION_MOVE_DURATION = config.ANIMATION_MOVE_DURATION;
    var ANIMATION_MOVE_FUNC = config.ANIMATION_MOVE_FUNC;
    var TILE_FADE_IN_FUNC = config.TILE_FADE_IN_FUNC;
    var TILE_FADE_IN_DURATION = config.TILE_FADE_IN_DURATION;

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
                var tile = new Four.geometry.Sphere(radius, ws, hs,
                                                    start_x_rad, each_x_rad,
                                                    start_y_rad, each_y_rad);
                tile.opacity = 0;
                tile.needDraw = false;
                tile.setConstColor(255, 0, 0, 0);
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
                        util.animation(TILE_FADE_IN_DURATION, TILE_FADE_IN_FUNC, function(p){
                            t.opacity = p;
                        });
                    }
                })(tile.item));
                tile.item.needDraw = false;
                tile.item.opacity = 0;
                tile.item.bindTexture(tile_texture);
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
            var anim_thumb_tile;
            //根据偏北角的修正角
            var correctionY = 0;

            //0度角定义为看向-z
            var camera = new Four.PerspectiveCamera(fovY, viewWidth / viewHeight, 0.01, 1000);
            camera.lookAt(0, 0, -1);

            var scene =  new Four.GLScene();
            var renderer = new Four.GLRender(this.content);
            renderer.enableAlpha();


            //缩略图模型
            //缩略图精度减半
            var thumb_tile = new Four.geometry.Sphere(5, SPHERE_WIDTH_SEGMENTS / 2, SPHERE_HEIGHT_SEGMENTS / 2);
            thumb_tile.setConstColor(255, 0, 0, 0);
            scene.add(thumb_tile);

            //操作组, 组内的模型变换矩阵总是同一个引用，一同变化
            var geometryGroup = new Four.geometry.GeometryGroup();
            //标准模型
            var geometries = createGeomerys(5, 4);
            for(var name in geometries){
                scene.add(geometries[name].item);
                geometryGroup.bind(geometries[name].item);
            }
            geometryGroup.bind(thumb_tile);

            var updateViewPortTiles = function(){
                var one;
                var headingFilted = {};
                var selected = {};

                //随着pitch的上下变化，视野中heading所占的比例逐渐增加
                var scaleHeading = Math.abs(Math.sin(util.ang2rad(pitch)));

                var viewPitch = 90 - pitch; //to 0 - 90
                //此处视野判断要加上修正角
                var minX = (heading + correctionY - fovXHalf * (1 + scaleHeading)) % 360;
                var maxX = (heading + correctionY + fovXHalf * (1 + scaleHeading)) % 360;

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
                    selected[name].item.needDraw = true;
                    selected[name].item.texture.load();
                    delete tiles[name];
                }
            }
            var updateView = function(){
                //updateViewPortTiles();
                var phi = util.ang2rad( 90 - pitch );
                var theta =  util.ang2rad( heading );
                //phi = util.ang2rad( 90 - 0 );
                //theta =  util.ang2rad( 0 );
                // heading = 0, [x, y, z] = [0, 0, -1]
                //0度角定义为看向 -z
                var x = 1 * Math.sin( phi ) * Math.sin( theta );
                var y = 1 * Math.cos( phi );
                var z = -1 * Math.sin( phi ) * Math.cos( theta );
                camera.lookAt(x, y, z);
                console.info('lookAt: %f, %f, (%f,%f,%f)', heading, pitch, x, y, z);
            }

            var redraw = function(){
                requestAnimationFrame(redraw);
                renderer.render(camera, scene);
            }
            redraw();

            /**
             * animateToSid
             *
             * @param sid
             * @param moveDir 偏北角
             * @param nextGeometryHeading
             * @return {undefined}
             */
            var animateToSid = function(sid, moveDir, current_correctionY, next_correctionY, onFrame){

                if(!anim_thumb_tile){
                    anim_thumb_tile = new Four.geometry.Sphere(5, SPHERE_WIDTH_SEGMENTS / 2, SPHERE_HEIGHT_SEGMENTS / 2);
                    anim_thumb_tile.setConstColor(255, 0, 0, 0);
                }

                scene.insert(anim_thumb_tile);

                var moveRad = util.ang2rad(moveDir - 180);
                var moveX = Math.sin(moveRad) * ANIMATION_MOVE_LENGTH;
                var moveZ = -Math.cos(moveRad) * ANIMATION_MOVE_LENGTH;

                anim_thumb_tile.rotate(0, -next_correctionY, 0).position(-moveX, 0, -moveZ).update();

                var next_thumb_texture = new Four.GLTexture(getImageUrl(sid, 0, 0, 1));
                anim_thumb_tile.bindTexture(next_thumb_texture);
                self.emit('animation_start');
                anim_thumb_tile.texture.load().then(function(){
                    util.animation(ANIMATION_MOVE_DURATION, ANIMATION_MOVE_FUNC, function(p){
                        var px = moveX * p;
                        var pz = moveZ * p;
                        var id, gti, ngti;
                        var opacity = 1 - p;
                        if(p >= 1){
                            correctionY = -next_correctionY;
                            //replace texture
                            thumb_tile.bindTexture(next_thumb_texture);
                            thumb_tile.opacity = 1;

                            itemMatrix = thumb_tile.modelMatrix;
                            for(id in geometries){
                                //reset
                                gti = geometries[id].item;
                                gti.opacity = 0;
                                gti.needDraw = false;
                            }
                            tiles = createTiles(sid, 4, geometries);
                            geometryGroup.rotate(0, correctionY , 0).position(0, 0, 0).update();
                            updateViewPortTiles();
                            scene.remove(anim_thumb_tile);
                            onFrame(1);
                            self.emit('animation_finish');
                            return;
                        }
                        geometryGroup.position(px, 0, pz).update();
                        thumb_tile.opacity = opacity;
                        //变换矩阵相同，只需要计算一次
                        for(id in geometries){
                            gti = geometries[id].item;
                            gti.opacity = opacity;
                        }
                        anim_thumb_tile.position(moveX * (p - 1), 0, moveZ * ( p - 1));
                        anim_thumb_tile.update();
                        onFrame(p);
                    });
                });
            }
            this.getCamera = function(){
                return camera;
            };
            /**
             * updateGeomery 更新全景模型至新场景点，大于4个参数时使用动画过渡，其他情况直接切换
             *
             * @param sid
             * @param next_correctionY 切换目标场景的Y轴修正角
             * @param dir 前进方向，偏北角
             * @param current_correctionY 切换目标场景的Y轴修正角
             * @param onFrame
             * @return {undefined}
             */
            this.updateGeomery = function(sid, next_correctionY, dir, current_correctionY, onFrame){
                if(arguments.length >= 4){
                    //满足条件就使用动画形式
                    animateToSid(sid, dir, current_correctionY, next_correctionY, onFrame || util.doNothing);
                }else{
                    correctionY = -next_correctionY;
                    var thumb_texture = new Four.GLTexture(getImageUrl(sid, 0, 0, 1));
                    thumb_tile.bindTexture(thumb_texture);
                    thumb_tile.texture.load().then(function(){
                        geometryGroup.rotate(0, correctionY , 0).update();
                        for(id in geometries){
                            //如果之前的瓦片正在加载纹理，销毁掉
                            gti = geometries[id].item;
                            gti.texture && gti.texture.dispose();
                        }
                        self.emit('thumb_loaded');
                        //缩略图完毕后开始替换瓦片
                        tiles = createTiles(sid, 4, geometries);
                        updateViewPortTiles();
                    });
                }
            }
            this.setPov = function(new_heading, new_pitch){
                if(new_heading !== undefined){
                    heading = new_heading % 360;
                }
                if(new_pitch !== undefined){
                    pitch = new_pitch;
                }
                updateView();
                updateViewPortTiles();
            }
            this.getPov = function(){
                return {
                    'heading':heading,
                    'pitch':pitch
                }
            }
            this.setFov = function(fov){
                if(fov === fovY){
                    return;
                }
                fovY = this.fov = fov;
                fovYHalf = fovY / 2;
                fovX = viewWidth / viewHeight * fovY;
                fovXHalf = fovX / 2;
                camera.fov = util.ang2rad(fov);
                camera.updateProjectionMatrix();
                updateViewPortTiles();
            }
            this.on('resize', function(width, height){
                viewWidth = width = width || this.content.clientWidth;
                viewHeight = height = height || this.content.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.viewPort(width, height);
            });

            this.getVec3dFromScreenPixel = function(x, y){
                var pos = camera.unProject(x, y, viewWidth, viewHeight);
                return pos;
            }
            this.add3DOverlay = function(obj){
                scene.add(obj);
            }
            this.remove3DOverlay = function(obj){
                scene.remove(obj);
            }
        }
    })

    return TileLayer;
