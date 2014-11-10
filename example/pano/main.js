Four.ready(function(){

    var container = document.getElementById('container');

    var pano = new Panorama(container, '0100220000130728113723966J3');
    return;

    var DragController = Four.plugin.DragController;   
    var container = document.getElementById('container');
    var camera =  new Four.GLCamera(55, container.clientWidth / container.clientHeight, 0.01, 1000);
    var scene =  new Four.GLScene();
    var renderer = new Four.GLRender(container);

    var dragController = new DragController(camera, container);


    var texture = new Four.GLTexture('../../image/pano1.jpg');
    var ball = new Four.geometry.Sphere(2, 60, 40);
    ball.bindTexture(texture);
    ball.position(0, 0, 0);
    ball.setConstColor(0, 0, 0, 1);
    ball.update();

    scene.add(ball);

    //camera.setPosition(8, 5, 10);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(1, 0, 0);

    window.onresize = function(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.viewPort(window.innerWidth, window.innerHeight);
    }

    var redraw = function(){
        requestAnimationFrame(redraw);
        renderer.render(camera, scene);
    }
    redraw();

    //auto play
    var ANG_TO_RAD = Math.PI / 180;

    var cameraRotate = function(){
        var heading = 0, pitch = 0, x, y, z;
        setInterval(function(){
            heading += 0.1;
            pitch = Math.max( - 85, Math.min( 85, pitch ) );

            var phi = ANG_TO_RAD * ( 90 - pitch );
            var theta = ANG_TO_RAD * ( heading );

            x = 1 * Math.sin( phi ) * Math.cos( theta );
            y = 1 * Math.cos( phi );
            z = 1 * Math.sin( phi ) * Math.sin( theta );

            camera.lookAt(x, y, z);
        }, 10);
    };
    //cameraRotate();
   
})

