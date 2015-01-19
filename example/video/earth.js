Four.ready(function(){

    var IMAGE_DOMAIN = 'http://pcsv2.map.bdimg.com/?qt=pdata&sid={svid}&pos={y}_{x}&z={z}&udt=20141108';
    var SPHERE_WIDTH_SEGMENTS = 60;
    var SPHERE_HEIGHT_SEGMENTS = 40;


    var Earth = function(container, svid){

        var self = this;
        //var camera =  new Four.OrthograhicCamera(window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / -2, window.innerWidth / -2, 0.01, 1000);
        var camera =  new Four.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
        var scene =  new Four.GLScene();
        var renderer = new Four.GLRender(container);
        renderer.setClearColor(255, 255, 255, 1);
        var dragController = new Four.plugin.DragController(camera, container);
        //renderer.enableAlpha();

        camera.lookAt(1, 0, 0);
        camera.setPosition(0, 0, 0);

        var tile_texture = new Four.GLTexture('../../image/earth.png');
        var tile = new Four.geometry.Sphere(1, 64, 32);
        tile.bindTexture(tile_texture);

        //tile_texture.load(document.getElementById('video_texture'));
        //tile_texture.load(document.getElementById('video_player'));
        //tile_texture.load();
        scene.add(tile);


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

        this.clearBuffer = function(){
            tile_texture.needUpdate = true;
        }
        this.setTexture = function(elem){
            tile_texture.load(elem);
        }
        this.render = function(){
            renderer.render(camera, scene);
        }
    }



    window.Earth = Earth;
})
