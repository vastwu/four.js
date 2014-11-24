Four.ready(function(){
    var DragController = Four.plugin.DragController;
    

    var container = document.getElementById('container');

    var camera =  new Four.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.01, 1000);
    var scene =  new Four.GLScene();
    var renderer = new Four.GLRender(container);
    var controller = new Four.plugin.TrackballController(container, camera, 6);
    camera.lookAt(0, 0, 0);
    controller.setPosition(45, 45);

    renderer.enableAlpha();


    var face = new Four.geometry.Face();
    face.position(0, 0, 0);
    face.setConstColor(0, 0, 255, 1);

    face.vertices = [
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,  
        1.0, 1.0, 0.0, 

        1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];

    face.colors = [
        255, 0, 0, 255,
        0, 250, 6, 255,
        0, 0, 255, 255,

        255, 0, 0, 255,
        0, 250, 6, 255,
        0, 0, 255, 255
    ];
    face.numberOfVertices = 6;
    scene.add(face);

    //var table = new MyTable();
    //scene.add(table);
    //var fill = new Four.geometry.Sphere(1, 30, 20);
    //fill.scale(1, 1, 0);
    //scene.add(fill);

    var draw = function(){
        requestAnimationFrame(draw);
        renderer.render(camera, scene);
    }
    draw();

    //auto play
    var ANG_TO_RAD = Math.PI / 180;
    var R = 6;
    var around = function(){
        var x, y = 3, z;
        var angel = -90;
        setInterval(function(){
            angel += 0.5;
            x = Math.cos(angel * ANG_TO_RAD) * R;
            z = Math.sin(angel * ANG_TO_RAD) * R;
            camera.setPosition(x, y, z);
        }, 10);
    };
    //around();

    window.onresize = function(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.viewPort(window.innerWidth, window.innerHeight);
    }

    window.addTable = function(){
        if(!scene.include(table)){
            scene.add(table);
        }
    }
    window.removeTable = function(){
        if(scene.include(table)){
            scene.remove(table);
        }
    }

})

