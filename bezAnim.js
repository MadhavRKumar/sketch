const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed  = window.performance.now();

const settings = {
  dimensions: [3600, 3600],
  suffix: seed,
  animate: true,
  duration: 4
};
let first = true;
const sketch = () => {
  return ({ context, width, height, playhead }) => {
    random.setSeed(seed)


      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
      first = false;
    


    let wMargin = height/10;
    let hMargin = height/10;


    let t = Math.PI*2*playhead;
    let gridSize = (width-wMargin*2)/8;

    for(let i = wMargin+gridSize/2; i < width-wMargin+gridSize/2; i+=gridSize) {
      for(let j = hMargin; j < height-hMargin; j+=gridSize){
        let start = {x:i, y: j}
        
        let noiseVal = random.noise4D(i,j,Math.sin(t), 0.1);

        let radius = (gridSize);

        
        let x = i + radius*Math.sin(t)*noiseVal;
        let y = j+ gridSize/2 + radius*Math.cos(t)*noiseVal
    
        let control = {x, y};
    
        let end = {x: i, y:j+gridSize};
    
        context.lineWidth = 2;
        util.drawQuadraticLine({
          points: [start, control, end],
          context,
          inc: 1/30.0
        })
    
      }
    }






  };
};

canvasSketch(sketch, settings);
