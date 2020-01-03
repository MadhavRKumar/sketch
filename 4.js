const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed = window.performance.now();

const settings = {
  dimensions: [3600, 3600],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    random.setSeed(seed)


    context.fillStyle = '#f7f6ea';
    context.fillRect(0, 0, width, height);

    let wMargin = width/10;
    let hMargin = width/10;


    let colors = [
      "#b22003",
      "#0d0a0b",
    ]

    let iterations = 10;

    for (let i = 0; i < iterations; i++) {
      let N = util.getRandom(100, 200);
      let aInc = Math.PI * 5 / N;

      let amplitude = width / util.getRandom(50, 200);
      let give = amplitude * 0.25;

      for (let x = wMargin * 1.5; x <= width + amplitude - wMargin * 1.5; x += (amplitude * 2) + give) {
        let a = util.getRandom(0, Math.PI * 2);



        let inc = random.gaussian(height / N, 5);
        let prevR = { x: x + amplitude, y: random.gaussian(hMargin, 10) }
        let prevL = { x: x - amplitude, y: random.gaussian(hMargin, 10) }


        for (let y = inc + hMargin; y <= height - hMargin; y += inc) {
          let xR = x + Math.cos(a) * amplitude;
          let nextR = { x: xR, y };

          let d = util.dist(xR, y, width / 2, height / 2);
          let lw = util.map(d + util.getRandom(-height / 5, height / 5), 0, width / 1.5, 5, -1);
          context.lineWidth = lw;


          let val = util.map(y + util.getRandom(-height / 3, height / 3), 0, height, 0, 2);

          context.strokeStyle = colors[Math.floor(val)];



          let xL = x - Math.cos(a) * amplitude;
          let nextL = { x: xL, y };

          let p = util.intersects({ start: prevR, end: nextR }, { start: prevL, end: nextL });
          if (!p) {
            context.beginPath();
            util.drawLine(prevR, nextR, { context });
            context.stroke();
            context.closePath();
          }

          context.beginPath();
          util.drawLine(prevL, nextL, { context });
          context.stroke();
          context.closePath();

          prevR = nextR;
          prevL = nextL;

          a += random.gaussian(aInc);
        }
      }


      for(let j = 0; j < 20 && i < iterations/2; j++) {

      
      let y = util.getRandom(0, height);
      let yRange = height/8;
      let xInc = width/5;
      let firstControl = {
        x: util.getRandom(-xInc + xInc/4, -xInc + 3*xInc/4),
        y: util.getRandom(y-yRange, y+yRange)
      }
      let lastPoint = {
        x: 0,
        y: util.getRandom(y-yRange, y+yRange)
      }
      let points = [{x:-xInc, y:height/2}, firstControl, lastPoint];
  
      let inc = 1.0/20;
  
      let draw = false;
  
      let centerPoints = [];
      for(let x = 0; x <= width+xInc; x += xInc) {
        let ps = util.drawQuadraticLine({points, inc, draw, context});
        centerPoints.push(...ps)
        let newEnd = {
          x: x+xInc,
          y: util.getRandom(y-yRange, y+yRange)
        }
        points = getNextCurve(points, newEnd);
  
      }
  
  
      // CREATING TOP AND BOTTOM
      let top = [];
      let bottom = [];
      let w = random.gaussian(width/150,10);
      for(let i = 0; i < centerPoints.length-1; i++) {
        let start = centerPoints[i];
        let end = centerPoints[i+1];
        let dir = {
          x: end.x - start.x,
          y: end.y - start.y
        }
        let norm = {x: dir.y, y: -dir.x};
  
        norm = util.normalize(norm);
  
        norm.x *= w;
        norm.y *= w;
  
        top.push({x:start.x + norm.x, y:start.y + norm.y});
        bottom.push({x: start.x - norm.x, y:start.y-norm.y})
      }
  
      // DRAWING PATH
      let path = new Path2D();
  
      
      // TOP
      for(let i = 0; i < top.length-1; i++) {
        let start = top[i];
        let end = top[i+1];
        util.drawLine(start, end, {context:path});
      }
  
      // BOTTOM
      for(let i = bottom.length-1; i > 0; i--) {
        let start = bottom[i];
        let end = bottom[i-1];
        util.drawLine(start, end, {context:path});
      }
  
      context.fill(path);
    }

  }

    


    function getNextCurve(points, newEnd) {
      let [start, control, end] = points;
      let newControl = {
        x: 2*end.x - control.x,
        y: 2*end.y - control.y
      }

      return [end, newControl, newEnd];
    }









  };
};

canvasSketch(sketch, settings);
