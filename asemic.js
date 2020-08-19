const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');
const Color = require('canvas-sketch-util/color');
let seed;
seed = window.performance.now();

const settings = {
	dimensions: [3600, 3600],
	suffix: seed
};

const sketch = () => {
	return ({ context, width, height }) => {
		random.setSeed(seed)


    	context.fillStyle = 'white';
    	context.fillRect(0, 0, width, height);

    	let wMargin = width/10;
    	let hMargin = 0;

        let h = height - 2*hMargin;
        let w = width - 2*wMargin;

        let N = 75.0;

        let yInc = h/(N*1.2);
        let xInc = w/(N*2);

        for(let y = hMargin; y <= height-hMargin; y += random.gaussian(yInc)){
            let x = wMargin + random.gaussian(xInc*10, 75);
            let curPoint = {x, y};
            while(curPoint.x <= width-wMargin+random.gaussian(xInc,200)) {

                let mult = random.chance(0.85) ? 1 : -1;
                let nextPoint = {x: curPoint.x+random.gaussian(xInc, 5), y:curPoint.y + random.gaussian(yInc/700, 0.5)};

                mult = random.chance(0.85) ? 1 : -1;
                let midX = (curPoint.x+nextPoint.x)/random.gaussian(2,0.02);
                let midY = curPoint.y + mult*random.gaussian(yInc,10);

                let mid = {x:midX, y:midY};

                let points = [curPoint, mid, nextPoint];

                context.lineWidth = random.gaussian(1);
                if(random.chance(0.8)){
                util.drawQuadraticLine({
                    points,
                    context,
                    inc: 1.0/20.0
                })
                }
                curPoint = nextPoint;
                if(random.chance(0.01)){
                    break;
                }
            }
        }

	};
};

canvasSketch(sketch, settings);
