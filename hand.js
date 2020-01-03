const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const util = require("./util");
const Color = require("canvas-sketch-util/color");

let seed  = 258;//window.performance.now();


const settings = {
  dimensions: [3600, 3600],
  suffix: seed
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "#35a0f2";
    context.fillRect(0, 0, width, height);
    let wMargin = width / 10;
    let hMargin = height / 10;

    random.setSeed(seed);
console.log(seed);
    let r = width / (util.getRandomInt(15, 20));
    let chance = random.chance(0.5);
    let points = util.poisson({
      width,
      height,
      wMargin,
      hMargin,
      r
    });
    let handSize = r / 2;

    let c = "#edb961";

    let [hue, s, l] = Color.parse(c).hsl;
    
    for (pos of points) {
      let w = random.gaussian(handSize, 10);
      let h = w * random.gaussian(1, 0.1);

  

      context.save();
      
      context.translate(pos.x, pos.y);
      let a = util.getRandom(0, 2 * Math.PI);
      let b = random.noise2D(pos.x, pos.y, 0.0005, 2*Math.PI);
      context.rotate(chance ? a : b);
      context.translate(-pos.x, -pos.y);


      let color = Color.offsetHSL(c, util.getRandom(-0.1, 0.1)*hue,  util.getRandom(-0.05, 0.05)*s, util.getRandom(-0.05, 0.05)*l).hex;

      context.fillStyle = color;
      context.strokeStyle = Color.offsetHSL(color, 0, 0, -35).hex;
      context.lineWidth = 6;
      drawHand({
        pos,
        w,
        h
      });

      context.restore();
    }



    function drawHand(params) {
      let { pos, w, h } = params;
      let backwards = random.chance(0.9);
      context.beginPath();
      if(backwards) {
        context.arc(pos.x, pos.y, w / 2, Math.PI, 0, true);
      }
      else{
        context.arc(pos.x, pos.y, w / 2, 0, Math.PI);

      }
      let width = w / 5;
      let aStart = (7 * Math.PI) / 24;
      let aEnd = 1.4644;
      let aInc = (aEnd - aStart) / 5;

      let a = aStart;



      let tStart = backwards ? 1 : 0;
      let tInc = backwards ? -1/5 : 1/5
      for (let t = tStart; (t < 1 && !backwards) || (t > 0.00001 && backwards); t += tInc) {
        let x = util.lerp(pos.x-w/2, pos.x+w/2, t);
        let height = Math.sin(a * a * a) * h;
        drawFinger({
          p: { x, y: pos.y },
          height,
          width,
          backwards
        });
        a += aInc;
      }
      context.closePath();
      
      context.fill();
      context.stroke();
    }

    function drawFinger(params) {
      let { p, height, width, backwards } = params;

      context.lineTo(p.x, p.y - height);
      if(backwards) {
        context.arc(
          p.x - width / 2,
          p.y - height,
          width / 2,
          2 * Math.PI,
          Math.PI,
          true
        );
        context.lineTo(p.x - width, p.y);
      }
      else {
        context.arc(
          p.x + width / 2,
          p.y - height,
          width / 2,
          Math.PI,
          2 * Math.PI
        );
        context.lineTo(p.x + width, p.y);
      }
   
    }
  };
};

canvasSketch(sketch, settings);
