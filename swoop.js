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

    let wMargin = 0;
    let hMargin = 0;

    let N = 1000;
    let curveDepth = width/2;

    for(let i = 0; i < 3; i++) {

    let start = {x:0, y:-curveDepth/2};
    let end = {x:width, y:-curveDepth/2};

    
    while(start.y < height || end.y < height) {
      let mid = {x:random.gaussian((start.x+end.x)/2), y: (start.y+random.gaussian(curveDepth,5))};
      let inc = 1.0/30;
      context.lineWidth = random.gaussian(3, 5);
      start.y += random.gaussian(height/N,20);
      end.y += random.gaussian(height/N,20);

      let points = [start, mid, end];

      context.strokeStyle = random.boolean() ? 'white' : 'black';

      context.beginPath();
      util.drawQuadraticLine({
        points,
        context,
        inc
      });
      context.closePath();

    }
    
  }






  };
};

canvasSketch(sketch, settings);
