const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed = window.performance.now();

const settings = {
  dimensions: [3300, 4200],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    random.setSeed(seed)

    let palettes = [
      {
        bg: "#fafafa",
        fill: "#1A1D22"
      }
    ]

    let palette = util.getRandomElem(palettes);

    context.fillStyle = palette.bg;
    context.fillRect(0, 0, width, height);

    let wMargin = width / 6;
    let hMargin = width / 6;

    let effectiveHeight = height - 2 * hMargin;
    let effectiveWidth = width - 2 * width;

    /*
    each Range has (min.x,min.y) and (max.x, max.y)
    */


    /// Constructing Ranges


    let ranges = [];

    let curMin = { x: wMargin, y: util.getRandom(hMargin/2, hMargin) }

    while (curMin.y < height - hMargin) {
      let curMax = {
        x: width - wMargin,
        y: curMin.y + random.gaussian(effectiveHeight / 3, 200)
      }

      if (curMax.y < height) {
        ranges.push(makeRange(curMin, curMax))
      }
      let buffer = random.gaussian(width / 30);
      curMin = {
        x: curMin.x,
        y: curMax.y + buffer
      };

    }

    let r = width / 50;
    for (range of ranges) {
      // let curHeight = range.max.y - range.min.y;

        context.fillStyle = palette.fill;
        let points = util.poisson({
          r,
          min: range.min,
          max: range.max
        });

        for (point of points) {
          context.beginPath();
          context.arc(point.x, point.y, random.gaussian(r / 5), 0, 2 * Math.PI);
          context.closePath();
          context.fill();
        }

        r *= 0.8;
      
    }




    function makeRange(min, max) {
      return {
        min,
        max,
        random: () => {
          let x = util.getRandom(min.x, max.x);
          let y = util.getRandom(min.y, max.y);

          return { x, y }
        }
      }
    }



  };
};

canvasSketch(sketch, settings);
