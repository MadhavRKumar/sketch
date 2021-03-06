const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color')
const settings = {
  dimensions: [ 2048, 2048 ]
};

const sketch = () => {
  return ({ context, width, height }) => {

    let colors = [
      {
        stroke: '#edb961', 
        fill: '#35a0f2'
      },

      {
        stroke: '#ed9684', 
        fill: '#b5e2fa'
      },

      
      {
        stroke: '#78c98b', 
        fill: '#dd9296'
      }
    ]

    let color = getRandomElem(colors);
    context.fillStyle = color.fill;


    context.fillRect(0, 0, width, height);
    let circRad = width/2 * Math.sqrt(2) ;
    context.strokeStyle = Color.offsetHSL(color.fill, 0, 0, -10).hex;
    poisson(true, [], getRandom(100, 200), 15);

    context.strokeStyle = color.stroke;

    let firstCross = [],
    crossPoints = [];
    firstCross[0] = { x: 0, y: 0 };
    firstCross[2] = { x: width, y: height };
    firstCross[1] = { x: getRandom(width/2, width), y: getRandom(-height/10, height/2) };

  
    //firstCross[2] = { x: getRandom(0, width), y: getRandom(0, height) };

    crossPoints.push(...drawQuadraticLine(firstCross, false, 0.05));
    poisson(false, [], getRandom(200, 300), 3);




    
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
    //points.push(p0);
    for (let p of points) {
      if (isValid(p, grid, cellSize, rows, cols, r)) {
        insertPoint(grid, cellSize, p);
      }
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
    let a = 0;
    for (let p of filterPoints) {
      if (strokeSize) {
        let d = dist(p.x, p.y, width / 2, height / 2);
        let lw = map(d, 0, circRad, strokeSize, 0);
        context.lineWidth = random.gaussian(strokeSize, 0.5);

      }
      else {
        context.lineWidth = random.gaussian(6, 1);
      }


      if (point || random.value() < chance) {
        //console.log(context.lineWidth);
        context.beginPath();
        context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
      }
      else {
        context.beginPath();
         a = random.noise3D(p.x/1500, p.y/1500, 1) * 2 * Math.PI;
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
        let mag = cellSize / random.gaussian(Math.sqrt(2), 0.1)  * getRandom(0.75, 1);
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

        for(let i = 0; i <=1; i++) {
        let tStart = getRandom(0.05, 0.05);
        let tInc = firstPass ? 0.001 : 0.1;

        if(!firstPass) {
          context.strokeStyle = Color.offsetHSL(context.strokeStyle, 0, 0, -8).hex;
          drawQuadraticLine(leafPoints,true, 0.01);
        }
        else {
          let [h, s, l] = Color.parse(color.stroke).hsl;
          context.strokeStyle = Color.offsetHSL(color.stroke, getRandom(-0.1, 0.1)*h,  getRandom(-0.05, 0.05)*s, getRandom(-0.05, 0.05)*l).hex;
  
   
        }

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


          let off = mag/2 * Math.sin(t*Math.PI);
          let p1 = {x: p.x - perp1.x*off, y: p.y - perp1.y*off}

          let p2 = {x: p.x + perp2.x*off , y:  p.y + perp2.y*off}

          context.beginPath();
          context.moveTo(p.x, p.y);

          context.lineTo(p1.x, p1.y);
          context.stroke();

          context.closePath();
          
          context.beginPath();
          context.moveTo(p.x, p.y);

          context.lineTo(p2.x, p2.y);
          context.stroke();

          context.closePath();


        }
        firstPass = false;
      }

      }

    }
  }

  function isValid(p, grid, cellsize, rows, cols, radius) {

    if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height || dist(p.x, p.y, width/2, height/2) > circRad) {
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

  function getTangent(points, t) {
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
