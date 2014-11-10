define(function(require){


    var Scene = function(){
        this._items = [];
    }
    var sp = Scene.prototype;

    sp.add = function(item){
        this._items.push(item); 
    }
    sp.getItems = function(){
        return this._items;
    }

    return Scene;
})
