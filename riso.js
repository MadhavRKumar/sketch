const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {

    let risographColors = 
    [ "#F6679D", "#EA3B2E", "#9B374C",
      "#348D5E", "#F4E557", "#FE713B",
      "#00767E", "#354163", "#5B5292"
    ]

    let 
    [
      pink, red, burgundy, green, yellow, orange, teal, blue, purple
    ] = risographColors;

    let palettes = [
      {
        bg: '#fffdf4',
        strokes: 
        [
          {value: pink, weight: 100},
          {value: purple, weight: 80},
          {value: blue, weight: 80}

        ]
      },

      {
        bg: '#fffdf4',
        strokes: 
        [
          {value: green, weight: 100},
          {value: teal, weight: 80},
          {value: burgundy, weight: 80}

        ]
      }
    ]

    let palette = getRandomElem(palettes);

    let bg = palette.bg;

    context.fillStyle = bg;
    context.fillRect(0, 0, width, height);
    let wMargin = 0;
    let hMargin = 0;




    //drawLeaf({x:width/2, y:height/2}, width/4);

    let size = width/8;
    //let points = [{x:width/2, y:height/2}]; //poisson(false, [], size);
    for(let i = 0; i < 3; i++) {

    let points = poisson(false, [], size);;


    for(let p of points) {
      context.lineWidth = 0.8;
      let color = random.weightedSet(palette.strokes) + 'FF';



      context.lineWidth = getRandom(2, 4);
      context.strokeStyle =color;

      let [l, mag] = leaf(p, random.gaussian(size, 2), getRandom(0.0075, 0.009));
    

      context.strokeStyle = bg; //Color.offsetHSL(context.strokeStyle, 0, 0, -8).hex;
      context.lineWidth = getRandom(6, 10);
      drawQuadraticLine(l,true, 0.01);
  
     
      context.lineWidth = getRandom(2, 4);

      drawLeaf(l, 0.1, getRandom(0.1, 0.3), mag)
    }

  }




    function leaf(p, size, tInc) {
      context.beginPath();
      a = random.noise3D(p.x, p.y, 1, getRandom(0.0001, 0.00025), 1) * 2 * Math.PI;
     //a += (Math.PI/filterPoints.length * 2);
     let x = Math.cos(a);
     let y = Math.sin(a);

     let center = {x: width/2, y: height/2}; //getClosest(p, centers);
     let toPoint = {x: p.x-center.x, y: p.y - center.y};
     let tanMag = dist(center.x, center.y, p.x, p.y);

     // let index = random.chance(0.7) ? Math.floor(map(tanMag, 0, circRad, 0, 3)) : getRandomInt(0, 3);
     // context.strokeStyle = colors[index];

     // toPoint.x /= tanMag;
     // toPoint.y /= tanMag;
     let chance = random.chance(0.5);
     // let x = chance ? toPoint.x : -toPoint.x;
     // let y = chance ? toPoint.y : -toPoint.y;
     // let [x, y] = random.onCircle();
     let mag = size / random.gaussian(Math.sqrt(2), 0.1)  * getRandom(0.75, 1);
     let leafPoints = new Array(3);


     leafPoints[0] = { x: p.x - x * mag, y: p.y - y * mag }
     leafPoints[2] = { x: p.x + x * mag, y: p.y + y * mag }

     let t = getRandom(0.5, 0.65);
     let controlP = getPointOnLine(leafPoints[0], leafPoints[2], t);

     let [offsetX, offsetY] = random.onCircle(mag*getRandom(0.2, 0.5));

     controlP.x += offsetX;
     controlP.y += offsetY;


     leafPoints[1] = controlP; //{ x: getRandom(minBound.x, maxBound.x), y: getRandom(minBound.y, maxBound.y) };
     context.closePath();
     let firstPass = true;

     for(let i = 0; i <= 0; i++) {
     let tStart = 0; firstPass ? 0 : 0.1;//getRandom(0.05, 0.05);

  
     drawLeaf(leafPoints, tStart, tInc, mag)
     firstPass = false;

     }

     return [leafPoints, mag];
   }
    


    function drawLeaf(leafPoints, tStart, tInc, mag) {
      for(let t = tStart; t < 1; t += tInc) {

        let p = getQuadraticPoint(leafPoints, t);
        let tan = getTangent(leafPoints, t);
        let normTan = normalize(tan);
        let perp1 = {x: -normTan.y, y: normTan.x};
        let perp2 = {x: perp1.x, y: perp1.y};
        let a = Math.atan2(perp1.y, perp1.x);
        perp1.x = Math.cos(a + Math.PI/4);
        perp1.y = Math.sin(a + Math.PI/4);
        
        perp2.x = Math.cos(a - Math.PI/4);
        perp2.y = Math.sin(a - Math.PI/4);
 
 
        let off = (mag/2) * Math.sin(t*Math.PI) + map(random.noise2D(p.x, p.y, 0.003), -1, 1, -0.1, 1)*100;
        let p1 = {x: p.x - perp1.x*off, y: p.y - perp1.y*off}
 
        let p2 = {x: p.x + perp2.x*off , y:  p.y + perp2.y*off}
 
        context.beginPath();
       //  context.moveTo(p.x, p.y);
 
       //  context.lineTo(p1.x, p1.y);
 
        drawLine(p, p1, {});
        context.stroke();
 
        context.closePath();
        
        context.beginPath();
       //  context.moveTo(p.x, p.y);
 
       //  context.lineTo(p2.x, p2.y);
       drawLine(p, p2, {});
        context.stroke();
 
        context.closePath();
 
 
    }
  }




    function getTangent(points, t) {
      let [p0, p1, p2]  = points;
      let point = {x: 0, y: 0};
  
      point.x = 2*(p0.x*(t-1) - p1.x*(2*t-1) + p2.x*t);
      point.y = 2*(p0.y*(t-1) - p1.y*(2*t-1) + p2.y*t);
  
      return point;
    }
  


    
    






    function intersects(line1, line2) {

      let x1 = line1.start.x;
      let y1 = line1.start.y;
      let x2 = line1.end.x;
      let y2 = line1.end.y;


      let x3 = line2.start.x;
      let y3 = line2.start.y;
      let x4 = line2.end.x;
      let y4 = line2.end.y;


      let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (denom == 0) {
        return;
      }

      let tNum = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);

      let t = tNum / denom;

      let uNum = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3));

      let u = uNum / denom;

      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        let point = { x: 0, y: 0 };
        point.x = (x1 + t * (x2 - x1));
        point.y = (y1 + t * (y2 - y1));
        return point;
      }

    }



    function drawRect(x, y, w, h, noFill) {
      let corner = { x: x, y: y };

      corner.x -= w / 2;
      corner.y -= h / 2;
      let path = new Path2D();
      drawLine({ x: corner.x, y: corner.y + h }, corner, { p: path, moveTo: true });
      drawLine(corner, { x: corner.x + w, y: corner.y }, { p: path, moveTo: false });
      drawLine({ x: corner.x + w, y: corner.y }, { x: corner.x + w, y: corner.y + h }, { p: path, moveTo: false })
      drawLine({ x: corner.x + w, y: corner.y + h }, { x: corner.x, y: corner.y + h }, { p: path, moveTo: false })
      if (!noFill)
        context.fill(path);
      context.stroke(path);
      path.closePath();

    }

    function drawLine(start, end, options) {
      let { p, moveTo, control } = options;
      let ctx = p || context;
      let distance = dist(start.x, start.y, end.x, end.y);
      let dt;

      if(distance < 50) {
        dt = 2;
      }
      else if (distance < 100) {
        dt = 1;
      }
      else if (distance < 200) {
        dt = 0.5;
      } else if (dist < 400) {
        dt = 0.3;
      } else if (dist < 600) {
        dt = 0.2;
      }
      else {
        dt = getRandom(0.09, 0.11);
      }


      if (moveTo) {
        ctx.moveTo(start.x, start.y);
      }
      let prev = start;
      for (let t = 0; t <= 2.0; t += dt) {
        let cur = getSquigglePoint(start, end, t, control);
        let tan = { x: start.x - end.x, y: start.y - end.y };
        let normal = { x: -tan.y, y: tan.x };
        normal = normalize(normal);
        let ctrl = getSquiggleControlPoint(prev, cur, normal);
        ctx.quadraticCurveTo(ctrl.x, ctrl.y, cur.x, cur.y);

        prev = cur;
      }



    }

    function getSquigglePoint(start, end, t, control) {
      let tau = t / 2.0;
      let polyTerm = 15 * Math.pow(tau, 4)
        - 6 * Math.pow(tau, 5)
        - 10 * Math.pow(tau, 3);
      if (control) {
        return getQuadraticPoint([start, control, end], tau);
      }
      else {
        return {
          x: start.x + (start.x - end.x) * polyTerm,
          y: start.y + (start.y - end.y) * polyTerm
        };
      }
    }

    function getSquiggleControlPoint(prev, cur, norm) {
      let midPoint = { x: (prev.x + cur.x) / 2, y: (prev.y + cur.y) / 2 };

      let xDisplace = getRandom(-5, 5);
      let yDisplace = getRandom(-5, 5);

      midPoint.x += (xDisplace * norm.x);
      midPoint.y += (yDisplace * norm.y);

      return midPoint;
    }


    function poisson(point, prePoints, radius, strokeSize, chance) {

      let r = radius || 20,
        cellSize = r / Math.sqrt(2),
        w = width,
        rows = Math.ceil(w / cellSize) + 1,
        cols = Math.ceil(w / cellSize) + 1;
      let grid = new Array(rows), active = [], points = [];

      if (prePoints) {
        points.push(...prePoints);
      }
      for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        for (let j = 0; j < cols; j++) {
          grid[i][j] = (null);
        }
      }

      let p0 = { x: getRandom(wMargin, width - wMargin), y: getRandom(wMargin, width - wMargin) };
      active.push(p0);
      points.push(p0);
      for (let p of points) {
        if (isValid(p, grid, cellSize, rows, cols, r))
          insertPoint(grid, cellSize, p);
      }

      while (active.length > 0) {
        let randomIndex = getRandomInt(0, active.length);
        let p = active[randomIndex];

        let found = false;

        for (let tries = 0; tries < 100; tries++) {
          let theta = getRandom(0, 2 * Math.PI);
          let curR = getRandom(r, 2 * r);
          let pNew = { x: p.x + curR * Math.cos(theta), y: p.y + curR * Math.sin(theta) }

          if (!isValid(pNew, grid, cellSize, rows, cols, r)) { continue };

          points.push(pNew);

          insertPoint(grid, cellSize, pNew);
          active.push(pNew);
          found = true;
          break;
        }

        if (!found) {
          active.splice(randomIndex, 1);
        }

      }


      context.lineCap = "round";
      let filterPoints = points.filter(p => !prePoints.includes(p));
      let val = random.gaussian(1, 0.05);
   

      return filterPoints;
    }

    function isValid(p, grid, cellsize, rows, cols, radius) {

      if (p.x < wMargin || p.x >= width - wMargin || p.y < hMargin || p.y >= height - hMargin) {
        return false;
      }
      let xIndex = Math.floor(p.x / cellsize);
      let yIndex = Math.floor(p.y / cellsize);
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let x = xIndex + i;
          let y = yIndex + j;
          if (x >= 0 && x < cols && y >= 0 && y < rows) {
            if (grid[y][x] !== null) {
              let pOther = grid[y][x];
              let dx = pOther.x - p.x;
              let dy = pOther.y - p.y;

              if (dx * dx + dy * dy < radius * radius)
                return false;
            }

          }
        }
      }

      return true;
    }

    function insertPoint(grid, cellsize, p0) {
      let x = Math.floor(p0.x / cellsize);
      let y = Math.floor(p0.y / cellsize);

      grid[y][x] = p0;
    }

    function drawQuadraticLine(points, draw, inc) {
      let tInc = inc || 0.001;
  
      let ps = [];
      context.beginPath();
  
      if(draw) {
      context.moveTo(points[0].x, points[0].y);
      context.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
      context.stroke();
      context.closePath();
      }
      context.beginPath();
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = getQuadraticPoint(points, t);
        ps.push(point);
      }
  
  
      context.closePath();
  
      return ps;
    }



    function getQuadraticPoint(points, t) {
      let omt = 1 - t;
      let omt2 = omt * omt;
      let t2 = t * t;
      let point = { x: 0, y: 0 };
      let [p0, p1, p2] = points;
      point.x = omt2 * p0.x + 2 * t * omt * p1.x + t2 * p2.x;

      point.y = omt2 * p0.y + 2 * t * omt * p1.y + t2 * p2.y;

      return point;
    }

    function getQuadraticTangent(points, t) {
      let [p0, p1, p2] = points;
      let point = { x: 0, y: 0 };

      point.x = 2 * (p0.x * (t - 1) - p1.x * (2 * t - 1) + p2.x * t);
      point.y = 2 * (p0.y * (t - 1) - p1.y * (2 * t - 1) + p2.y * t);

      return point;
    }

    function drawCubicLine(points, draw, inc) {
      let tInc = inc || 0.15;
      let ps = [];

      let prev = getCubicPoint(points, 0);
      context.beginPath();
      for (let t = tInc; t <= 1 + tInc; t += tInc) {
        let point = getCubicPoint(points, t);
        ps.push(point);


        if (draw) {
          drawLine(prev, point, {});
          context.stroke();
        }


        prev = point;

      }
      context.closePath();



      return ps;
    }



    function getCubicPoint(points, t) {
      let omt = 1 - t;
      let omt2 = omt * omt;
      let t2 = t * t;
      let point = { x: 0, y: 0 };

      point.x = points[0].x * (omt2 * omt) +
        points[1].x * (3 * omt2 * t) +
        points[2].x * (3 * omt * t2) +
        points[3].x * (t2 * t);

      point.y = points[0].y * (omt2 * omt) +
        points[1].y * (3 * omt2 * t) +
        points[2].y * (3 * omt * t2) +
        points[3].y * (t2 * t);

      return point;
    }

    // does not alter point, returns normalized vector
    function normalize(point) {
      let mag = Math.hypot(point.x, point.y);

      let p = { x: point.x / mag, y: point.y / mag };

      return p;
    }

    function dot(p1, p2) {
      return p1.x * p2.x + p1.y * p2.y;
    }

    function getPointOnLine(p1, p2, t) {
      if (p1.x !== p2.x) {
        let a = (p2.y - p1.y) / (p2.x - p1.x);

        let x = (p2.x - p1.x) * t + p1.x;

        let y = a * (x - p1.x) + p1.y;

        return { x, y, r: 10 };
      }
      else {
        let x = p1.x;
        let y = (p2.y - p1.y) * t + p1.y;

        return { x, y, r: 10 };

      }
    }

    function getRandom(min, max) {
      return random.value() * (max - min) + min
    }

    function map(n, start1, stop1, start2, stop2) {
      return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    }

    function quadMap(n, start1, stop1, start2, stop2) {
      let b = start2,
        c = stop2 - start2,
        t = n - start1,
        d = stop1 - start1;

      t /= d;

      return -c * t * (t - 2) + b
    }

    function getRandomElem(arr) {
      return arr[Math.floor(random.value() * arr.length)];
    }

    function getRandomInt(min, max) {
      return Math.floor(getRandom(min, max));
    }

    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    };

    function dist(x1, y1, x2, y2) {
      return Math.hypot(x1 - x2, y1 - y2);
    }
  };
};

canvasSketch(sketch, settings);
