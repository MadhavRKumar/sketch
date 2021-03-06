const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const settings = {
  dimensions: [ 2048, 2048 ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#6bc9ff';
    context.fillRect(0, 0, width, height);

    context.strokeStyle = '#Efefef88';
    let circRad = width/25;

    let [circles, centers] = generateCircles();

    let colors = [
      '#f7a278',
      '#fdfdff',
      '#12130f'
    ]

    let path = new Path2D();
    let wMargin = width/10,
    hMargin = wMargin;

    context.strokeStyle = '#fdfdff';
    let rectPoints = [];
    let rectSize = width-wMargin*2;
    for(let t = 0; t <= 1; t+= 0.01) {
      let p1 = {x:wMargin, y:hMargin};
      let p2 = {x:p1.x+rectSize, y:p1.y};
      let p3 = {x:p1.x, y:p1.y+rectSize};
      let p4 = {x:p1.x+rectSize, y:p1.y+rectSize};

      rectPoints.push(getPointOnLine(p1, p2, t));
      rectPoints.push(getPointOnLine(p1, p3, t));
      rectPoints.push(getPointOnLine(p3, p4, t));
      rectPoints.push(getPointOnLine(p2, p4, t));

    }

    poisson(true, rectPoints, 25, 0);


    hMargin = wMargin;
    path.rect(wMargin, hMargin, rectSize, rectSize);
    context.fill(path);
    context.clip(path);
    
    for(let i = 0; i < 50; i++) {
    poisson(false, circles, 25, 1.5);
    }

  function generateCircles() {
    let r = circRad;
    let offset = -r;
    let isOffset =  true;
    let circles = [];
    let centers = []
    for(let y = 0; y <=height+r; y += r) {
    for(let x =  (isOffset) ? offset : 0; x <= width-offset; x += r*2) {
        centers.push({x,y})
        for(let a = Math.PI; a <= 2*Math.PI; a += 2*Math.PI/100) {
            let x2 = Math.cos(a)*r + x;
            let y2 = Math.sin(a)*r + y;

            circles.push({x: x2, y: y2, r: 10});
        }
      }


      isOffset = !isOffset;

    }

    return [circles, centers];
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
    let p0 = { x: getRandom(0, width), y: getRandom(0, height), r: r };
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
        let pNew = { x: p.x + curR * Math.cos(theta), y: p.y + curR * Math.sin(theta), r: r }

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
        let lw = map(p.y, 0, height, strokeSize*0.5, strokeSize);
        context.lineWidth = strokeSize * random.gaussian(1, 0.25);

      }
      else {
        context.lineWidth = random.gaussian(6, 1);
      }

      context.beginPath();

      if (point || random.value() < chance) {
        //console.log(context.lineWidth);
        context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
        context.stroke();
      }
      else {
        let a = random.noise3D(p.x/10000, p.y/500, 1) * 2 * Math.PI;
        // let x = Math.cos(a);
        // let y = Math.sin(a);

        let center = getClosest(p, centers);
        let toPoint = {x: p.x-center.x, y: p.y - center.y};
        let tanMag = dist(center.x, center.y, p.x, p.y);
        let index = random.chance(0.7) ? Math.floor(map(tanMag, 0, circRad, 0, 3)) : getRandomInt(0, 3);
        context.strokeStyle = colors[index];

        toPoint.x /= tanMag;
        toPoint.y /= tanMag;
        let x = -toPoint.y;
        let y = toPoint.x;
        // let [x, y] = random.onCircle();
        let mag = cellSize / random.gaussian(2, 0.1);
        let points = new Array(4);


        points[0] = { x: p.x - x * mag, y: p.y - y * mag }
        points[3] = { x: p.x + x * mag, y: p.y + y * mag }

        let minBound = {x: Math.min(points[0].x, points[3].x), y: Math.min(points[0].y, points[3].y)}
        let maxBound = {x: Math.max(points[0].x, points[3].x), y: Math.max(points[0].y, points[3].y)}


        points[1] = { x: getRandom(minBound.x, maxBound.x), y: getRandom(minBound.y, maxBound.y) };
        points[2] = { x:  getRandom(minBound.x, maxBound.x), y:  getRandom(minBound.y, maxBound.y) };
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
            let r = (pOther.r + p.r)/2
            if (dx * dx + dy * dy < r*r)
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

  function getClosest(p, arr) {
    let minDist = Number.MAX_SAFE_INTEGER;
    let close = arr[0];
    for(pOther of arr) {
      let d = dist(p.x, p.y, pOther.x, pOther.y);
      if( d < minDist) {
        minDist = d;
        close = pOther;
      }
    }

    return close;
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
