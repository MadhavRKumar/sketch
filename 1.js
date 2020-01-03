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


    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let wMargin = width/20;
    let hMargin = height/20;

    let blur = "blur(500px)"
    let blurLess = "blur(1px)"
    let colors = ['#d82a13', '#eace5d', '#00568F', '#ffffff']
    colors = random.shuffle(colors);

    let ps = util.poisson({
      r: width/10,
      width,
      height,
      wMargin,
      hMargin
    });

    context.strokeStyle = '#333333';

    context.lineWidth = 10;
    context.beginPath();

    context.fillStyle = colors.pop();
    util.drawCurve({
      ps,
      context
    });
    context.filter = blur;
    context.fill();
    context.filter = blurLess;
    context.stroke();
    context.closePath();


    context.beginPath();
    ps.sort((a,b) => {
      return b.x - a.x;
    })

    context.fillStyle = colors.pop();
    util.drawCurve({
      ps,
      context
    });
    context.filter = blur;
    context.fill();
    context.filter = blurLess;    
    context.stroke();

    context.closePath();


    context.beginPath();

    ps.sort((a,b) => {
      return b.y - a.y;
    });

    context.fillStyle = colors.pop();
    util.drawCurve({
      ps,
      context
    });
    context.filter = blur;
    context.fill();
    context.filter = blurLess;
    context.stroke();
    context.closePath();






  };
};

canvasSketch(sketch, settings);
