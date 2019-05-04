const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {

    let palettes = [

      // {
      //   bg1: '#f6d8ae',
      //   bg2: '#f4e4d0',
      //   colors: [
      //             "#da4167",
      //             "#f4d35e",
      //             "#083d77"
      //           ]
      // },

      // {
      //   bg1: '#f7ede2',
      //   bg2: '#f2e7dc',
      //   colors: [
      //             "#f9a143",
      //             "#f2cb41",
      //             "#c91a1a"
      //           ]
      // },

      {
        bg1: '#fffbfe',
        bg2: '#fcf7fb',
        colors: [
                  "#d6e5c9",
                  "#ffe8e1",
                  "#efaac4"
                ]
     }


    ]

    let palette = getRandomElem(palettes);
    let colors = palette.colors;


    context.fillStyle = palette.bg1;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = palette.bg2;
    fillCirc(width/2);

    let circs = [];
    let circ = [];
    let circSize = width / 50;
    let offsetMag = width/100;
    let lw = 0.1;
    for (let a = 0; a < Math.PI * 2; a += Math.PI * 2 / 100) {
      let x = Math.cos(a) * circSize + width/2;
      let y = Math.sin(a) * circSize + height/2;
      circ.push({x,y});
    }


    while(offsetMag < width/5) {
      let a = 0;
      let c = [];
      for (let i = 0; i < circ.length; i++) {

        let end = circ[i];
        let offset = {x: end.x - width/2, y : end.y - height/2};
        offset = normalize(offset);
        let noiseVal = (random.noise3D(Math.cos(a)+1, Math.sin(a)+1, 1) + 1 )/ 2;
        let rand = getRandom(0.5, 1);
        let offX = offset.x * offsetMag * noiseVal* rand;
        let offY = offset.y * offsetMag * noiseVal * rand;
        end.x += offX;
        end.y += offY;
        c.push({x:end.x, y:end.y});
        
        a += 2*Math.PI/circ.length;
      }
      
      circs.push({circle:c, size: offsetMag});

      offsetMag *= (getRandom(1.01, 1.15));
    }
    let prevColor;
    for(let i = circs.length-1; i >= 0; i--) {
      let c = circs[i].circle;
      let size = circs[i].size;
 
     
      let path = new Path2D();
      context.strokeStyle = "#111111";
      context.lineWidth = 5;
      path.moveTo(c[0].x, c[0].y);
      for(let j = 1; j < c.length-1; j++) {
        // let start = c[j];
        // let end = c[(j+1)%c.length];
        // drawLine(start, end, {p: path, moveTo: false});

        let xc = (c[j].x + c[j+1].x)/2;
        let yc = (c[j].y + c[j+1].y)/2;
        path.quadraticCurveTo(c[j].x, c[j].y, xc, yc);

      }
      path.quadraticCurveTo(c[c.length-1].x, c[c.length-1].y, c[0].x, c[0].y);
      path.closePath();
      let newColor = getRandomElem(colors);
      if(!prevColor || prevColor !== newColor) {
       context.stroke(path);
      }

      context.save();
      context.clip(path)

      context.strokeStyle = newColor;
      fillCirc(size);
      prevColor = newColor;
      context.restore();

    }



    function fillCirc(size) {
      let lines = 2000; //quadMap(size, width/100, width/5, 175, 3500);
      context.lineWidth =  quadMap(size, width/100, width/5, 0.5, 3);
      context.beginPath();
      for(let i = 0; i < lines; i++) {
        let [x,y] = random.onCircle(width*1.1);
        let centerX = getRandom(0, width);
        let centerY = getRandom(0, height);
        context.moveTo(centerX + x, centerY + y);
        context.lineTo(centerX - x, centerY- y);
        // drawLine(p1, p2, {moveTo: true});
        context.stroke();
      }
      context.closePath();
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

      if (distance < 100) {
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
        drawLine(prev, cur, {p: c});
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
