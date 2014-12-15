define(function(){
    var getZoomSpan = (function(zoom){
        var cache = {};
        return function(zoom){
            if(cache[zoom]){
                return cache[zoom];
            }    
            cache[zoom] = Math.pow(2, (18 - zoom)) * 256;  //(this size is image source size, not draw size);
            return cache[zoom];
        } 
    })();
    var getCoord = function(viewWidth, viewHeight, center, z, tileSize, buffers){

        //var cW = this._mapCanvas.width;
        //var cH = this._mapCanvas.height;
        var cW = viewWidth;
        var cH = viewHeight;

        var lat = center.lat; 
        var lng = center.lng;
        var span = getZoomSpan(z);  //(this size is image source size, not draw size);
        var x = Math.floor(lng / span);
        var y = Math.floor(lat / span);

        var pos_x = tileSize * (lng / span - x);
        var pos_y = tileSize - tileSize * (lat / span - y);
        var drawX = cW / 2 - pos_x;
        var drawY = cH / 2 - pos_y;
        //blank space  [top, right, bottom, left]
        var blankSpace = [drawY, cW - drawX - tileSize, cH - drawY - tileSize, drawX].map(function(i, index){
            //parseInt
            return (i + 0.5) | 0;
        })
        if(buffers && buffers.length >= 4){
            //控制额外的buffer
            blankSpace = blankSpace.map(function(i, index){
                //parseInt
                return i + buffers[index];
            })
        }
        var buildedTiles = [];
        //center
        buildedTiles.push({
            'x':x,
            'y':y,
            'z':z,
            'size':tileSize,
            'drawX':drawX,
            'drawY':drawY
        });
        var round = 1;
        var dx = 0;
        var dy = 0;
        //防死循环
        while(1 && round < 10000){
            dx = -round;
            dy = round;
            if(blankSpace[0] > 0){
                while(1){
                    buildedTiles.push({
                        'x':dx + x,
                        'y':dy + y,
                        'z':z,
                        'size':tileSize,
                        'drawX':drawX + tileSize * dx,
                        'drawY':drawY - tileSize * dy
                    });
                    if(dx == round) break;
                    dx++;
                }
                blankSpace[0] -= tileSize;
            }else{
                dx = round;
            }
            dy--;
            if(blankSpace[1] > 0){
                while(1){
                    buildedTiles.push({
                        'x':dx + x,
                        'y':dy + y,
                        'z':z,
                        'size':tileSize,
                        'drawX':drawX + tileSize * dx,
                        'drawY':drawY - tileSize * dy
                    });
                    if(dy == -round) break;
                    dy--;
                }
                blankSpace[1] -= tileSize;
            }else{
                dy = -round;
            }
            dx--;
            if(blankSpace[2] > 0){
                while(1){
                    buildedTiles.push({
                        'x':dx + x,
                        'y':dy + y,
                        'z':z,
                        'size':tileSize,
                        'drawX':drawX + tileSize * dx,
                        'drawY':drawY - tileSize * dy
                    });
                    if(dx == -round) break;
                    dx--;
                }
                blankSpace[2]-= tileSize;
            }else{
                dx = -round;
            }
            dy++;
            if(blankSpace[3] > 0){
                while(1){
                    buildedTiles.push({
                        'x':dx + x,
                        'y':dy + y,
                        'z':z,
                        'size':tileSize,
                        'drawX':drawX + tileSize * dx,
                        'drawY':drawY - tileSize * dy
                    });
                    if(dy == round - 1) break;
                    dy++;
                }
                blankSpace[3] -= tileSize;
            }else{
                dy = round - 1;
            }
            var needAdd = blankSpace.some(function(n){return n > 0});
            if(!needAdd){
                break;
            }
            round++;
        }
        return buildedTiles;
    }

    return getCoord;
});
