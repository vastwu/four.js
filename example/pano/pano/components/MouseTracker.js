define(function(){

    var Geometry = Four.geometry.Geometry;

    var TrackerBorder = Geometry.extend(function(radius, segments, width){
        Geometry.call(this);
        this.drawType = 'TRIANGLES'; //GL_CONST.TRIANGLES;
        var n = segments;

        var innerRadius = radius;
        var outerRadius = innerRadius + width;

        var rad, ix, iy, ox, oy, i, eachRad = Math.PI * 2 / n;
        var innerVertices = [];
        var outerVertices = [];
        var indexes = [];

        //双层外边构成有宽度的圆环
        for(i = 0; i < n; i++){
            rad = eachRad * i;
            ix = Math.cos(rad) * innerRadius;
            iy = Math.sin(rad) * innerRadius;
            ox = Math.cos(rad) * outerRadius;
            oy = Math.sin(rad) * outerRadius;

            innerVertices.push(ix);
            innerVertices.push(iy);
            innerVertices.push(0);

            outerVertices.push(ox);
            outerVertices.push(oy);
            outerVertices.push(0);
        }

        for(i = 0; i < n; i++){
            if(i === n - 1){
                indexes.push(i);
                indexes.push(n);
                indexes.push(i + n);

                indexes.push(i);
                indexes.push(0);
                indexes.push(n);
            }else{
                indexes.push(i);
                indexes.push(i + n + 1);
                indexes.push(i + n);

                indexes.push(i);
                indexes.push(i + 1);
                indexes.push(i + n + 1);
            }
        }

        var vertices = outerVertices.concat(innerVertices);

        this.vertices = new Float32Array(vertices);
        this.indexes = new Float32Array(indexes);

        this.elementsToArray();

        this.setConstColor(255, 255, 255, 1);
    });

    var TrackerFill = Geometry.extend(function(radius, segments){

        Geometry.call(this);

        this.drawType = 'TRIANGLES'; //GL_CONST.TRIANGLES;

        var n = segments;
        radius = radius;

        var rad, x, y, z, i, eachRad = Math.PI * 2 / n;
        var vertices = [0, 0, 0];
        var indexes = [];

        for(i = 0; i < n; i++){
            rad = eachRad * i;
            x = Math.cos(rad) * radius;
            y = Math.sin(rad) * radius;
            z = 0;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);

            if(i < n - 1){
                indexes.push(0);
                indexes.push(i + 1);
                indexes.push(i + 2);
            }else{
                indexes.push(0);
                indexes.push(n);
                indexes.push(1);
            }

        }

        this.vertices = new Float32Array(vertices);
        this.indexes = new Float32Array(indexes);

        this.elementsToArray();

        this.setConstColor(255, 255, 255, 0.8);
    });



    var MouseTracker = function(radius, segments){
        radius = radius || 0.5;
        segments = segments || 40;
        var border = new TrackerBorder(radius, segments, 0.01);
        var fill = new TrackerFill(radius, segments);

        this.children = [border, fill];


        border.position(3, 0, 1);
        border.rotate(-90, 270, 0);
        border.opacity = 1;
        fill.opacity = 0.7;

        //2d 文本
        var moveText2D = this.text = {
            x:200,
            y:200,
            text:'',
            needDraw:true,
            draw:function(ctx){
                if(this.needDraw){
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 3;
                    ctx.shadowColor = "RGBA(0, 0, 0, 1)";
                    ctx.shadowBlur = 4;
                    ctx.fillStyle = '#FFF';
                    //ctx.strokeStyle = '#000';
                    ctx.font = '16px sans-serif';
                    ctx.textAlign = "center";
                    ctx.fillText(this.text, this.x, this.y);
                }
            }
        };
        this.show = function(){
            border.needDraw = fill.needDraw = true;
            moveText2D.needDraw = true;
        }
        this.hide = function(){
            border.needDraw = fill.needDraw = false;
            moveText2D.needDraw = false;
        }
        this.isVisible = function(){
            return border.needDraw === true;
        }
        this.setCenter = function(x, y, z){
            border.position(x, y, z);
            border.update();
            fill.modelMatrix = border.modelMatrix;
        }
        this.setScreenPosition = function(x, y){
            moveText2D.x = x;
            moveText2D.y = y + 40;
        }
        this.setText = function(text){
            moveText2D.text = text;
        }
    }

    return MouseTracker;
});
