Four.ready(function(){
	var Cube = Four.geometry.Cube;
	var Face = Four.geometry.Face;
	var Sphere = Four.geometry.Sphere;
	var Texture = Four.GLTexture;

	var Table = function(){
        this.children = [];

		var floor_texture = new Texture('../../image/rocks.jpg');
	    var floor = new Face();
        floor.bindTexture(floor_texture);
	    floor.scale(3, 3, 0);
	    floor.position(0, 0, -1);
        floor.rotate(1, 0, 0, -90);
	    floor.setConstColor(177, 177, 177, 1);
        floor.opacity = 0.5;
	    floor.update();
	    this.children.push(floor);

	    var tablePlan = new Cube();
	    tablePlan.scale(2, 0.1, 2);
	    tablePlan.position(0, 1, 0);
	    tablePlan.setConstColor(255, 0, 0, 1);
	    tablePlan.update();
        tablePlan.opacity = 0.7;
	    this.children.push(tablePlan);
	    
	    var tableLeg1 = new Cube();
	    tableLeg1.scale(0.1, 1, 0.1);
	    tableLeg1.position(1.9, -0.1, 1.9);
	    tableLeg1.setConstColor(0, 0, 255, 1);
	    tableLeg1.update();
	    this.children.push(tableLeg1);
	    
	    var tableLeg2 = new Cube();
	    tableLeg2.scale(0.1, 1, 0.1);
	    tableLeg2.position(-1.9, -0.1, -1.9);
	    tableLeg2.setConstColor(0, 0, 255, 1);
	    tableLeg2.update();
	    this.children.push(tableLeg2);
	    
	    var tableLeg3 = new Cube();
	    tableLeg3.scale(0.1, 1, 0.1);
	    tableLeg3.position(1.9, -0.1, -1.9);
	    tableLeg3.setConstColor(0, 0, 255, 1);
	    tableLeg3.update();
	    this.children.push(tableLeg3);

	    var tableLeg4 = new Cube();
	    tableLeg4.scale(0.1, 1, 0.1);
	    tableLeg4.position(-1.9, -0.1, 1.9);
	    tableLeg4.setConstColor(0, 0, 255, 1);
	    tableLeg4.update();
	    this.children.push(tableLeg4);

	    

	}
    
    window.MyTable = Table;
});
