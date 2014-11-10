(function(){
	
	var _handlers = [];
	var Four = {
		geometry:{},
		plugin:{},
		ready: function(h){
			_handlers.push(h);
		},
		fireReady: function(){
			Four.ready = function(h){
				h(Four);
			}
			while(_handlers.length){
				_handlers.shift()(Four);
			}
		}
	};

	require.config({
		paths: {
        	"WebGLRender": "../../src/WebGLRender"
    	},
	});

	require([
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
			Four.GLCamera = GLCamera;
			Four.GLScene = GLScene;
			Four.GLRender = GLRender;
			Four.GLTexture = GLTexture;

			Four.geometry.Cube = g_cube;
			Four.geometry.Face = g_face;
			Four.geometry.Sphere = g_sphere;
			Four.geometry.Triangle = g_triangle;

			Four.plugin.DragController = p_DragController;

			Four.fireReady();
		})

	window.Four = Four;
})();
