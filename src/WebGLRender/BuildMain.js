define([
    'WebGLRender/GLCamera',
    'WebGLRender/GLScene',
    'WebGLRender/GLRender',
    'WebGLRender/GLTexture',

    'WebGLRender/geometry/Cube',
    'WebGLRender/geometry/Face',
    'WebGLRender/geometry/Sphere',
    'WebGLRender/geometry/Triangle',
    'WebGLRender/plugin/DragController'
], function(GLCamera, GLScene, GLRender, GLTexture, 
    g_cube, g_face, g_sphere, g_triangle, 
    p_DragController){
        var Four = {
            geometry:{}, 
            plugin:{}, 
        };
        Four.GLCamera = GLCamera;
        Four.GLScene = GLScene;
        Four.GLRender = GLRender;
        Four.GLTexture = GLTexture;

        Four.geometry.Cube = Cube;
        Four.geometry.Face = Face;
        Four.geometry.Sphere = Sphere;
        Four.geometry.Triangle = Triangle;

        Four.plugin.DragController = DragController;

        Four.ready = function(h){
            h(Four) 
        };
        return Four;
    });
