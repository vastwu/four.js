define(function(){

    var Geometry = Four.geometry.Geometry;

    var Border = Geometry.extend(function(radius, segments, width){
        Geometry.call(this);
        this.drawType = 'TRIANGLES'; //GL_CONST.TRIANGLES;
        var n = segments || 20;

        var innerRadius = radius || 0.5;
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

    var Fill = Geometry.extend(function(radius, segments){

        Geometry.call(this);

        this.drawType = 'TRIANGLES'; //GL_CONST.TRIANGLES;

        var n = segments || 20;
        radius = radius || 0.5;

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
        var border = new Border(radius, segments, 0.01); 
        var fill = new Fill(radius, segments); 

        this.zIndex = 2;
        this.children = [border, fill];

        border.position(3, 0, 1);
        border.rotate(-90, 270, 0);
        border.opacity = fill.opacity = 0;

        this.show = function(){
            border.opacity = 1;
            fill.opacity = 0.7; 
        }
        this.hide = function(){
            border.opacity = fill.opacity = 0; 
        }
        this.moveTo = function(vec3){
            var k = -1 / vec3[1];
            border.position(vec3[0] * k, vec3[1] * k, vec3[2] * k);
            border.update();
            fill.modelMatrix = border.modelMatrix;
        }

    }

    return MouseTracker;
});
