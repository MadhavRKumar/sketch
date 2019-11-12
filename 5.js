const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed  = window.performance.now();

const settings = {
  dimensions: [3600, 3600],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    random.setSeed(seed)


    context.fillStyle = '#fafafa';
    context.fillRect(0, 0, width, height);

    let wMargin = 0;
    let hMargin = 0;

    context.fillStyle = '#111111';
    context.strokeStyle = '#111111';

    let w = width/30;
    let h = height/15;

    context.lineWidth = 5;
    util.drawLine({x: 0, y:h*2}, {x: width, y:h*2}, {context});
    context.stroke();


    // Hatching

    let N = 1500;
    context.lineWidth = 1;
    for(let n = 0; n <= N; n++){
      context.strokeStyle = '#11111101';
      let a = random.gaussian(Math.PI/4, 0.1); //util.getRandom(Math.PI/4, 3*Math.PI/4);

      let x = Math.cos(a);
      let y = Math.sin(a);

      let vector = util.normalize({x,y})

      let mag = util.getRandom(width/100, width/50);
      mag = random.gaussian(mag);

      vector.x *= mag;
      vector.y *= mag;

      let start = util.getPointOnLine({x: 0, y:h*2}, {x: width, y:h*2}, util.getRandom(-0.01,1));

      let end = {
        x: start.x + vector.x,
        y: start.y + vector.y
      }

      util.drawLine(start, end, {context, moveTo:true});
      context.stroke();

    }


    for(let x = 0; x <= width+width/3; x += random.gaussian(width/3)) {

      w = width/30;
      h = height/15;

    let point = {x: x, y: h*2};
    context.lineWidth = 3;


    let a = Math.PI/2;
    let aInc = Math.PI;
    let points = [];
    while(point.y + h < height) {
      let newH = util.getRandom(1.1, 1.5)*h; 
      let newW = util.getRandom(1.1, 1.5)*w;

      let prev = {
        x: point.x,
        y: point.y
      }
      points.push({point:prev, w, h});
      point.y += random.gaussian((newH+h)/4, 100);
      point.x = (x)+Math.sin(a)*random.gaussian((newW+w)/3, 100)



      w = newW;
      h = newH;
  
      a += aInc;

    }
    points.push({point, w, h});


    for(let i = 0; i < points.length-1; i++) {
      let start = points[i].point;
      let end = points[i+1].point;


      let midpoint = util.getPointOnLine(start, end, 0.5);
      let J = util.getRandom(-1, 10);
      for(let j = 0; j < J; j++) {
        let controlPoint = 
        {
          x: midpoint.x,
          y: util.getRandom(midpoint.y*1.25, end.y*1.1)
        }
        context.strokeStyle = '#11111111';
        context.lineWidth = 8;
        
        let inc = 1/20

        util.drawQuadraticLine({
          points: [start, controlPoint, end],
          context,
          inc
        })

      }
    }


    let N = 100;
    for(point of points) {
    N *= 1.25;
    for(let n = 0; n < N; n++) {
      context.lineWidth = 1;
      context.strokeStyle = '#111111';

      let a = random.gaussian(Math.PI/4, 0.1);

      let x = Math.cos(a);
      let y = Math.sin(a);

      let vector = util.normalize({x,y})

      let mag = util.getRandom(width/100, width/50);
      mag = random.gaussian(mag);

      vector.x *= mag;
      vector.y *= mag;

      let aRand = util.getRandom(0, Math.PI*2);
      let start = 
      {
        x: point.point.x+Math.cos(aRand)*point.w*random.value(),
        y: point.point.y+point.w/2+Math.sin(aRand)*point.w*random.value(),
      }

      let end = {
        x: start.x + vector.x,
        y: start.y + vector.y
      }

      context.beginPath()
      util.drawLine(start, end, {context, moveTo:true});
      context.stroke();
      context.closePath();


    }

  }

    for(point of points) {

      context.lineWidth = 6;
      context.fillStyle = '#111111';
      context.strokeStyle = '#fafafa';
      util.drawRect(
        {
          context,
          center: point.point,
          w: point.w,
          h: point.h,
        }
      )
    }






  }


  };
};

canvasSketch(sketch, settings);
