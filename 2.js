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


    context.fillStyle = '#efefef';
    context.fillRect(0, 0, width, height);
    let string = createRandomString(20);
    let wMargin = width/10;
    let hMargin = height/10;

    context.strokeStyle = "#333333";


    let word = convert(string);
    let count = 10;

    let rectW = (width-2*wMargin)/word.length;
    let rectH = (height-2*hMargin) / count;
    let inc = random.gaussian(rectH);
    for(let y = hMargin; y < height-hMargin; y += inc) {
    let x = random.gaussian(wMargin, 20);

    
    for(let i = 0; i < word.length; i++) {
      let char = word[i];

      if(char == "1") {
        //context.fillRect(x, wMargin, rectW+give, rectH);
        context.lineWidth = random.gaussian(5, 10);
        context.beginPath();
        util.drawLine({x, y:y- random.gaussian(inc/2, 10)}, {x, y: y + random.gaussian(inc, 50)}, {context});
        context.stroke();
        context.closePath();
      }

      x += random.gaussian(rectW, 5);
    }

    string = random.shuffle(string.split('')).join('');
    word = convert(string);
    inc = random.gaussian(rectH, 10);
  }


    function convert(string) {
      let ret = "";

      for(let i = 0; i < string.length; i++) {
        ret += string[i].charCodeAt(0).toString(2);
      }
      return ret;
      
    }

    function createRandomString(len) {
      let result           = '';
      let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;
      for ( let i = 0; i < len; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }




  };
};

canvasSketch(sketch, settings);
