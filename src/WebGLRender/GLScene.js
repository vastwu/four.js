define(function(require){


    var Scene = function(){
        this.children = [];
    }
    var sp = Scene.prototype;

    sp.getChildren = function(){
        return this.children;
    }
    sp.has = function(c){
        return this.children.indexOf(c) === -1 ? false : true;
    }
    sp.insert = function(c){
        this.children.unshift(c);
    }
    sp.add = function(c){
        this.children.push(c);
    }
    sp.remove = function(c){
        var i = this.children.indexOf(c);
        if(i !== -1) {
            this.children.splice(i, 1);
            return c;
        }
        return null;
    }

    return Scene;
})
