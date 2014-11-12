define([
    'WebGLRender/GLScene',
    'WebGLRender/GLRender',
    'WebGLRender/GLTexture',

    'WebGLRender/Camera/PerspectiveCamera',
    'WebGLRender/Camera/OrthograhicCamera',

    'WebGLRender/geometry/Cube',
    'WebGLRender/geometry/Face',
    'WebGLRender/geometry/Sphere',
    'WebGLRender/geometry/Triangle',
    'WebGLRender/plugin/DragController'
    'WebGLRender/plugin/TrackballController'
], function(){
        var Four = {
            geometry:{}, 
            plugin:{}, 
        };
        var ag = [].slice.call(arguments);
        Four.GLScene = ag[0];
        Four.GLRender = ag[1];
        Four.GLTexture = ag[2];

        Four.PerspectiveCamera = ag[3];
        Four.OrthograhicCamera = ag[4];

        Four.geometry.Cube = ag[5];
        Four.geometry.Face = ag[6];
        Four.geometry.Sphere = ag[7];
        Four.geometry.Triangle = ag[8];

        Four.plugin.DragController = ag[9];
        Four.plugin.TrackballController = ag[10];

        Four.ready = function(h){
            h(Four) 
        };
        return Four;
    });
