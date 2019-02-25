const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [1800, 2400]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#fdfffc';
    context.fillRect(0, 0, width, height);
    let colors = [

      //hsl(48, 87%, 53%)
      {
        h: 48,
        s: 58,
        l: 63
      },
      {
        h: 48,
        s: 58,
        l: 63
      },
      //hsl(204, 43%, 76%)
      {
        h: 204,
        s: 43,
        l: 50
      },
      //hsl(336, 52%, 36%)
      {
        h: 336,
        s: 52,
        l: 36
      },

      {
        h: 0,
        s: 0,
        l: 10
      }



    ];

    for (let c = 0; c < 2; c++) {
      let N = 10,
        M = 200,
        gridX = width / M,
        gridY = height / N
      gridYBase = gridY;


      for (let i = 0; i * gridX < width; i++) {
        for (let j = 0; j * gridY < height; j++) {
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
          points[1] = { x: getRandom(i * gridX, i * gridX + gridX), y: getRandom(j * gridY, j * gridY + gridY) };
          points[2] = { x: getRandom(i * gridX, i * gridX + gridX), y: getRandom(j * gridY, j * gridY + gridY) }
          points[3] = { x: x2, y: y2 };

          drawLine(points, true);

        }
        gridY += getRandom(-7.5, 15);


      }


    }


    function drawLine(points, first) {
      let tInc = 0.05;
      let dist = Math.hypot(points[0].x - width / 2 + getRandom(-width / 8, width / 8), points[0].y - height / 2 + getRandom(-height / 12, height / 2));
      let index = clamp(Math.floor(map(dist, 0, width / 2, 0, colors.length)), 0, colors.length - 1);
      let color = Math.random() < 0.75 ? colors[index] : getRandomElem(colors);
      context.strokeStyle = `hsla(${color.h}, ${color.s * getRandom(0.9, 1.1)}%, ${color.l * getRandom(0.9, 1.1)}%, ${getRandom(0.5, 0.9)})`;
      context.lineWidth = Math.random() < 0.95 ? map(dist, 0, width / 2, 8, 1.5) : getRandom(1.5, 8);

      let offset = 0;
      let lineAmount = getRandomInt(2, 8);
      let offInc = map(context.lineWidth, 1.5, 8, 3, 10);


      for (let lines = 0; lines < lineAmount; lines++) {
        context.lineWidth *= getRandom(0.1, 1.5);


        for (let t = tInc; t < 1.000 + tInc; t += tInc) {

          let prevPoint = getPoint(points, t - tInc);
          let nextPoint = getPoint(points, t);



          context.beginPath();
          context.moveTo(prevPoint.x + offset, prevPoint.y);
          context.lineTo(nextPoint.x + offset, nextPoint.y);
          context.stroke();

        }
        offset += getRandom(0.1, 1.5) * offInc;

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
      return Math.random() * (max - min) + min
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

      return -c * t * (t - 2) + b;

    }

    function getRandomElem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
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
