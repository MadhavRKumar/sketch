const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 2048, 2048 ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    let w = width/10;
    let h = height/5;
    poisson(false, [], 25, 0.05);

    context.lineWidth = 2;
    for(let y = height/2.5; y <= height + h; y += getRandom(h/2, h)) {
      let c = random.chance(0.5);
      for(let x = c ? -w/2 : width + w/2; x <= width + w && x >= -w; x = c ? x+getRandom(w/1.5, w) : x-getRandom(w/1.5,w)) {
        drawBuilding(x, y, getRandom(w/1.1, w*1.5), getRandom(h, h*3));
      
    }
  }



    function drawBuilding(x, y, w, h) {
      let windowW = w/2.5;
      let windowH = h/10;
      drawRect(x, y, w, h);
    }

    function drawRect(x, y, w, h) {
      let corner = {x: x, y: y};

      corner.x -= w/2;
      corner.y -= h/2;
      let path = new Path2D();
      drawLine({x: corner.x, y: corner.y + h}, corner, path, true);
      drawLine(corner, {x: corner.x + w, y: corner.y}, path, false);
      drawLine({x: corner.x + w, y: corner.y}, {x: corner.x + w, y: corner.y + h}, path, false)
      drawLine({x: corner.x + w, y: corner.y + h}, {x: corner.x, y: corner.y + h}, path, false)
      context.fill(path);
      context.stroke(path);
      path.closePath();

    }




    function drawLine(start, end, p, moveTo) {
      let ctx = p || context;
      let distance = dist(start.x, start.y, end.x, end.y);
      let dt;
      
      if (distance < 100) {
        dt = 1;
      }
      else if (distance < 200) {
        dt = 0.5;
      } else if (dist < 400) {
        dt = 0.3;
      } else {
        dt = 0.2;
      }


      if(moveTo) {
      ctx.moveTo(start.x, start.y);
      }
      let prev = start;
      for(let t = 0; t <= 2.0; t += dt) {
        let cur = getSquigglePoint(start, end, t);
        let tan = {x: start.x - end.x, y: start.y - end.y};
        let normal = {x:-tan.y, y: tan.x};
        nomral = normalize(normal);
        let ctrl = getSquiggleControlPoint(prev, cur, normal);
        ctx.quadraticCurveTo(ctrl.x, ctrl.y, cur.x, cur.y);

        prev = cur;
      }

      

    }

    function getSquigglePoint(start, end, t) {
      let tau = t/2.0;
      let polyTerm = 15 * Math.pow(tau, 4)
                    - 6 * Math.pow(tau, 5)
                    - 10 * Math.pow(tau, 3);

      return {x: start.x + (start.x - end.x) * polyTerm,
              y: start.y + (start.y - end.y) * polyTerm};
    }

    function getSquiggleControlPoint(prev, cur, norm) {
      let midPoint = { x: (prev.x + cur.x)/2, y: (prev.y + cur.y)/2 };
      
      let xDisplace = getRandom(-5, 5);
      let yDisplace = getRandom(-5, 5);

      midPoint.x += (xDisplace*norm.x);
      midPoint.y += (yDisplace*norm.y);

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

      let p0 = { x: getRandom(0, width), y: getRandom(0, height/3) };
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
      for (let p of filterPoints) {
        if (strokeSize) {
          let d = dist(p.x, p.y, width / 2, height / 2);
          let lw = map(d, 0, Math.sqrt(2) * width / 2, strokeSize, 0);
          context.lineWidth = random.gaussian(strokeSize, 0.05);
        }
        else {
          context.lineWidth = random.gaussian(3, 0.06);
        }


        if (point || random.value() < chance) {
          context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
          context.stroke();
        }
        else {
          let mag = cellSize/random.gaussian(3, 0.5);

          for(let a = Math.PI/4; a <= Math.PI;  a += Math.PI/4) {
            let start = {x: p.x + Math.cos(a)*mag, y: p.y + Math.sin(a)*mag};
            let end = {x: p.x + Math.cos(a+Math.PI)*mag, y: p.y + Math.sin(a+Math.PI)*mag};
            drawLine(start, end, null, true);
            context.stroke();
          }

        }

      }
    }

    function isValid(p, grid, cellsize, rows, cols, radius) {

      if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height/3) {
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
      point.x = omt2*p0.x + 2*t*omt*p1.x + t2*p2.x;
  
      point.y = omt2*p0.y + 2*t*omt*p1.y + t2*p2.y;
  
      return point;
    }
  
    function getQuadraticTangent(points, t) {
      let [p0, p1, p2]  = points;
      let point = {x: 0, y: 0};
  
      point.x = 2*(p0.x*(t-1) - p1.x*(2*t-1) + p2.x*t);
      point.y = 2*(p0.y*(t-1) - p1.y*(2*t-1) + p2.y*t);
  
      return point;
    }
  
    function drawCubicLine(points, draw, inc) {
      let tInc = inc || 0.001;
      let ps = [];
      context.beginPath();
  
      context.moveTo(points[0].x, points[0].y);
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = geCubicPoint(points, t);
        ps.push(point);
  
        if (draw) {
          context.lineTo(point.x, point.y);
          context.stroke();
        }
  
      }
  
      context.stroke();
  
      context.closePath();
  
      return ps;
    }
  
  
  
    function geCubicPoint(points, t) {
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
  
      let p = {x: point.x/mag, y: point.y/mag};
  
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
  
        return { x, y, r: 10};
      }
      else {
        let x = p1.x;
        let y = (p2.y - p1.y) * t + p1.y;
  
        return {x,y, r: 10};
  
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
