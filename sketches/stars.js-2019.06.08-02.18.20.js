const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {

    let palettes = [
      {
        bg : '#000311',
        stroke : '#EFEFEF',
        secondary :'#f4db5d'
      },
      {
        bg : '#f4e6ba',
        stroke : '#c42021',
        secondary :'#050505'
      },
      {
        bg : '#050505',
        stroke : '#f4db5d',
        secondary :'#c42021'
      }
    ]

    let palette = getRandomElem(palettes);




    context.fillStyle = palette.bg;
    context.fillRect(0, 0, width, height);
    let wMargin = 0;
    let hMargin = 0;

    let options = {maxSize: width/4, tryLimit: 500, inc: 1};


    for(let count = 0; count < 3; count++ ) {
    let circles = circlePack(options);
    context.strokeStyle = palette.stroke;
    context.fillStyle = palette.stroke;
    // for(c of circles) {
    //   if(c.r > options.maxSize * 0.7) {
    //     drawCircle(c);
    //   }
    // }

    for(c of circles) {
      if(c.r <= options.maxSize) {
      context.beginPath();
      if(random.chance(1)) {
      context.arc(c.x, c.y, getRandom(0.5,2), 0, 2*Math.PI);
      context.fill();
      }
      context.closePath();

      let [p1, p2] = getClosestPoints(c, circles);

      // context.beginPath();
      // context.moveTo(p1.x, p1.y);
      // context.lineTo(c.x, c.y);
      // context.lineTo(p2.x, p2.y);
      // context.stroke();
      // context.closePath();

      let pp1 = {x: p1.x-c.x, y: p1.y-c.y};
      let mag = Math.hypot(pp1.x, pp1.y);
      pp1 = normalize(pp1)
      pp1.x *= (mag*0.25);
      pp1.y *= (mag*0.25);

      context.lineWidth = getRandom(0.5, 1.5);
      let drawCount = getRandomInt(2, 6);

      for(let i = 0; i < drawCount; i++) {
      drawLine({x:p1.x - pp1.x, y: p1.y - pp1.y}, {x:c.x+pp1.x, y:c.y+pp1.y}, {moveTo: true});
      if(random.gaussian(1) < 0.5) {
        context.strokeStyle = palette.secondary;
      }
      else {
        context.strokeStyle = palette.stroke;

      }
      context.stroke();  

    }
      // context.moveTo(p1.x - pp1.x, p1.y - pp1.y);
      // context.lineTo(c.x+pp1.x, c.y+pp1.y);
      if(random.chance(0.5)) {
        let pp2 = {x: p2.x-c.x, y: p2.y-c.y};
        mag = Math.hypot(pp2.x, pp2.y);
        pp2 = normalize(pp2)
        pp2.x *= (mag*0.25);
        pp2.y *= (mag*0.25);
        for(let i = 0; i < drawCount; i++) {

      drawLine({x:p2.x - pp2.x, y: p2.y - pp2.y}, {x:c.x+pp2.x, y:c.y+pp2.y}, {moveTo: true});
      if(random.gaussian(1) < 0.5) {
        context.strokeStyle = palette.secondary;
      }
      else {
        context.strokeStyle = palette.stroke;

      }
      context.stroke();
        }
      }
    }

    }
  }

    
    


    function  getClosestPoints(c, circles) {
      let copCirc = [...circles];
      copCirc.sort( (a,b) => {
        let x = (c.x - a.x);
        let x2 = x*x;

        let y = (c.y - a.y);
        let y2 = y*y;
        let dist1 = x2 + y2;

         x = (c.x - b.x);
         x2 = x*x;

         y = (c.y - b.y);
         y2 = y*y;
         let dist2 = x2 + y2;

        return (dist1-dist2);
      });

      return [copCirc[1], copCirc[2]];
    }





    function circlePack(options) {
      let {maxSize, tryLimit, inc} = options;
      let circles = [];
      let hMargin = 0/10;
      let wMargin = hMargin

      let i = 0;

      while(i < tryLimit) {
        let circ = {x: getRandom(wMargin, width-wMargin), y: getRandom(hMargin, height-hMargin), r: 1};
        let leeway = getRandom(0.1, 2);
        if(isValidCircle(circ, circles,leeway)) {
          i = 0;
          while(isValidCircle(circ, circles,leeway) && (circ.r < maxSize)) {
            circ.r += inc;
          }

          circles.push(circ);
        }

        i++;
      }
    
      
      function isValidCircle(circ, circles, leeway) {
        for(c of circles) {
          let x = (c.x - circ.x);
          let x2 = x*x;

          let y = (c.y - circ.y);
          let y2 = y*y;

          let r = circ.r + c.r;
          let r2 = r*r;

          if((x2 + y2) < (r2*leeway)) {
            return false;
          }
        }

        return true;
      }

      return circles;

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


    function drawCircle(c) {
      context.fillStyle = '#050505AA';
      let r = c.r;
      let x = Math.cos(0)*r + c.x;
      let y = Math.sin(0)*r + c.y;
      let path = new Path2D;

      path.moveTo(x,y);
      let inc = Math.PI/20;
      for(let a = inc; a <= 2*Math.PI; a += inc) {
        let x2 = Math.cos(a)*r + c.x;
        let y2 = Math.sin(a)*r + c.y;
        let end = {x: x2, y: y2};
        drawLine({x,y}, end, {p: path});

        x = x2;
        y = y2;
      }

      context.fill(path);
      path.closePath();
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
    //   for (let p of filterPoints) {
    //     if (strokeSize) {
    //       let d = dist(p.x, p.y, width / 2, height / 2);
    //       let lw = map(d, 0, Math.sqrt(2) * width / 2, strokeSize, 0);
    //       context.lineWidth = strokeSize; //random.gaussian(strokeSize, 0.05);
    //     }
    //     else {
    //       context.lineWidth = random.gaussian(2, 0.06);
    //     }


    //     if (point || random.value() < chance) {
    //       context.beginPath();
    //       context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
    //       context.stroke();
    //       context.closePath();
    //     }
    //     else {

    //       context.save();
    //       context.translate(p.x, p.y);
    //       context.rotate(getRandom(0, Math.PI*2))
    //       let center = {x: 0, y: 0};

    //       let lineSize = cellSize / random.gaussian(Math.sqrt(2), 0.1) * getRandom(0.75, 1);
    //       let dnaWidth = lineSize / getRandom(2, 5);

    //       let points = new Array(4);

    //       points[0] = { x: center.x - dnaWidth, y: center.y - lineSize }
    //       points[3] = { x: center.x + dnaWidth, y: center.y + lineSize }

    //       points[1] = { x: center.x - dnaWidth, y: points[0].y + 3 * lineSize / 4 }
    //       points[2] = { x: center.x + dnaWidth, y: points[3].y - 3 * lineSize / 4 }

    //       let points2 = new Array(4);

    //       points2[0] = { x: center.x + dnaWidth, y: center.y - lineSize }
    //       points2[3] = { x: center.x - dnaWidth, y: center.y + lineSize }

    //       points2[1] = { x: center.x + dnaWidth, y: points[0].y + 3 * lineSize / 4 }
    //       points2[2] = { x: center.x - dnaWidth, y: points[3].y - 3 * lineSize / 4 }

    //       if(random.chance(0.5)) {
    //         let temp = points;
    //         points = points2;
    //         points2 = temp;
    //       }

    //       drawCubicLine(points, true);
    //       let c = getCubicPoint(points, 0.5);
    //       context.beginPath();
    //       context.arc(c.x, c.y, 10, 0, Math.PI * 2);
    //       context.fill();
    //       context.closePath();
    //       drawCubicLine(points2, true);

    //       for (t = 0.1; t <= 0.4; t += 0.1) {
    //         let start = getCubicPoint(points, t);
    //         let end = getCubicPoint(points2, t);
    //         context.beginPath();
    //         drawLine(start, end, {});
    //         context.stroke();
    //         context.closePath();
    //       }

          
    //       for (t = 0.5; t <= 0.9; t += 0.1) {
    //         let start = getCubicPoint(points, t);
    //         let end = getCubicPoint(points2, t);
    //         context.beginPath();
    //         drawLine(start, end, {});
    //         context.stroke();
    //         context.closePath();
    //       }

    //       context.restore();

    //     }

    //   }

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

    function drawQuadraticLine(points, inc, ctx) {
      let tInc = inc || 1.0 / 10;
      let c = ctx || context;

      let ps = [];
      //context.beginPath();

      // if (draw) {
      //   context.moveTo(points[0].x, points[0].y);
      //   context.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
      //   context.stroke();
      //   context.closePath();
      // }
      c.beginPath();
      let prev = getQuadraticPoint(points, tInc / 5);
      ps.push(prev);
      for (let t = tInc; t <= 1 - tInc / 10; t += tInc) {
        let cur = getQuadraticPoint(points, t);
        ps.push(cur);
        drawLine(prev, cur, { p: c });
        c.stroke();
        // ps.push(point);
        prev = cur;
      }


      c.closePath();

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
