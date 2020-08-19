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

        let wMargin = 0;//-width/10;
        let hMargin = 0;//-width/10;

        let N = 1500.0;
        let totalWidth = width - 2*wMargin;
        let xInc = totalWidth/N;
        let yInc = totalWidth/N;

        let len = xInc;

        let grid = [];

        for(let x = wMargin; x < width-wMargin; x+=xInc) {
            let col = [];
            for(let y = hMargin; y < height-hMargin; y+=yInc) {
                let theta = util.map(pattern(x,y), -1, 1, -2*Math.PI, 2*Math.PI);

                let sin = Math.sin(theta);
                let cos = Math.cos(theta);

                let vector = {x:cos, y:sin};

                col.push(util.normalize(vector));
            }
            grid.push(col);
        }

        let numPoints = 1000;
        let mag = 0.1;
        let max = 2;
        for(let count = 0; count < numPoints; count++) {

            let point = {x: util.getRandom(wMargin, width-wMargin), y: util.getRandom(hMargin, height-hMargin)}

            let iterations = 1000;
            let vel = {x: 0, y:0};
            for(let i = 0; i < iterations; i++) {
                if(point.x < wMargin || point.x > width-wMargin || point.y < hMargin || point.y > height-hMargin) {
                    break;
                }

                let prevPoint = {x:point.x, y:point.y};

                let vec = getGridLoc(point.x, point.y, grid,totalWidth);
                vel.x += vec.x*mag;
                vel.y += vec.y*mag;
                vel.x = util.clamp(vel.x, -max, max);
                vel.y = util.clamp(vel.y, -max, max);
                point.x += vel.x;
                point.y += vel.y;

                context.lineWidth = 2;
                util.line(prevPoint, point, context);
            }

        }

        function pattern(x, y) {
            let scale = 0.01;
            let offset = {x:random.noise2D(x+5.1,y+12,scale), y:random.noise2D(x+10,y+5.2,scale)};

            let offset2 = {
                x: random.noise2D(x+4*offset.x+1.7, y+4*offset.y+9.2, scale),
                y: random.noise2D(x+4*offset.x+8.3, y+4*offset.y+2.8, scale)
            }

            return random.noise2D(x + offset2.x, y+ offset2.y/2, 0.009);
        }

        function getGridLoc(x,y,grid,width) {
            let len = grid.length;
            let gridX = Math.floor(x/(width/len));
            let gridY = Math.floor(y/(width/len));
            return grid[gridX][gridY];

        }
    };
};

canvasSketch(sketch, settings);
