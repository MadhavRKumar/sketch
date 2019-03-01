const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [1800, 2400]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#eac29f';
    context.fillRect(0, 0, width, height);
    let colors = [
      // {
      //   h: 48,
      //   s: 58,
      //   l: 63
      // },
      // {
      //   h: 48,
      //   s: 58,
      //   l: 63
      // },
      // //hsl(204, 43%, 76%)
      // {
      //   h: 204,
      //   s: 43,
      //   l: 50
      // },
      // //hsl(336, 52%, 36%)
      // {
      //   h: 336,
      //   s: 52,
      //   l: 36
      // },
      
      // {
      //   h: 0,
      //   s: 0,
      //   l: 10
      // },
      // {
      //   h: 0,
      //   s: 0,
      //   l: 99
      // }

      //hsl(358, 77%, 43%)
      {
        h : 358,
        s : 77,
        l : 43,
      },


    // hsl(28, 64%, 77%)
    {
      h : 28,
      s : 64,
      l : 77
    }


    ];

    for (let c = 0; c < 40; c++) {
      let N = getRandomInt(3, 35),
        M = getRandomInt(3, 72),
        gridX = width / M,
        gridY = height / N,
      gridYBase = gridY,
      randOff = getRandomInt(2, 20);

        for (let j = 0; j * gridY < height; j++) {
          for (let i = 0; i * gridX < width; i++) {

          let points = new Array(4);
          let x, y, x2, y2;
          let prob = Math.random();
          if (prob < 0.33) {
            //top left
            x = i * gridX;
            y = j * gridY;

            //bottom right
            x2 = x + gridX;
            y2 = y + gridY;
          } else if (prob < 0.66) {
            //bottom left
            x = i * gridX;
            y = j * gridY + gridY;

            //top right
            x2 = i * gridX + gridX;
            y2 = j * gridY;

          } else {
            //top middle
            x = i * gridX + gridX / 2;
            y = j * gridY;

            //bottom middle
            x2 = x;
            y2 = j * gridY + gridY;

          }
          points[0] = { x: x, y: y };
          points[1] = { x: getRandom(i * gridX , i * gridX + gridX), y: getRandom(j * gridY, j * gridY + gridY) };
          points[2] = { x: getRandom(i * gridX , i * gridX + gridX), y: getRandom(j * gridY, j * gridY + gridY) }
          points[3] = { x: x2, y: y2 };
          // if(random.noise3D(Math.sin(x/500), Math.cos(y/800), Math.tan((x+y)/1000)) > 0.01) {
          let n = 2;
          let distFromCenter = Math.hypot(points[0].x - width/2, points[0].y - height/4);
          let drawProb = quadMap(distFromCenter, 0, (n-1)*width/n, 0.75, 0.015);
          // console.log({drawProb, distFromCenter});
          if(random.value() < drawProb) {
          drawLine(points);
          }

          //gridY += getRandom(-randOff, randOff);

        }
        if(gridX - 10 > 10) {
          gridX -= getRandom(5, 10);
        }

        gridY = gridYBase;


      }


    }


    function drawLine(points) {
      let tInc = 0.05;
      let len = Math.hypot(points[0].x - points[3].x, points[0].y - points[3].y);
      let pointCount = map(len, 0, height/3, 0, 1000);
      let dist = Math.hypot(points[0].x - width / 2 + getRandom(-width / 8, width / 8), points[0].y - height / 2 + getRandom(-height / 12, height / 2));
      let index = clamp(Math.floor(map(dist, 0, width / 2, 0, colors.length)), 0, colors.length - 1);
      let color = Math.random() < 0.33 ? colors[index] : getRandomElem(colors);

      let w = Math.random() < 0.95 ? map(dist, 0, width / 2, 10, 1.5) : getRandom(1.5, 8);

      let offset = 0;
      let lineAmount = getRandomInt(4, 8);
      let offInc = map(w, 1.5, 10, 0.5, 6);


      for (let lines = 0; lines < lineAmount; lines++) {
        context.lineWidth *= getRandom(0.1, 1.5);


        for (let n = 0; n < pointCount; n++) {
          w = Math.random() < 0.5 ? map(dist, 0, width / 2, 3.5, 0.5) : getRandom(0.5, 3.5);
          let point = getPoint(points, Math.random());
          context.strokeStyle = `hsla(${color.h}, ${color.s * getRandom(0.9, 1.1)}%, ${color.l * getRandom(0.9, 1.1)}%, ${getRandom(0.1, 0.4)})`;
          context.fillStyle = context.strokeStyle;
          context.fillRect(point.x + offset, point.y - offset, w, w);

        }
        offset += getRandom(0.1, 3) * offInc;

      }

    }

    function getPoint(points, t) {
      let omt = 1 - t;
      let omt2 = omt * omt;
      let t2 = t * t;
      let point = { x: 0, y: 0 };

      point.x = points[0].x * (omt2 * omt) +
        points[1].x * (3 * omt2 * t) +
        points[2].x * (3 * omt * t2) +
        points[3].x * (t2 * t);

      point.y = points[0].y * (omt2 * omt) +
        points[1].y * (3 * omt2 * t) +
        points[2].y * (3 * omt * t2) +
        points[3].y * (t2 * t);

      return point;
    }

    function getRandom(min, max) {
      return random.value() * (max - min) + min
    }

    function map(n, start1, stop1, start2, stop2) {
      return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    }

    function quadMap(n, start1, stop1, start2, stop2) {
      let b = start2,
        c = stop2 - start2,
        t = n - start1,
        d = stop1 - start1;

      t /= d;

      return -c * t*(t-2) + b
    }

    function getRandomElem(arr) {
      return arr[Math.floor(random.value() * arr.length)];
    }

    function getRandomInt(min, max) {
      return Math.floor(getRandom(min, max));
    }

    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    };

  };



};

canvasSketch(sketch, settings);
