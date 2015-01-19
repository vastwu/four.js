    var Geometry = Four.geometry.Geometry;

    var CanvasArrow = Geometry.extend(function(dir){

        var screenOffsetX = 0;
        var screenOffsetY = 150;
        var centerOffsetX = 0;
        var centerOffsetY = -3.5;
        var text;

        //screenOffsetY = 0;

        this.dir = 0;

        Geometry.call(this);
        this.pointerInRange = false;

        var points = [
            0, 0, 0,   //第一组点用于绘制在中央的文字，不做为箭头的起笔位置

            0, 0, -3,
            2, 0, 0,

            1, 0, 0,
            1, 0, 2,
            -1, 0, 2,
            -1, 0, 0,

            -2, 0, 0
        ];
        var drawPoints = new Array(points.length / 3 * 2);

        for(var i = 0, n = points.length; i < n; i+= 3){
            points[i] += centerOffsetX;
            points[i + 2] += centerOffsetY;
        }
        //归一化
        points = points.map(function(p){
            return p / 6;
        });


        this.draw = function(ctx, viewWidth, viewHeight, pointerX, pointerY){
            ctx.translate(viewWidth / 2 + screenOffsetX, viewHeight / 2 + screenOffsetY);
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.lineWidth = 3;
            ctx.moveTo(drawPoints[2], drawPoints[3]);
            for(var i = 4, n = drawPoints.length; i < n; i+= 2){
                ctx.lineTo(drawPoints[i], drawPoints[i + 1]);
            }
            ctx.closePath();
            if(pointerX && pointerY){
                var isInPath = ctx.isPointInPath(pointerX, pointerY);
                if(isInPath){
                    ctx.lineWidth = 3.5;
                    ctx.strokeStyle = 'blue';
                    ctx.shadowColor = "RGBA(0, 0, 255, 0.7)";
                    if(this.pointerInRange === false){
                        this.onMouseIn();
                        this.pointerInRange = true;
                    }
                }else{
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = 'black';
                    ctx.shadowColor = "RGBA(0, 0, 0, 1)";
                    if(this.pointerInRange === true){
                        this.onMouseOut();
                        this.pointerInRange = false;
                    }
                }
            }else{
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = 'black';
                ctx.shadowColor = "RGBA(0, 0, 0, 1)";
            }

            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.fill();

            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = "center";
            ctx.fillText(text, drawPoints[0], drawPoints[1] + 6);
        }

        this.setDir = function(dir){
            if(dir > 22 && dir <= 67){
                text = '东北';
            }else if(dir > 67 && dir <= 112){
                text = '东';
            }else if(dir > 112 && dir <= 157){
                text = '东南'
            }else if(dir > 157 && dir <= 202){
                text = '南';
            }else if(dir > 202 && dir <= 247){
                text = '西南';
            }else if(dir > 247 && dir <= 292){
                text = '西';
            }else if(dir > 292 && dir <= 337){
                text = '西北';
            }else{
                text = '北';
            }
            this.dir = dir;
        }
        /*
         * @override
         * */
        this.onMouseIn = function(){};
        this.onMouseOut = function(){};
        this.onClick = function(){};

        this.updateDrawPoints = function(handler){
            handler(this.modelMatrix, points, drawPoints);
        }

        this.dispose = function(){
           this.onMouseIn = null;
           this.onMouseOut = null;
           this.onClick = null;
           this.pointerInRange = false;
        }

        //init
        if(dir !== undefined){
            this.setDir(dir);
        }
    });


    return CanvasArrow;
