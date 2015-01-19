define(function(){

    var EPSILON = 0.0000000001;


    function SimplePolygonTriangulator(){

    }

    SimplePolygonTriangulator.prototype.process = function(contour){
        var result = [];
        /* allocate and initialize list of Vertices in polygon */
        var n = contour.length;
        if(n < 3){
          return result;
        }

        var V = new Array(n);
        /* we want a counter-clockwise polygon in V */
        if(0.0 < this.area(contour)){
          for(var v = 0; v < n; v++){
            V[v] = v;
          }
        }else{
          for(var v = 0; v < n; v++){
              V[v] = (n - 1) - v;
          }
        }

        var nv = n;
        /* remove nv-2 Vertices, creating 1 triangle every time */
        var count = 2 * nv; /* error detection */
        for(var v = nv - 1; nv > 2;){
            /* if we loop, it is probably a non-simple polygon */
            if (0 >= (count--)){
                /* Triangulate: ERROR - probable bad polygon! */
                return result;
            }

            /* three consecutive vertices in current polygon, <u,v,w> */

            /* previous */
            var u = v;
            if (nv <= u){
                u = 0;
            }

            /* new v */
            v = u + 1;
            if(nv <= v){
                v = 0;
            }

            /* next*/
            var w = v + 1;
            if (nv <= w){
                w = 0;
            }

            if(this.snip(contour, u, v, w, nv, V)){//clip
                var a, b, c, s, t;

                /* true names of the vertices */
                a = V[u];
                b = V[v];
                c = V[w];

                /* output Triangle */
                result.push(contour[a]);
                result.push(contour[b]);
                result.push(contour[c]);

                /* remove v from remaining polygon */
                for(s = v, t = v + 1; t < nv; s++,t++){
                    V[s] = V[t];
                }

                nv--;

                /* resest error detection counter */
                count = 2 * nv;
            }
        }

        return result;
    }

    SimplePolygonTriangulator.prototype.area = function(contour){
      var n = contour.length,
          A = 0.0;

      for(var p = n - 1, q = 0; q < n; p = q++){
          A += contour[p].x * contour[q].y - contour[q].x * contour[p].y;
      }
      return A * 0.5;
    }

    SimplePolygonTriangulator.prototype.snip = function(contour, u, v, w, n, V){
        var Ax, Ay, Bx, By, Cx, Cy, Px, Py;

        Ax = contour[V[u]].x;
        Ay = contour[V[u]].y;

        Bx = contour[V[v]].x;
        By = contour[V[v]].y;

        Cx = contour[V[w]].x;
        Cy = contour[V[w]].y;

        if(EPSILON > ((Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax))){
            return false;
        }

        for(var p = 0; p < n; p++){
            if((p == u) || (p == v) || (p == w)){
                continue;
            }
            Px = contour[V[p]].x;
            Py = contour[V[p]].y;
            if (this.insideTriangle(Ax, Ay, Bx, By, Cx, Cy, Px, Py)){
                return false;
            }
        }
        return true;
    }

    /*
     insideTriangle decides if a point P is Inside of the triangle
     defined by A, B, C.
    */
    SimplePolygonTriangulator.prototype.insideTriangle = function(Ax, Ay, Bx, By, Cx, Cy, Px, Py){
        var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy;
        var cCROSSap, bCROSScp, aCROSSbp;

        ax = Cx - Bx;
        ay = Cy - By;

        bx = Ax - Cx;
        by = Ay - Cy;

        cx = Bx - Ax;
        cy = By - Ay;

        apx= Px - Ax;
        apy= Py - Ay;

        bpx= Px - Bx;
        bpy= Py - By;

        cpx= Px - Cx;
        cpy= Py - Cy;

        aCROSSbp = ax * bpy - ay * bpx;
        cCROSSap = cx * apy - cy * apx;
        bCROSScp = bx * cpy - by * cpx;

        return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
    };
    return SimplePolygonTriangulator;
});
