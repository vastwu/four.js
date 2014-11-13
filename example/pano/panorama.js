Four.ready(function(){

    var IMAGE_DOMAIN = 'http://pcsv2.map.bdimg.com/?qt=pdata&sid={svid}&pos={y}_{x}&z={z}&udt=20141108';
    var PANO_DATA_DOMAIN = 'http://pcsv0.map.bdimg.com/?qt=sdata&pc=1&sid={svid}';
    var SPHERE_WIDTH_SEGMENTS = 60; 
    var SPHERE_HEIGHT_SEGMENTS = 40; 

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

        dragController.onPovChanged = function(heading, pitch){
            view.innerHTML = 'heading:' + parseInt(heading) + ', pitch:' + parseInt(pitch); 
        }
    }
    var createTiles = function(svid, radius, z){
        /*
         * z = 1: 1 x 1
         * z = 2: 2 x 1
         * z = 3: 4 x 2
         * z = 4: 8 x 4
         *      : 2^(z-1) x 2^(z-2)
         * */
        var tiles = [];
        var max_x = Math.pow(2, z - 1);
        var max_y = z == 1 ? 1 : Math.pow(2, z - 2);
        var each_x_rad = Math.PI * 2 / max_x;
        var each_y_rad = Math.PI / max_y;
        var ws = SPHERE_WIDTH_SEGMENTS / max_x;
        var hs = SPHERE_HEIGHT_SEGMENTS / max_y;

        for(var i = 0; i < max_x; i++){
            for(var j = 0; j < max_y; j++){
                var tile_texture = new Four.GLTexture(getImageUrl(svid, i, j, z));
                var tile = new Four.geometry.Sphere(radius, ws, hs, 
                                                    each_x_rad * i, each_x_rad, 
                                                    each_y_rad * j, each_y_rad);
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
                tiles.push(tile);
            }
        }
        return tiles;
    }

    var Panorama = function(container, svid){
       
        var camera =  new Four.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.01, 1000);
        var scene =  new Four.GLScene();
        var renderer = new Four.GLRender(container);
        var dragController = new Four.plugin.DragController(camera, container);
        var mouseTracker = new Four.plugin.MouseTracker(container, camera);
        //scene.add(mouseTracker);
        renderer.enableAlpha();

        createViewer(container, dragController);
        
        var thumb_tile = createTiles(svid, 2, 1)[0];
        thumb_tile.texture.onload(function(){
            var tiles = createTiles(svid, 1, 4);
            tiles.forEach(function(t){
                scene.add(t);
            })
        });


        scene.add(thumb_tile);

        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 0;
        camera.lookAt(0, 0, -1);
        window.addEventListener('resize', function(){
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.viewPort(window.innerWidth, window.innerHeight);
        });
        var redraw = function(){
            requestAnimationFrame(redraw);
            renderer.render(camera, scene);
        }
        redraw();
    }



    window.Panorama = Panorama;
})
