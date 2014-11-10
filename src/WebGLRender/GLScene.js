define(function(require){


    var Scene = function(){
        this.children = [];
    }
    var sp = Scene.prototype;

    sp.getChildren = function(){
        return this.children;
    }
    sp.add = function(c){
        this.children.push(c); 
    }
    sp.remove = function(c){
        for(var i = 0, n = this.children.length; i < n; i++){
            if(c === this.children[i]){
                this.children.splice(i, 1);
                return c;
            }
        } 
        return null;
    }
    sp.include = function(tc){
        return this.children.some(function(c){
            return tc === c; 
        })
    }

    return Scene;
})
