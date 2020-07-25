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

    let palettes = [
        {
            bg: '#ffc155',
            stroke: '#ffdd99'
        }
    ]

    let palette = util.getRandomElem(palettes);
    context.fillStyle = palette.bg;
    context.fillRect(0, 0, width, height);

    let wMargin = width/8;
    let hMargin = width/16;

    let rectWidth = width - 2*wMargin;
    let rectHeight = height - 2*hMargin;

    for(let i = 0; i < 10; i++) {
        let center = {x:width , y:random.gaussian(height/2, 100)};

        drawSpiral(center, -1);

    }
    let region = new Path2D();

    region.rect(wMargin, hMargin, rectWidth, rectHeight);

    context.fill(region);
    context.clip(region);

    let count = 3;
    for(let i = 0; i < count; i++) {
        let center = {x:wMargin, y: random.gaussian(height/2,100)};
        drawSpiral(center);
    }


    function drawSpiral(center, direction=1) {
        let inc = 0.01;

        let theta = 0.0;
        let a = 1;
        let b = 1;

        let xInc = util.getRandom(0.01, 0.05)*direction;
        while(theta < 700*Math.PI) {

            let c = Color.parse(palette.stroke);
            let alpha = random.value();
            let rgb = c.rgb;
            rgb.push(alpha);
            let stroke = Color.parse(rgb);
            let curX = (a + b*theta) * Math.cos(theta);
            let curY = (a + b*theta) * Math.sin(theta);
            let cur = {x:curX+center.x, y:curY+center.y};
            theta += random.gaussian(inc, 0.1);

            let nexX = (a + b*theta) * Math.cos(theta);
            let nexY = (a + b*theta) * Math.sin(theta);
            let next = {x:nexX+center.x, y:nexY+center.y};
            center.x += random.gaussian(xInc, 0.01);

            center.y += random.noise1D(theta, 10);
            context.strokeStyle = stroke.hex;
            util.line(cur, next, context);
        }

        random.permuteNoise();

        }





  };
};

canvasSketch(sketch, settings);
