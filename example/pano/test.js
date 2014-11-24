;(function(){
    var DOC = document;
    var loadJS = function(path, callback){
        var s = DOC.createElement('script');
        s.onload = function(){
            s.parentNode.removeChild(s); 
            callback();
        }
        s.onerror = function(){

        }
        DOC.body.appendChild(s);
        s.src = path;
    };

    loadJS('http://172.22.176.97/git/fourjs/dist/Four.js', function(){
        
        var IMAGE_DOMAIN = 'http://pcsv2.map.bdimg.com/?qt=pdata&sid={svid}&pos={y}_{x}&z={z}&udt=20141108';
        var PANO_DATA_DOMAIN = 'http://pcsv0.map.bdimg.com/?qt=sdata&pc=1&sid={svid}';
        var SPHERE_WIDTH_SEGMENTS = 60; 
        var SPHERE_HEIGHT_SEGMENTS = 40; 
        var ANG_TO_RAD = Math.PI / 180;
        var ang2rad = function(ang){
            return ANG_TO_RAD * ang;
        }
        var rad2ang = function(rad){
            return rad / ANG_TO_RAD;
        }
        var valueInRange = function(value, min, max){
            return value >= min && value <= max;
        }

        var jsonp = (function(){
            var body = document.body;
            var n = 0;
            var callbacks = window.CB = {};
            return function(src, callback){
                return new Promise(function(resolve, reject){
                    var script = document.createElement('script');
                    var cbid = '$cb_' + (++n);
                    callbacks[cbid] = function(result){
                        body.removeChild(script);
                        delete callbacks[cbid];
                        cbid = null;
                        callback(result);
                        resolve(result);
                    };
                    src += '&fn=window.CB.' + cbid;
                    body.appendChild(script);
                    script.src = src;
                });
            }
        })();

        /*
        var getScreenPerspectivePosition = function(camera, width, height){
            var leftTop = camera.getVec3dFromScreenPixel(0, 0, width, height);
            var rightTop = camera.getVec3dFromScreenPixel(width, 0, width, height);
            var leftBottom = camera.getVec3dFromScreenPixel(0, height, width, height);
            var rightBottom = camera.getVec3dFromScreenPixel(width, height, width, height);
            return [leftTop, rightTop, leftBottom, rightBottom];

            // var leftMiddle = camera.getVec3dFromScreenPixel(0, height / 2, width, height);
            // var rightMiddle = camera.getVec3dFromScreenPixel(width, height / 2, width, height);
            // var topMiddle = camera.getVec3dFromScreenPixel(width / 2, 0, width, height);
            // var bottomMiddle = camera.getVec3dFromScreenPixel(width / 2, height, width, height);
            return [topMiddle[1], rightMiddle, bottomMiddle, leftMiddle];
        }
        */
        var getImageUrl = function(svid, x, y, z){
            return IMAGE_DOMAIN.replace('{svid}', svid)
                                .replace('{x}', x || 0)
                                .replace('{y}', y || 0) 
                                .replace('{z}', z || 1);
        }

        var createViewer = function(container, dragController){
            var view = document.createElement('div');
            view.style.cssText = 'border:1px solid red;position:absolute;padding:10px;left:0;top:0;z-index:999;color:white;background-color:rgba(0,0,0,0.8)';
            container.appendChild(view);
            return view;
        }
        var createTiles = function(svid, radius, z){
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
            var each_x_rad = Math.PI * 2 / max_x;
            var each_y_rad = Math.PI / max_y;
            var ws = SPHERE_WIDTH_SEGMENTS / max_x;
            var hs = SPHERE_HEIGHT_SEGMENTS / max_y;
            var start_x_rad, start_y_rad;

            for(var i = 0; i < max_x; i++){
                for(var j = 0; j < max_y; j++){
                    start_x_rad = each_x_rad * i;
                    start_y_rad = each_y_rad * j;
                    var tile_texture = new Four.GLTexture(getImageUrl(svid, i, j, z));
                    var tile = new Four.geometry.Sphere(radius, ws, hs, 
                                                        start_x_rad, each_x_rad, 
                                                        start_y_rad, each_y_rad);
                    tile.opacity = 0;
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
                    //使用球内侧贴图,需要反转x轴坐标与贴图坐标的对应关系
                    tile.scale(-1, 1, 1);
                    tile.bindTexture(tile_texture);
                    tile.setConstColor(255, 0, 0, 0);
                    //tiles.push(tile);
                    tiles[i + '_' + j] = {
                        'item': tile,
                        'endXAng': rad2ang(start_x_rad + each_x_rad),
                        'endYAng': rad2ang(start_y_rad + each_y_rad),
                        'startXAng': rad2ang(start_x_rad),
                        'startYAng': rad2ang(start_y_rad)
                    };
                }
            }
            return tiles;
        }

        var Panorama = function(container, svid){
            var viewWidth = container.clientWidth;
            var viewHeight = container.clientHeight;
            var fovY = 65;
            var fovYHalf = fovY / 2;
            var fovX = viewWidth / viewHeight * fovY;
            var fovXHalf = fovX / 2;

            var camera =  new Four.PerspectiveCamera(fovY, viewWidth / viewHeight, 0.01, 1000);
            var scene =  new Four.GLScene();
            var renderer = new Four.GLRender(container);
            var dragController = new Four.plugin.DragController(camera, container, {
                minPitch:-20,
                maxPitch:85
            });
            //scene.add(mouseTracker);
            renderer.enableAlpha();

            var heading = 0;
            var pitch = 0;

            var headingPitchViewer = createViewer(container, dragController);
            dragController.onPovChanged = function(newHeading, newPitch){
                heading = newHeading;
                pitch = newPitch;
                updateViewPortTiles();
                headingPitchViewer.innerHTML = 'heading:' + parseInt(heading) + ', pitch:' + parseInt(pitch); 
            }
            
            
            var updateViewPortTiles = function(){
                var one;
                var headingFilted = {};
                var selected = {};

                //随着pitch的上下变化，视野中heading所占的比例逐渐增加
                var scaleHeading = Math.abs(Math.sin(ang2rad(pitch)));

                var viewPitch = 90 - pitch; //to 0 - 90
                var minX = heading - fovXHalf * (1 + scaleHeading);
                var maxX = heading + fovXHalf * (1 + scaleHeading);

                var minY = viewPitch - fovYHalf;
                var maxY = viewPitch + fovYHalf;
                if(minY < 0 || maxY > 180){
                    //视野垂直越界之后,即可以看到完整的一周
                    minX = 0;
                    maxX = 360;
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
                    delete tiles[name];
                }
            }
            var tiles = createTiles(svid, 1, 4);
            var thumb_tile = createTiles(svid, 2, 1)['0_0'].item;
            thumb_tile.texture.load().onload(function(){
                updateViewPortTiles();
            });

            scene.add(thumb_tile);

            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 0;
            dragController.setFov(heading, pitch);
            window.addEventListener('resize', function(){
                viewWidth = container.clientWidth;
                viewHeight = container.clientHeight;
                camera.aspect = viewWidth / viewHeight;
                fovX = viewWidth / viewHeight * fovY;
                fovXHalf = fovX / 2;
                camera.updateProjectionMatrix();
                renderer.viewPort(viewWidth, viewHeight);
            });
            var redraw = function(){
                requestAnimationFrame(redraw);
                renderer.render(camera, scene);
            }
            redraw();
        }
        var pp = Panorama.prototype;

        pp.setSid = function(sid){

        }

        var container = document.createElement('div');
        container.style.cssText = 'position:absolute;z-index:99999999;left:0;top:0;width:100%;height:100%';
        document.body.appendChild(container);
        var pano = new Panorama(container, '0100220000130829094125300J3');
    });

})();
