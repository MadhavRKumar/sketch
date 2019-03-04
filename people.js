const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    let bg = '#F4C403'
    context.fillStyle = bg;
    context.fillRect(0, 0, width, height);
    let wMargin = width / 8;
    let hMargin = wMargin;

    let mainColor = '#A61F1B';

    let accent = '#016AAC';

    let humanHeight = (width-2*hMargin)/getRandom(4, 10);
    let humanWidth = humanHeight/2;
    let count = 0;
    for (let i = hMargin; i < height; i += humanHeight/1.5)  {

      let offset = count % 2 == 0 ? 0 : humanWidth/2;
      let numAccents = getRandomInt(10, 35);
      for (let j = width-offset; j > 0; j -= humanWidth/1.8) {
        let points = new Array(4);

        points[0] = { x: j, y: i };
        points[1] = { x: points[0].x, y: points[0].y - humanHeight }
        points[3] = { x: points[0].x + humanWidth, y: points[0].y }
        points[2] = { x: points[3].x, y: points[1].y };

        let color;

        if(numAccents > 0 && random.value() < 0.9) {
          color = accent;
          numAccents--;
          
        }
        else {
          color = mainColor;
        }
        context.fillStyle =  color;
        drawHuman(points, humanWidth);

      }
      count++;

    }

    context.fillStyle = bg;
    context.fillRect(0, 0, width, hMargin);
    context.fillRect(0, 0, wMargin, height);
    context.fillRect(0, height-hMargin, width, hMargin);
    context.fillRect(width-wMargin, 0, wMargin, height);

    context.lineWidth = 20;
    context.strokeRect(wMargin, hMargin, width-2*wMargin, height -2*hMargin);



    let strokes = getRandomInt(9, 12);

    for(let a = 0; a <= 2*Math.PI; a += Math.PI/strokes) {
        let x = Math.cos(a) * (width-wMargin)/1.12 + width/2;
        let y = Math.sin(a) * (height-hMargin)/2 + height/2;

        let linePoints = new Array(4);

        let norm = {x: x - width/2, y: y - height/2}
        let mag = Math.hypot(norm.x, norm.y);
        norm.x /= mag;
        norm.y /= mag;

        linePoints[0] = {x: x - norm.x*20, y: y-norm.y*20}
        linePoints[3] = {x: x + norm.x*75, y: y+norm.y*75}
        linePoints[1] = {x: getRandom(linePoints[0].x-10, linePoints[3].x+10), y: getRandom(linePoints[0].y, linePoints[3].y)};
        linePoints[2] = {x: getRandom(linePoints[0].x-10, linePoints[3].x+10), y: getRandom(linePoints[0].y, linePoints[3].y)};
        
        drawLine(linePoints);
    }



    function drawHuman(points, humanWidth) {
      let tInc = 0.01;




      let headRadius = (points[3].x - points[0].x) / 2 * getRandom(0.6, 0.9);
      let neckPoint = getPoint(points, 0.5);
      let headCent = { x: neckPoint.x, y: getRandom(neckPoint.y - headRadius, neckPoint.y + headRadius / 2) };



      context.beginPath();
      context.lineWidth = 25;
      context.arc(headCent.x, headCent.y, headRadius, 0, 2 * Math.PI);
      context.stroke();
      context.fill();

      context.moveTo(points[0].x, points[0].y);
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = getPoint(points, t);
        context.strokeStyle = '#111111';
        context.lineTo(point.x, point.y);

      }

      context.closePath();
      context.stroke();
      context.fill();
    }

    function drawLine(points) {
      let tInc = 0.1;

      context.beginPath();
      context.strokeStyle = '#111111';

      context.moveTo(points[0].x, points[0].y);
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = getPoint(points, t);
        context.lineWidth = getRandom(20, 22);
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
