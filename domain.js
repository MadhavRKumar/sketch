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

			let wMargin = 0;
			let hMargin = 0;
			
			let N = 1500.0;

			let xInc = width/N;
			let yInc = height/N;
			
			let len = xInc;

			for(let x = wMargin; x < width-wMargin; x+=xInc) {
				for(let y = hMargin; y < height-hMargin; y+=yInc) {
					let theta = util.map(pattern(x,y), -1, 1, 0, 2*Math.PI); 
					let sin = Math.sin(theta)*len;
					let cos = Math.cos(theta)*len;
					let start = {x: x+cos, y: y+sin};
					let end   = {x: x-cos, y: y-sin};

					util.line(start,end,context);
					//context.beginPath();
					//let color = Color.parse([theta, theta, theta]);
					//context.fillStyle = color.hex;
					//context.rect(x,y,len, len);
					//context.fill();
					//context.closePath();
			}
		}

		function pattern(x, y) {
			let scale = 0.01;
			let offset = {x:random.noise2D(x+5.1,y+12,scale), y:random.noise2D(x+10,y+5.2,scale)};
			return random.noise2D(x + offset.x*100, y+ offset.y*24, 0.001);  
		}
	};
};

canvasSketch(sketch, settings);
