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

    var dependencies = [
		'WebGLRender/GLScene',
    	'WebGLRender/GLRender',
		'WebGLRender/GLTexture',

		'WebGLRender/Camera/PerspectiveCamera',
		'WebGLRender/Camera/OrthograhicCamera',

		'WebGLRender/geometry/Cube',
		'WebGLRender/geometry/Face',
		'WebGLRender/geometry/Sphere',
    	'WebGLRender/geometry/Triangle',
    	'WebGLRender/geometry/Polygon',

    	'WebGLRender/plugin/DragController',
    	'WebGLRender/plugin/TrackballController',
    	'WebGLRender/plugin/MouseTracker'
    ];

	require(dependencies, function(){
        var ag = [].slice.call(arguments);

        dependencies.forEach(function(path, index){
            var name = path.split('/').pop(); 
            if(path.indexOf('geometry/') > -1){
                Four.geometry[name] = ag[index];
            }else if(path.indexOf('plugin/') > -1){
                Four.plugin[name] = ag[index];
            }else{
                Four[name] = ag[index];
            }
        })

        Four.fireReady();
    })

	window.Four = Four;
})();
