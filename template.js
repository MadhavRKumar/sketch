const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
let seed;

const settings = {
  dimensions: [2048, 2048],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    seed  = window.performance.now();
    random.setSeed(seed)


    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let wMargin = 0;
    let hMargin = 0;

    
    







  };
};

canvasSketch(sketch, settings);
