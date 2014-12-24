define(function(){

    var MouseTracker = function(){
    
        var fill = new Four.geometry.Polygon(0.4, 60);
        fill.setConstColor(255, 255, 255, 0.8);
        fill.position(3, 0, 1);
        fill.rotate(-90, 270, 0);
        fill.opacity = 0;

        this.zIndex = 2;
        this.children = [fill];

        this.show = function(){
            fill.opacity = 1; 
        }
        this.hide = function(){
            fill.opacity = 0; 
        }
        this.moveTo = function(vec3){
            var k = -1 / vec3[1];
            fill.position(vec3[0] * k, vec3[1] * k, vec3[2] * k);
            fill.update();
        }
    };

    return MouseTracker;
});
