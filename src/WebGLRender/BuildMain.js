define(function(){
    var Four = {
        geometry:{},
        plugin:{}
    };
    Four.VER = "{{VER}}";

    Four.glMatrix = require('WebGLRender/lib/glMatrix');

    Four.util = require('WebGLRender/base/util');

    Four.GLScene = require('WebGLRender/GLScene');
    Four.GLRender = require('WebGLRender/GLRender');
    Four.GLTexture = require('WebGLRender/GLTexture')

    Four.PerspectiveCamera = require('WebGLRender/Camera/PerspectiveCamera')
    Four.OrthograhicCamera = require('WebGLRender/Camera/OrthograhicCamera')

    Four.geometry.Geometry = require('WebGLRender/geometry/Geometry')
    Four.geometry.GeometryGroup = require('WebGLRender/geometry/GeometryGroup')

    Four.geometry.Cube = require('WebGLRender/geometry/Cube')
    Four.geometry.Face = require('WebGLRender/geometry/Face')
    Four.geometry.Sphere = require('WebGLRender/geometry/Sphere')
    Four.geometry.Triangle = require('WebGLRender/geometry/Triangle')
    Four.geometry.Polygon = require('WebGLRender/geometry/Polygon')

    Four.plugin.DragController = require('WebGLRender/plugin/DragController')
    Four.plugin.TrackballController = require('WebGLRender/plugin/TrackballController')

    Four.ready = function(h){
        h(Four)
    };
    return Four;
});
