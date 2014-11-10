({
    baseUrl:"../src",
    name:"WebGLRender/BuildMain",
    out:"../dist/Four.js",
    wrap:true,
    onBuildWrite:(function(){
        var rdefineEnd = /\}\);?$/;
        var requireReg = /var[^\=]*=\s?require\(([^\)]*)\);?/g;

        return function(name, path, contents){
        
            //console.log('onwrite:', name, path) 
            var paths = name.split('/');
            var var_name = paths.pop();
            
            contents = contents.trim();

            if(/BuildMain/.test(name)){
                contents = contents.replace( /define\([^{]*{/, "window.Four = (function(){" )
                    .replace( rdefineEnd, "})()" );
            }else{
                //define(factory)  =>  var xx = (function());
                contents = contents.replace( /define\([^{]*{/, "var " + var_name + " = (function(){" )
                            .replace( rdefineEnd, "})();" );
            }
            contents = contents.replace(requireReg, '');
            return contents;
        }
    })()
})
