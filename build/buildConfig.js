({
    baseUrl:"../src",
    name:"WebGLRender/BuildMain",
    out:"../dist/Four.js",
    wrap:true,
    onBuildWrite:(function(){
        var rdefineEnd = /\}\);?$/;
        var requireLineReg = /var[^\=]*=\s?require\(([^\)]*)\);?/g;
        var requireReg = /require\(([^\)]*)\);?/g;

        return function(name, path, contents){
        
            //console.log('onwrite:', name, path) 
            var paths = name.split('/');
            var var_name = paths.pop();
            
            contents = contents.trim();

            if(/BuildMain/.test(name)){
                contents = contents.replace( /define\([^{]*{/, "window.Four = (function(){" )
                    .replace( rdefineEnd, "})()" );
                contents = contents.replace(requireReg, function(full, match){
                    var fileName = match.split('/').pop();
                    fileName = fileName.replace(/['|"]/, "");
                    return fileName;
                });

                var now = new Date();
                var ver = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()].join('');
                contents = contents.replace("{{VER}}", ver);
            } else if(/Four\.js/.test(name)){
                //TODO support for the Four.js 
            }else{
                //define(factory)  =>  var xx = (function());
                contents = contents.replace( /define\([^{]*{/, "var " + var_name + " = (function(){" )
                            .replace( rdefineEnd, "})();" );
                contents = contents.replace(requireLineReg, '');
            }
            return contents;
        }
    })()
})
