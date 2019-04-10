const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#f0f0f0';
    context.fillRect(0, 0, width, height);

    let crossPoints = [];

    let firstCross = new Array(4),
      secondCross = new Array(4);

    firstCross[0] = { x: 0, y: 0 };
    firstCross[3] = { x: width, y: height };
    firstCross[1] = { x: getRandom(0, width / 2), y: getRandom(0, height / 2) };
    firstCross[2] = { x: getRandom(width / 2, width), y: getRandom(height / 2, height) };

    crossPoints.push(...drawLine(firstCross, false));


    secondCross[0] = { x: 0, y: height };
    secondCross[3] = { x: width, y: 0 };
    secondCross[2] = { x: getRandom(0, width / 2), y: getRandom(0, height / 2) };
    secondCross[1] = { x: getRandom(width / 2, width), y: getRandom(height / 2, height) };

    crossPoints.push(...drawLine(secondCross, false));
    context.strokeStyle = '#151515';
    poisson(false, [], 4, 0.005, 0);
    for (let i = 0; i < 200; i++) {
      poisson(false, crossPoints , getRandom(75, 100), getRandom(0.1, 3), 0.6);

      context.strokeStyle = random.chance(0.25) ? '#151515' : '#f0f0f0'

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

      let p0 = { x: getRandom(0, width), y: getRandom(0, height) };
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
      let val = random.gaussian(1, 0.1);
      for (let p of filterPoints) {
        if (strokeSize) {
          let d = dist(p.x, p.y, width / 2, height / 2);
          let lw = map(d, 0, Math.sqrt(2) * width / 2, strokeSize, 0);
          context.lineWidth = random.gaussian(lw, 2);
        }
        else {
          context.lineWidth = random.gaussian(3, 0.06);
        }

        context.beginPath();

        if (point || random.value() < chance) {
          //console.log(context.lineWidth);
          context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
          context.stroke();
        }
        else {
          let a = random.noise3D(p.x/10000, p.y/500, val) * 2 * Math.PI;
          let x = Math.cos(a);
          let y = Math.sin(a);
          // let [x, y] = random.onCircle();
          let mag = cellSize / random.gaussian(3, 0.5);
          let points = new Array(4);
          points[0] = { x: p.x - x * mag, y: p.y - y * mag }
          points[3] = { x: p.x + x * mag, y: p.y + y * mag }
          points[1] = { x: getRandom(points[0].x - 10, points[3].x + 10), y: getRandom(points[0].y, points[3].y) };
          points[2] = { x: getRandom(points[0].x - 10, points[3].x + 10), y: getRandom(points[0].y, points[3].y) };
          drawLine(points,true, 0.1);
        }
        context.closePath();

      }
    }

    function isValid(p, grid, cellsize, rows, cols, radius) {

      if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height) {
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

    function drawLine(points, draw, inc) {
      let tInc = inc || 0.001;
      let ps = [];
      context.beginPath();

      context.moveTo(points[0].x, points[0].y);
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = getPoint(points, t);
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



    function getPoint(points, t) {
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

    function getPointOnLine(p1, p2, t) {
      if (p1.x !== p2.x) {
        let a = (p2.y - p1.y) / (p2.x - p1.x);

        let x = (p2.x - p1.x) * t + p1.x;

        let y = a * (x - p1.x) + p1.y;

        return { x, y };
      }
      else {
        let x = p1.x;
        let y = (p2.y - p1.y) * t + p1.y;

        return { x, y };

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
