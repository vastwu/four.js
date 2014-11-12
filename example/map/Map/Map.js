define(function(require){
    var Emiter = require('./Emiter');
    var Render = require('./WebglRender');
    var getCoord = require('./getCoord');
    var Tile = require('./Tile');


    var Map = function(container){
        Emiter.call(this);
        this.container = container;
        var viewWidth = container.clientWidth;
        var viewHeight = container.clientHeight;

        var renderer = new Render(container);

        var data = {};
        this._set = function(key, value){
            data[key] = value; 
        }
        this._get = function(key){
            return data[key];
        }
        this._set('zoom', 14);

        this._redraw = function(){
            var tilesDatas = getCoord(viewWidth, viewHeight, this._get('center'), this._get('zoom'), 256);
            var tiles = [];
            tilesDatas.forEach(function(d){
                var tile = new Tile(d.x, d.y, d.z); 
                tile.drawX = d.drawX;
                tile.drawY = d.drawY;
                tile.size = d.size;
                tiles.push(tile);
            });
            renderer.draw(tiles);
        }
    }
    var mp = Map.prototype = new Emiter();

    mp.moveTo = function(lat, lng){
        this._set('center', {
            'lat': lat,
            'lng': lng
        });
        this._redraw();
    }
    mp.setZoom = function(z){
        this._set('zoom', z);
        this._redraw();
    }
    return Map;
});
