({
    baseUrl:"../",
    name:"src/PhotoViewer",
    out:"../dist/PhotoViewer_noAMD.js",
    wrap:false,
    onBuildWrite:(function(){
        var rdefineEnd = /\}\);?$/;
        var requireReg = /var[^\=]*=\s?require\(([^\)]*)\);?/g;

        return function(name, path, contents){
        
            //console.log('onwrite:', name, path) 
            var paths = name.split('/');
            var var_name = paths.pop();
            
            contents = contents.trim();
            if(/PhotoViewer/.test(name)){
                contents = contents.replace( /define\([^{]*{/, "module.exports = (function(){" )
                            .replace( rdefineEnd, "})()" );
            }else if(/three/.test(name)){
                //define(factory)  =>  var xx = (function());
                contents = contents.replace( /define\([^{]*{/, "var THREE = (function(){" )
                            .replace( rdefineEnd, "})();" );
            }else{
                //define(factory)  =>  var xx = (function());
                contents = contents.replace( /define\([^{]*{/, "var " + var_name + " = (function(){" )
                            .replace( rdefineEnd, "})();" );
            }
            //remove require
            contents = contents.replace(requireReg, '');
            return contents;
        }
    })()
})
