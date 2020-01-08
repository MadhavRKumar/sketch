const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed  = window.performance.now();

const settings = {
  dimensions: [3600, 4800],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    random.setSeed(seed)

    let palettes = [
      {
        bg: '#ffeab2',
        bg2: '#f9f9f9',
        stroke: '#3a3529',
        strokes: [
          {
            value: "#acd2e5",
            weight: 60
          },
          {
            value: "#f1ab86",
            weight: 25
          }
        ]
      }
    ]

    let palette = util.getRandomElem(palettes);

    context.fillStyle = palette.bg;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = palette.stroke;
    let wMargin = width/20;
    let hMargin = width/20;
    let effectiveHeight = height - 2 * hMargin;

    /// Constructing Ranges
    let ranges = [];

    let curMin = { x: wMargin, y: hMargin }
    context.lineWidth = 10;
    while (curMin.y <= height - hMargin/2) {
      let curMax = {
        x: width - wMargin,
        y: curMin.y + random.gaussian(effectiveHeight / 2, 200)
      }

      if (curMax.y > height-hMargin) {
        curMax.y = height-hMargin;
        ranges.push(makeRange(curMin, curMax, 0))
        break;
      }

      ranges.push(makeRange(curMin, curMax, 0))

      let buffer = random.gaussian(width / 50);
      curMin = {
        x: curMin.x,
        y: curMax.y + buffer
      };

    }

    for(let i = 0; i < ranges.length; i++) {
      let splitChance = 0.85;
      let range = ranges[i];

      if(random.chance(splitChance) && range.level <= 3) {
        ranges.splice(i,1, ...splitRange(range));
        i--;
      }

    }

    let maxSize = width/4;

    let circles = util.circlePack({maxSize, hMargin:hMargin*2, wMargin:wMargin*2, width, height});

    context.save();
    context.beginPath();
    for(circle of circles) {
      if(circle.r > (maxSize*0.1))
      {
        context.moveTo(circle.x+circle.r, circle.y);      
        context.arc(circle.x, circle.y, circle.r, 0, Math.PI*2);
      }


    }
    context.closePath();

      context.clip();

    context.fillStyle = palette.bg2;
    context.fillRect(0, 0, width, height);





    for(range of ranges) {
      context.fillStyle = random.weightedSet(palette.strokes);
      context.save();
      let offset = {x: util.getRandom(-width/150, width/150), y: util.getRandom(-width/150, width/150)}


      let cent = range.center();
      let fillCenter = {x: cent.x+offset.x, y: cent.y+offset.y}
      util.drawRect({
        context,
        center: fillCenter,
        w: range.width,
        h: range.height,
        fill: true,
        stroke: false
      })

      util.drawRect({
        context,
        center: range.center(),
        w: range.width,
        h: range.height,
      })



      
      context.restore();
    }
    

    context.restore();

    context.stroke();




    function makeRange(min, max, level) {
      return {
        min,
        max,
        random: () => {
          let x = util.getRandom(min.x, max.x);
          let y = util.getRandom(min.y, max.y);
    
          return {x,y}
        },
        center: () => {
          let x = (min.x+max.x)/2;
          let y = (min.y+max.y)/2;
          return {x,y}
        },
        width: (max.x-min.x),
        height: (max.y-min.y),
        level
      }
    }

    function splitRange(range) {
      let {min, max} = range;
      let buffer = Math.abs(random.gaussian(width / 75, 0.5));

      let isVert = random.chance(0.333) && range.height > buffer*2;
       
      let minVal,maxVal; 
      if(isVert) {
        minVal = min.y;
        maxVal = max.y;
      }
      else {
        minVal = min.x;
        maxVal = max.x;
      }

      let split = (minVal + maxVal) / random.gaussian(2, 0.1);
      
      
      let first, second;

      if(isVert) {
        first = makeRange(min, {x: max.x, y: split-buffer/2}, range.level + 1);
        second = makeRange( {x:min.x, y:split+buffer/2}, max, range.level + 1);
      }
      else {
        first = makeRange(min, {x: split-buffer/2, y: max.y}, range.level + 1);
        second = makeRange( {x:split+buffer/2, y:min.y}, max, range.level + 1);
      }



      return [first, second];
    }



  };
};

canvasSketch(sketch, settings);
