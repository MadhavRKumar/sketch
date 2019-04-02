const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {


    let palettes = [
      {
        mainColor:'#A61F1B',
        accent: '#016AAC',
        bg: '#F4C403',
      },

      {
        mainColor:'#1289E3',
        accent: '#F02A5F',
        bg: '#FFA72C',
      },

      {
        mainColor:'#EEEEEE',
        accent: '#EEEEEE',
        bg: '#EEEEEE',
      },

      {
        accent:'#E13A2A',
        mainColor: '#EEEEEE',
        bg: '#EEEEEE',
      }


    ]

    let palette = getRandomElem(palettes);

    let bg = palette.bg;
    context.fillStyle = bg;
    context.fillRect(0, 0, width, height);
    let wMargin = width / 6;
    let hMargin = wMargin;

    let mainColor = palette.mainColor;

    let accent = palette.accent;

    let strokes = getRandomInt(9, 12);
    let lines = [];
    let linePrepoints = [];
    context.lineCap = "round";
    let rectSize = width - 2 * wMargin;

    for (let a = 0; a <= 2 * Math.PI; a += (Math.PI / strokes) * random.gaussian(1, 0.1)) {
      let circOff = 50 + random.gaussian(10, 10);
      let x = Math.cos(a) * (rectSize * Math.sqrt(2) / 2 + circOff) + width / 2;
      let y = Math.sin(a) * (rectSize * Math.sqrt(2) / 2.1 + circOff) + height / 2;
      let linePoints = new Array(4);

      let norm = { x: x - width / 2, y: y - height / 2 }
      let mag = Math.hypot(norm.x, norm.y);
      norm.x /= mag;
      norm.y /= mag;

      linePoints[0] = { x: x - norm.x * circOff, y: y - norm.y * circOff }
      linePoints[3] = { x: x + norm.x * circOff, y: y + norm.y * circOff }
      linePoints[1] = { x: getRandom(linePoints[0].x - 10, linePoints[3].x + 10), y: getRandom(linePoints[0].y, linePoints[3].y) };
      linePoints[2] = { x: getRandom(linePoints[0].x - 10, linePoints[3].x + 10), y: getRandom(linePoints[0].y, linePoints[3].y) };


      for (let t = 0; t < 1; t += 0.05) {
        linePrepoints.push(getPoint(linePoints, t));
      }

      lines.push(linePoints);
    }

    for(let t = 0; t <= 1; t+= 0.01) {
      let p1 = {x:wMargin, y:hMargin};
      let p2 = {x:p1.x+rectSize, y:p1.y};
      let p3 = {x:p1.x, y:p1.y+rectSize};
      let p4 = {x:p1.x+rectSize, y:p1.y+rectSize};

      linePrepoints.push(getPointOnLine(p1, p2, t));
      linePrepoints.push(getPointOnLine(p1, p3, t));
      linePrepoints.push(getPointOnLine(p3, p4, t));
      linePrepoints.push(getPointOnLine(p2, p4, t));

    }




    poisson(true, linePrepoints, 25, 10);











    let humanHeight = (width - 2 * hMargin) / getRandom(4, 10);
    let humanWidth = humanHeight / 2;
    let count = 0;
    let humanPoints = [];
    let humans = [];
    context.save();
    let path = new Path2D();
    path.rect(wMargin, hMargin, width - 2 * wMargin, height - 2 * hMargin);
    context.clip(path);
    for (let i = hMargin; i < height; i += humanHeight / (1.5)) {

      let offset = count % 2 == 0 ? 0 : humanWidth / 2;
      let numAccents = getRandomInt(10, 35);
      for (let j = width - offset; j > 0; j -= humanWidth / 1.8) {
        let points = new Array(4);

        points[0] = { x: j, y: i };
        points[1] = { x: points[0].x, y: points[0].y - humanHeight }
        points[3] = { x: points[0].x + humanWidth, y: points[0].y }
        points[2] = { x: points[3].x, y: points[1].y };

        let color;

        if (numAccents > 0 && random.value() < 0.9) {
          color = accent;
          numAccents--;

        }
        else {
          color = mainColor;
        }
        context.fillStyle = color;
        humanPoints.push(...drawHuman(points, true));

        humans.push({ points, color })

      }
      count++;

    }



    //internal poisson
    poisson(false, humanPoints, 8);
    context.restore();

    context.strokeStyle = '#111111';
    context.lineWidth = 20;
    context.strokeRect(wMargin, hMargin, width - 2 * wMargin, height - 2 * hMargin);
    // context.fillRect(wMargin, hMargin, width - 2 * wMargin, height - 2 * hMargin);




    for (let l of lines) {
      let lineWidth = random.gaussian(16, 4);

      context.lineWidth = lineWidth;
      context.strokeStyle = "#111111";
      drawLine(l);

    }

    function poisson(point, prePoints, radius, strokeSize) {

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

      let p0 = { x: width / 2, y: height / 2 };
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


      context.strokeStyle = '#111111'
      context.lineCap = "round";
      let filterPoints = points.filter(p => !prePoints.includes(p));
      for (let p of filterPoints) {
        if(strokeSize) {
          context.lineWidth = random.gaussian(strokeSize, 1);
        }
        else {
          context.lineWidth = random.gaussian(3, 0.06);
        }

        context.beginPath();

        if (point || random.value() < 0.3) {
          context.arc(p.x, p.y, 1, 0, 2 * Math.PI);
          context.stroke();
        }
        else {
          let [x, y] = random.onCircle();
          let mag = cellSize / 2;
          context.moveTo(p.x - x * mag, p.y - y * mag);
          context.lineTo(p.x + x * mag, p.y + y * mag);
          context.stroke();
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

    function drawHuman(points, draw) {
      let tInc = 0.01;
      let ps = [];
      let headRadius = (points[3].x - points[0].x) / 2 * getRandom(0.6, 0.9);
      let neckPoint = getPoint(points, 0.5);
      let headCent = { x: neckPoint.x, y: getRandom(neckPoint.y - headRadius, neckPoint.y + headRadius / 2) };

      let off = Math.PI/4;
      for (let a = -Math.PI/2 - off; a < Math.PI/2 - off; a += (2 * Math.PI) / 50) {
        let x = Math.cos(a) * headRadius + headCent.x;
        let y = Math.sin(a) * headRadius + headCent.y;

        ps.push({ x, y });
      }

      if (draw) {
        context.beginPath();
        context.lineWidth = random.gaussian(16, 2);
        context.arc(headCent.x, headCent.y, headRadius, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
      }

      context.moveTo(points[0].x, points[0].y);
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = getPoint(points, t);
        if (draw) {
          context.strokeStyle = '#111111';
          context.lineTo(point.x, point.y);
        }
        if (t > 0.75 && t < 0.9) {
          ps.push({ x: point.x, y: point.y });
        }
      }

      if (draw) {
        context.closePath();
        context.stroke();
        context.fill();
      }
      return ps;
    }

    function drawLine(points) {
      let tInc = 0.1;

      context.beginPath();

      context.moveTo(points[0].x, points[0].y);
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = getPoint(points, t);
        context.lineTo(point.x, point.y);
        context.stroke();


      }

      context.stroke();

      context.closePath();
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
      if(p1.x !== p2.x) {
      let a = (p2.y - p1.y)/(p2.x - p1.x);

      let x = (p2.x-p1.x)*t + p1.x;

      let y = a*(x - p1.x) + p1.y;

      return {x,y};
      }
      else
      {
        let x = p1.x;
        let y = (p2.y - p1.y)*t + p1.y;

        return {x, y};

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
