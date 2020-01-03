const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed  = window.performance.now();

const settings = {
  dimensions: [3300, 4200],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    random.setSeed(seed)

    let palettes = [
      {
        bg: "#B10116",
        layers: ["#1d297c", "#1A1D22"]
      },
      {
        bg: "#222222",
        layers: ["#111111", '#efd2d6', "#e0e0e0" ]
      }
    ]

    let palette = util.getRandomElem(palettes);

    context.fillStyle = palette.bg;
    context.fillRect(0, 0, width, height);

    let wMargin = width/6;
    let hMargin = width/6;
    
    let effectiveHeight = height - 2*hMargin;
    let effectiveWidth = width - 2*width;

    /*
    each Range has (min.x,min.y) and (max.x, max.y)
    */


    /// Constructing Ranges


    let ranges = [];

    let curMin = {x: wMargin, y:hMargin}
  
    while (curMin.y < height-hMargin) {
      let curMax = {
        x: width-wMargin,
        y: curMin.y + random.gaussian(effectiveHeight/3, 200)
      }

      if(curMax.y < height){
        ranges.push(makeRange(curMin, curMax))
      }
      let buffer = random.gaussian(width/25);
      curMin = {
        x: curMin.x,
        y: curMax.y+buffer
      };

    }

    for(range of ranges) {
      let curHeight = range.max.y - range.min.y;
      let minW = effectiveWidth/100,
      maxW = effectiveWidth/6,
      minH = curHeight/100,
      maxH = curHeight/6;

      for(layer of palette.layers) {
        let [hue,s,l] = Color.parse(layer).hsl;
        for(let i = 0; i < random.gaussian(8000, 100); i++) {
          context.fillStyle = Color.parse({hsla:[hue,s,l,random.gaussian(0.05, 0.1)]}).hex
          if(random.chance(0.1)){
            context.fillStyle = palette.bg + '03';
          }
          let point =  range.random();
          let w = util.getRandom(minW, maxW);
          let h = util.getRandom(minH, maxH);

          let x = point.x - w/2;
          let y = point.y - h/2;

          context.save();

          context.translate(point.x,point.y);
          context.rotate(util.getRandom(-Math.PI/16, Math.PI/16));
          context.translate(-point.x,-point.y);
          context.beginPath();
          context.rect(x, y, w, h);
          context.closePath();
  

          context.fill();
          context.restore();
        }  
      }
      
    }    
    



function makeRange(min, max) {
  return {
    min,
    max,
    random: () => {
      let x = util.getRandom(min.x, max.x);
      let y = util.getRandom(min.y, max.y);

      return {x,y}
    }
  }
}



  };
};

canvasSketch(sketch, settings);
