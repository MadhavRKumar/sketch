const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed  =  window.performance.now();

const settings = {
  dimensions: [3600, 3600],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    random.setSeed(seed)

    let colors = ['#f5f4f9', '#1DC09F'];

    context.fillStyle = '#F6CCD6';
    context.fillRect(0, 0, width, height);

    let wMargin = 0;
    let hMargin = 0;


    let N = 10;

    context.filter = "drop-shadow(10px 20px 10px #666666)"
    for(let n = 0; n < N; n++) {

    
    let y = height/2;
    let yRange = height/10;
    let xInc = width/12;
    let firstControl = {
      x: util.getRandom(-xInc + xInc/4, -xInc + 3*xInc/4),
      y: util.getRandom(y-yRange, y+yRange)
    }
    let lastPoint = {
      x: 0,
      y: util.getRandom(y-yRange, y+yRange)
    }
    let points = [{x:-xInc, y:height/2}, firstControl, lastPoint];

    context.lineWidth = 10;
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
    let w = width/100;
    for(let i = 0; i < centerPoints.length-1; i++) {
      let start = centerPoints[i];
      let end = centerPoints[i+1];
      let dir = {
        x: end.x - start.x,
        y: end.y - start.y
      }
      let norm = {x: dir.y, y: -dir.x};

      norm = util.normalize(norm);

      // if(norm.x <= 0 || norm.y <= 0) {
      //   norm.x *= -1;
      //   norm.y *= -1;
      // }
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

    context.fillStyle = util.getRandomElem(colors);

    context.stroke(path);
    context.fill(path);


    

    for(let i = 0; i < bottom.length-1; i++) {
      let start = bottom[i];
      let end = bottom[i+1];
      let dir = {
        x: end.x - start.x,
        y: end.y - start.y
      }
      let norm = {x: dir.y, y: -dir.x};



      let tInc = 0.09;

      for(let t = 0; t <= 1; t += tInc){
        context.lineWidth = 1;
        norm = util.normalize(norm);

        let mag = random.gaussian(20);
  
        norm.x *= mag;
        norm.y *= mag;
        let shadeStart = util.getPointOnLine(start, end, t);


        let shadeEnd = {
          x: shadeStart.x + norm.x,
          y: shadeStart.y + norm.y
        }
        context.beginPath();

        util.drawLine(shadeStart, shadeEnd, {context});
        context.stroke();
        context.closePath();
      }
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
