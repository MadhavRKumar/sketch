const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const util = require("./util");
const Color = require("canvas-sketch-util/color");

let seed  = window.performance.now();


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

      context.beginPath();
      context.arc(pos.x, pos.y, w / 2, 0, Math.PI);
      let width = w / 5;
      let aStart = (7 * Math.PI) / 24;
      let aEnd = 1.4644;
      let a = aStart;
      let aInc = (aEnd - aStart) / 5;

      for (
        let x = pos.x - w / 2;
        x <= pos.x + w / 2 - width + 0.000001;
        x += width
      ) {
        let height = Math.sin(a * a * a) * h;
        drawFinger({
          p: { x, y: pos.y },
          height,
          width
        });
        a += aInc;
      }
      context.closePath();
      
      context.fill();
      context.stroke();
    }

    function drawFinger(params) {
      let { p, height, width } = params;

      context.lineTo(p.x, p.y - height);
      context.arc(
        p.x + width / 2,
        p.y - height,
        width / 2,
        Math.PI,
        2 * Math.PI
      );
      context.lineTo(p.x + width, p.y);
    }
  };
};

canvasSketch(sketch, settings);
