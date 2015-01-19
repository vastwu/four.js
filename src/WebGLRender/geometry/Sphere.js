define(function(require){
    var GL_CONST = require('WebGLRender/base/GL_CONST');
    var Geometry = require('WebGLRender/geometry/Geometry');

    var copy = function(obj){
    	var r = {};
    	for(var k in obj){
    		r[k] = obj[k];
    	}
    	return r;
    }

    /**
     * 球模型，由z轴负半轴,顺时针开始创建顶点
     * @params radius 半径
     * @params widthSegments 横向精度
     * @params heightSegments 纵向精度
     * @params phiStart 横向起始弧度
     * @params phiLength 横向总长角度
     * @params thetaStart 纵向起始弧度
     * @params thetaLength 纵向总长角度
     * @return {undefined}
     */
    var Sphere = Geometry.extend(function(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength){

        Geometry.call(this);

        this.type = 'Sphere';
        this.doubleSide = true;
        this.drawType = GL_CONST.TRIANGLES;

		radius = radius || 50;

		var x, y, vertices = [], indexes = [], uvs = [],
			_x, _y, _z, indexOfVertices = -1;

		widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
		heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );

		phiStart = phiStart !== undefined ? phiStart : 0;
		phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

		thetaStart = thetaStart !== undefined ? thetaStart : 0;
		thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

		for ( y = 0; y <= heightSegments; y ++ ) {

			var verticesRow = [];
			var uvsRow = [];

			for ( x = 0; x <= widthSegments; x ++ ) {

				var u = x / widthSegments;
				var v = y / heightSegments;
                var _radius = radius * Math.sin( thetaStart + v * thetaLength );

                /*
				_x = _radius * Math.cos( phiStart + u * phiLength );
				_y = radius * Math.cos( thetaStart + v * thetaLength );
				_z = _radius * Math.sin( phiStart + u * phiLength );
                */
				_x = _radius * Math.sin( phiStart + u * phiLength );
				_z = -_radius * Math.cos( phiStart + u * phiLength );
				_y = radius * Math.cos( thetaStart + v * thetaLength );

				vertices.push({
					'x':_x,
					'y':_y,
					'z':_z,
				});

				indexOfVertices++;
				verticesRow.push(indexOfVertices);

                uvsRow.push({
                    'x':u,
                    'y':1 - v
                });
			}
			indexes.push( verticesRow );
			uvs.push( uvsRow );
		}

		var vec1, vec3, vec3, vec4,
			indexesOfSphere = [],
			indexesOfUvs = [],
			uvArray = [];

		//两极临近的圈少一半的面，其余圈为切分个数的2倍个面数
		var numberOfFace = (widthSegments * 2 + (2 * widthSegments * (heightSegments - 1)));
		//顶点数为面数 * 3
		var numberOfPoint = numberOfFace * 3;

		//每个顶点3个坐标
		var verticesArray = new Float32Array(numberOfPoint * 3);
		//uv二维坐标
		var uvArray = new Float32Array(numberOfPoint * 2);

		var vn = 0, un = 0;

		for ( y = 0; y < heightSegments; y ++ ) {
			for ( x = 0; x < widthSegments; x ++ ) {
				/*
				2 1
				3 4
				*/
				//顶点索引
				var i1 = indexes[ y ][ x + 1 ];
				var i2 = indexes[ y ][ x ];
				var i3 = indexes[ y + 1 ][ x ];
				var i4 = indexes[ y + 1 ][ x + 1 ];

				var uv1 = copy(uvs[ y ][ x + 1 ]);
				var uv2 = copy(uvs[ y ][ x ]);
				var uv3 = copy(uvs[ y + 1 ][ x ]);
				var uv4 = copy(uvs[ y + 1 ][ x + 1 ]);

				vec1 = vertices[i1];
				vec2 = vertices[i2];
				vec3 = vertices[i3];
				vec4 = vertices[i4];

				if(Math.abs(vec1.y) === radius){
                    //北极
					verticesArray[vn] 	  = vec1.x;
					verticesArray[vn + 1] = vec1.y;
					verticesArray[vn + 2] = vec1.z;
					verticesArray[vn + 3] = vec3.x;
					verticesArray[vn + 4] = vec3.y;
					verticesArray[vn + 5] = vec3.z;
					verticesArray[vn + 6] = vec4.x;
					verticesArray[vn + 7] = vec4.y;
					verticesArray[vn + 8] = vec4.z;
					vn += 9;

					uv1.x = ( uv1.x + uv2.x ) / 2;
					uvArray[un]     = uv1.x;
					uvArray[un + 1] = uv1.y;
					uvArray[un + 2] = uv3.x;
					uvArray[un + 3] = uv3.y;
					uvArray[un + 4] = uv4.x;
					uvArray[un + 5] = uv4.y;
					un += 6;
				}else if(Math.abs(vec3.y) === radius){
                    //南极
					verticesArray[vn] 	  = vec1.x;
					verticesArray[vn + 1] = vec1.y;
					verticesArray[vn + 2] = vec1.z;
					verticesArray[vn + 3] = vec2.x;
					verticesArray[vn + 4] = vec2.y;
					verticesArray[vn + 5] = vec2.z;
					verticesArray[vn + 6] = vec3.x;
					verticesArray[vn + 7] = vec3.y;
					verticesArray[vn + 8] = vec3.z;
					vn += 9;

					uv3.x = ( uv3.x + uv4.x ) / 2;
					uvArray[un]     = uv1.x;
					uvArray[un + 1] = uv1.y;
					uvArray[un + 2] = uv2.x;
					uvArray[un + 3] = uv2.y;
					uvArray[un + 4] = uv3.x;
					uvArray[un + 5] = uv3.y;
					un += 6;
				}else{
					verticesArray[vn] 	  = vec1.x;
					verticesArray[vn + 1] = vec1.y;
					verticesArray[vn + 2] = vec1.z;
					verticesArray[vn + 3] = vec2.x;
					verticesArray[vn + 4] = vec2.y;
					verticesArray[vn + 5] = vec2.z;
					verticesArray[vn + 6] = vec4.x;
					verticesArray[vn + 7] = vec4.y;
					verticesArray[vn + 8] = vec4.z;

					verticesArray[vn + 9] = vec2.x;
					verticesArray[vn +10] = vec2.y;
					verticesArray[vn +11] = vec2.z;
					verticesArray[vn +12] = vec3.x;
					verticesArray[vn +13] = vec3.y;
					verticesArray[vn +14] = vec3.z;
					verticesArray[vn +15] = vec4.x;
					verticesArray[vn +16] = vec4.y;
					verticesArray[vn +17] = vec4.z;
					vn += 18;

					uvArray[un] 	= uv1.x;
					uvArray[un + 1] = uv1.y;
					uvArray[un + 2] = uv2.x;
					uvArray[un + 3] = uv2.y;
					uvArray[un + 4] = uv4.x;
					uvArray[un + 5] = uv4.y;
					uvArray[un + 6] = uv2.x;
					uvArray[un + 7] = uv2.y;
					uvArray[un + 8] = uv3.x;
					uvArray[un + 9] = uv3.y;
					uvArray[un + 10] = uv4.x;
					uvArray[un + 11] = uv4.y;
					un += 12;
				}
			}
		}


        //顶点
        this.vertices = verticesArray;

        //贴图索引
        this.uv = uvArray;

        //不使用顶点索引方式
        this.indexes = null; //new Uint16Array(indexesOfSphere);
        this.numberOfIndexes = 0; //this.indexes.length;

        this.numberOfVertices = this.vertices.length / this.positionSize;

/*
        var colors = [
            255, 0, 0, 255,
            0, 250, 6, 255,
            0, 0, 255, 255
        ];
        this.setCustomColor(colors);
*/
    });
    return Sphere;
});

