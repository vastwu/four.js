Four.ready(function(){
    var GLScene = Four.GLScene;
    var GLRender = Four.GLRender;
    var GLCamera = Four.GLCamera;

    var DragController = Four.plugin.DragController;
    

    var container = document.getElementById('container');

    var camera =  new GLCamera(65, container.clientWidth / container.clientHeight, 0.01, 1000);
    var scene =  new GLScene();
    var renderer = new GLRender(container);

    renderer.enableAlpha();

    var table = new MyTable();
    scene.add(table);


    //camera.setPosition(8, 5, 10);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(0, 0, 0);


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
    around();

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

