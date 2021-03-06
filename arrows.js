const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#FFFFFB';
    context.fillRect(0, 0, width, height);
    let wMargin = width / 8;
    let hMargin = wMargin;

    context.strokeStyle = "#222222"
    context.lineWidth = 2.5;
    let xInc = 6;//width/450;
    let buffer = 50;
    for(let x = 0; x <= width; x+= xInc){
      context.beginPath();
      drawLine({x: x, y: -buffer}, {x:x, y: height+buffer}, {})
      context.stroke();
    }

    
    context.lineWidth = 7;
    drawRect(width/2, height/2, width-wMargin*2, height-hMargin*2);

    wMargin *= 1.5;
    hMargin = wMargin;
    let points = poisson(true, [], 350, 10);
 

    let nums = Array.from(points, (x, i) => i);
    for(let i = nums.length-1; i >= 0; i--) {
      let j = getRandomInt(0, i);

      let temp = nums[i];
      nums[i] = nums[j];
      nums[j] = temp;
    }

    points.sort((a, b) => {
      let aDist = dist(a.x, a.y, width/2, height/2);
      let bDist = dist(b.x, b.y, width/2, height/2);
      return aDist - bDist;
    })

    for (let i = 0; i < nums.length; i++) {
      let cur = points[i];
      let other = points[(i+1)%points.length];

      let curToOther = { x: other.x - cur.x, y: other.y - cur.y };
      curToOther = normalize(curToOther);
      let otherToCur = { x: -curToOther.x, y: -curToOther.y };

      let d = dist(cur.x, cur.y, other.x, other.y);
      let mag = d*0;
 
      cur.x += (curToOther.x * mag);
      cur.y += (curToOther.y * mag);

      other.x += (otherToCur.x * mag);
      other.y += (otherToCur.y * mag);
      drawArrow(cur, other);

    }





    function drawArrow(start, end) {
      let control = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

      let tan = { x: start.x - end.x, y: start.y - end.y };
      let norm = { x: -tan.y, y: tan.x };
      norm = normalize(norm);

      let d = dist(start.x, start.y, end.x, end.y);

      norm.x *= getRandom(-d / 2, d / 2);
      norm.y *= getRandom(-d / 2, d / 2);

      control.x += norm.x;
      control.y += norm.y;

      context.lineWidth = 3;
      let points = drawQuadraticLine([start, control, end]);


      let endPoint = points.pop();
      tan = getQuadraticTangent([start, control, end], 1);
      norm = { x: -tan.y, y: tan.x };
      norm = normalize(norm);
      let norm2 = { x: norm.x, y: norm.y };
      let a = Math.atan2(norm.y, norm.x);

      norm.x = Math.cos(a + Math.PI / 4);
      norm.y = Math.sin(a + Math.PI / 4);

      norm2.x = Math.cos(a - Math.PI / 4);
      norm2.y = Math.sin(a - Math.PI / 4);

      let mag = getRandom(d / 30, d / 20);
      norm.x *= mag;
      norm.y *= mag;
      let p1 = { x: endPoint.x + norm.x, y: endPoint.y + norm.y };
      norm2.x *= mag;
      norm2.y *= mag;
      let p2 = { x: endPoint.x - norm2.x, y: endPoint.y - norm2.y };


      context.lineWidth = 5;

      context.beginPath();
      drawLine(p1, endPoint, { moveTo: true });
      context.stroke();

      context.beginPath();
      drawLine(p2, endPoint, { moveTo: true });
      context.stroke();

    }

    
    function drawRect(x, y, w, h, noFill) {
      let corner = { x: x, y: y };

      corner.x -= w / 2;
      corner.y -= h / 2;
      let path = new Path2D();
      drawLine({ x: corner.x, y: corner.y + h }, corner, {p:path, moveTo:true});
      drawLine(corner, { x: corner.x + w, y: corner.y },  {p:path, moveTo:false});
      drawLine({ x: corner.x + w, y: corner.y }, { x: corner.x + w, y: corner.y + h },  {p:path, moveTo:false})
      drawLine({ x: corner.x + w, y: corner.y + h }, { x: corner.x, y: corner.y + h },  {p:path, moveTo:false})
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

      if (distance < 100) {
        dt = 1;
      }
      else if (distance < 200) {
        dt = 0.5;
      } else if (dist < 400) {
        dt = 0.3;
      } else if (dist < 600){
        dt = 0.2;
      }
      else {
        dt = getRandom(0.09, 0.11);
      }


      if (moveTo) {
        ctx.moveTo(start.x, start.y);
      }
      let prev = start;
      for (let t = dt; t <= 2.0; t += dt) {
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
      // for (let p of filterPoints) {
      //   if (strokeSize) {
      //     let d = dist(p.x, p.y, width / 2, height / 2);
      //     let lw = map(d, 0, Math.sqrt(2) * width / 2, strokeSize, 0);
      //     context.lineWidth = strokeSize; //random.gaussian(strokeSize, 0.05);
      //   }
      //   else {
      //     context.lineWidth = random.gaussian(1, 0.06);
      //   }


      //   if (point || random.value() < chance) {
      //     context.beginPath();
      //     context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
      //     context.stroke();
      //     context.closePath();
      //   }
      //   else {
      //     let mag = cellSize / random.gaussian(3, 0.5);

      //     for (let a = Math.PI / 4; a <= Math.PI; a += Math.PI / 4) {
      //       let start = { x: p.x + Math.cos(a) * mag, y: p.y + Math.sin(a) * mag };
      //       let end = { x: p.x + Math.cos(a + Math.PI) * mag, y: p.y + Math.sin(a + Math.PI) * mag };
      //       drawLine(start, end, null, true);
      //       context.stroke();
      //     }

      //   }

      // }

      return filterPoints;
    }

    function isValid(p, grid, cellsize, rows, cols, radius) {

      if (p.x < wMargin || p.x >= width - wMargin || p.y < hMargin || p.y >= height-hMargin) {
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
      let tInc = inc || 1.0 / 10;

      let ps = [];
      //context.beginPath();

      // if (draw) {
      //   context.moveTo(points[0].x, points[0].y);
      //   context.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
      //   context.stroke();
      //   context.closePath();
      // }
      context.beginPath();
      let prev = getQuadraticPoint(points, tInc/5);
      ps.push(prev);
      for (let t = tInc; t <= 1-tInc/10; t += tInc) {
        let cur = getQuadraticPoint(points, t);
        ps.push(cur);
        drawLine(prev, cur, {});
        context.stroke();
        // ps.push(point);
        prev = cur;
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
