const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed  = window.performance.now();

const settings = {
  dimensions: [1024, 1024],
  suffix: seed,
  animate: true,
  duration: 6,
};

const sketch = () => {
  return ({ context, width, height, playhead }) => {
    random.setSeed(seed)


    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let wMargin = width/10;
    let hMargin = width/10;

    let inc = 0.002;
    context.lineWidth = 0.25;
    let w0 = util.getRandom(4, 10);
    let damp = w0/util.getRandom(2,3);
    for(let t = 0; t <= Math.sin(playhead*Math.PI); t += inc)
    {
      let y = util.lerp(hMargin, height-hMargin, t);
      let start = {x: width/2, y};
      let x2 = osc(t*2);

      
      // if(x2 < start.x){
      //   let diff = start.x - x2;
      //   x2 = start.x+diff;
      // }

      let end = {x:width/2+x2, y};

      context.beginPath();
      util.drawLine(start, end, {context});
      context.stroke();
      context.closePath();

    }


    function osc(t) {
      
      let a = (width-2*hMargin)/2;
  
      let w1 = Math.sqrt(w0*w0 - damp*damp/4);
      return Math.exp(-damp*t/2)*a*Math.cos(w1*t);
    }






  };
};

canvasSketch(sketch, settings);
