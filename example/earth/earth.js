Four.ready(function(){

    var IMAGE_DOMAIN = 'http://pcsv2.map.bdimg.com/?qt=pdata&sid={svid}&pos={y}_{x}&z={z}&udt=20141108';
    var SPHERE_WIDTH_SEGMENTS = 60; 
    var SPHERE_HEIGHT_SEGMENTS = 40; 


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
                var tile_texture = new Four.GLTexture('../../image/earth.png');
                //var tile_texture = new Four.GLTexture(getImageUrl(svid));
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
                //tile.scale(-1, 1, 1);
                tile.bindTexture(tile_texture);
                tile.setConstColor(0, 0, 0, 0);
                tile.update();
                tiles.push(tile);
            }
        }
        return tiles;
    }

    var Earth = function(container, svid){
       
        //var camera =  new Four.OrthograhicCamera(window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / -2, window.innerWidth / -2, 0.01, 1000);
        var camera =  new Four.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 1000);
        var scene =  new Four.GLScene();
        var renderer = new Four.GLRender(container);
        //renderer.enableAlpha();
        var controller = new Four.plugin.TrackballController(container, camera, 20);

        camera.lookAt(0, 0, 0);
        controller.setPosition(45, 45);

        var balls = [];
        //createViewer(container, dragController);
        

        var detla = 3;
        var x = 2, 
            y = 2, 
            z = 2;
        var offx = x * 0.5 * detla - 0.5 * detla;
        var offy = y * 0.5 * detla - 0.5 * detla;
        var offz = z * 0.5 * detla - 0.5 * detla;

        for(var k = 0; k < z; k++){
            for(var j = 0; j < y; j++){
                for(var i = 0; i < x; i++){
                    var thumb_tile = createTiles(svid, 1, 1)[0];
                    thumb_tile.position( i * detla - offx, j * detla - offy, k * detla - offz);
                    thumb_tile.update();
                    scene.add(thumb_tile);
                    balls.push(thumb_tile);
                }
            }
        }


        var cameraAng = 0;
        var cameraRadius = 20;
        var ANG_TO_RAD = Math.PI / 180;
        var x, y = 8, z;
        var ang = 0;

        setInterval(function(){
            ang += 3;
            balls.forEach(function(b){
                //b.reset().rotate(0, 1, 0, ang += 0.5).position();
                b.reset().position().rotate(0, 1, 0, ang);
            })
            return;
            cameraAng -= 1;
            x = Math.cos(ANG_TO_RAD * cameraAng) * cameraRadius;
            z = Math.sin(ANG_TO_RAD * cameraAng) * cameraRadius;
            camera.setPosition(x, y, z);
        }, 16);


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



    window.Earth = Earth;
})
