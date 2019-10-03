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

    
    


    function convert(string) {
      
    }




  };
};

canvasSketch(sketch, settings);
