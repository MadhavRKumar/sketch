const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Color = require('canvas-sketch-util/color')
const settings = {
  dimensions: [ 4800, 2700 ]
};

const sketch = () => {
  return ({ context, width, height }) => {

    let g = context.createLinearGradient(width/2, height, width/2, 0);
    g.addColorStop(0, '#BBBABB');
    g.addColorStop(0.9, '#E9EDEE');
    context.fillStyle = g;
 
    context.fillRect(0, 0, width, height);

    let colors = [
      '#F2EBD5',
      '#FCD695',
      '#E16757'
    ]

    colors = random.shuffle(colors);


    let region = new Path2D();
    let w = width/3;
    for(let i = 0; i < 3; i++) {
      
      let rect = generateRect({x:w*i, y:0}, w);
      context.fillStyle = colors[i];
      let [h, s, l] = Color.parse(colors[i]).hsl;
      context.fillRect(rect.x, rect.y, rect.w, rect.h);
      context.lineWidth = 25;
      
      context.strokeStyle = Color.offsetHSL(colors[i], 0, 0, -l*0.2).hex;
      context.strokeRect(rect.x, rect.y, rect.w, rect.h);

      region.rect(rect.x, rect.y, rect.w, rect.h);
    }
    context.clip(region);

   

    let baseLine = 0;
    let p = {x : 0, y: baseLine}
    let lineInc = height/100;
    let xInc = width/1000;

    let noiseScale = 5000;
    context.lineWidth = 10;
    while(p.y < 2*height/3) {
    p.x = 0;
    context.lineWidth = random.gaussian(8);
    while(p.x >= 0 &&  p.x < width) {
      context.beginPath();

      let curDisplacement = random.noise1D(p.x/noiseScale)*height/2;
      let nextDisplacement = random.noise1D((p.x+xInc)/noiseScale)*height/2;

      let index = clamp(Math.floor(map(p.x, 0, width, 0, 3)), 0, 2);
      let [h, s, l] = Color.parse(colors[index]).hsl;
      context.strokeStyle = Color.offsetHSL(colors[index], 0, 0, -l*0.2).hex;

      context.moveTo(p.x, p.y + curDisplacement)
      context.lineTo(p.x+xInc, p.y + nextDisplacement);
      context.stroke();
      context.closePath();
      p.x += xInc;


    }
    p.y += random.gaussian(lineInc, 5);
  }
    






    function generateRect(startPoint, w) {
      let wMargin = w/(random.gaussian(6,1));
      let hMargin = height/(random.gaussian(6,1));

      let pos = {x: startPoint.x + wMargin, y: startPoint.y + hMargin};

      let rectW = w - 2*wMargin;
      let rectH = height - 2*hMargin;

      return {x: pos.x, y: pos.y, w: rectW, h: rectH};
    }

    function drawLine(points) {
      let tInc = 0.001;
        // let maxWidth = quadMap(totalDist, 0, maxDist, 0, 4);
      // maxWidth = random.gaussian(maxWidth);

      let offset = 0;
      
      let lineCount = getRandomInt(100, 200);
      let offsetInc = 20;


      for(let i = 0; i < lineCount; i++) {

      
      for (let t = tInc; t < 1 + tInc; t += tInc) {
        context.beginPath();
        let point = getPoint(points, t);
        let nextPoint = getPoint(points, t+tInc);
        let index = clamp(Math.floor(map(point.x, 0, width, 0, 3)), 0, 2);
        let [h, s, l] = Color.parse(colors[index]).hsl;
        let d = dist(point.x, point.y, points[3].x, points[3].y);
        context.lineWidth = random.gaussian(8); //map(d, 0, totalDist, 0, maxWidth);
        context.moveTo(point.x, point.y+offset);
        context.lineTo(nextPoint.x, nextPoint.y+offset);
        context.strokeStyle = Color.offsetHSL(colors[index], 0, 0, -l*0.2).hex;

        context.stroke();
        context.closePath();

        //debug
        // context.fillStyle = 'black';
        // context.font = "100px Georgia";
        // context.fillText(index, point.x, point.y);
      }

      offset += offsetInc*random.gaussian(1);
    }


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

    function getMidPoint(start, end) {
      return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
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
