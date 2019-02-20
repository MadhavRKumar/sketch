const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#fdfffc';
    context.fillRect(0, 0, width, height);
    let colors = [
 
      {
        h: 0,
        s: 0,
        l: 100
      },
      //hsl(48, 87%, 53%)
      {
        h: 48,
        s: 87,
        l: 53
      },
      //hsl(204, 43%, 76%)
          {
            h: 204,
            s: 43,
            l: 76
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
    let N = 250,
        M = N
        gridX = width/M
        gridY = height/N;


    for (let i = 0; i < M; i++) {
      for (let j = 0; j < N; j++) {
      let points = new Array(4);
      let x, y, x2, y2;
      let prob = Math.random();
      if( prob < 0.33) {
        //top left
        x = i*gridX;
        y = j*gridY;

        //bottom right
        x2 = x+gridX;
        y2 = y+gridY;
      } else if (prob < 0.66){
        //bottom left
        x = i*gridX;
        y = j*gridY + gridY;

        //top right
        x2 = i*gridX + gridX;
        y2 = j*gridY;

      } else {
        //top middle
        x = i*gridX + gridX/2;
        y = j*gridY;
        
        //bottom middle
        x2 = x;
        y2 = j*gridY + gridY;

      }
      points[0] = { x: x, y: y};
      points[1] = { x: getRandom(i*gridX, i*gridX+gridX), y: getRandom(j*gridY, j*gridY+gridY) };
      points[2] = {x:getRandom(i*gridX, i*gridX+gridX), y: getRandom(j*gridY, j*gridY+gridY)}
      points[3] = { x: x2, y: y2 };

      drawLine(points, true);
    }
  }


    function drawLine(points, first) {
        let tInc = 0.05;
        let dist = Math.hypot(points[0].x - width / 2 + getRandom(-width / 8, width / 8), points[0].y - height / 2 + getRandom(-height / 12, height / 2));
        let index = clamp(Math.floor(map(dist, 0, width / 2, 0, colors.length)), 0, colors.length - 1);
        let color = Math.random() < 0.75 ? colors[index] : getRandomElem(colors);
        context.strokeStyle = `hsla(${color.h}, ${color.s * getRandom(0.8, 1.2)}%, ${color.l * getRandom(0.9, 1.1)}%, ${getRandom(0.75, 0.9)})`;
        context.lineWidth =  map(dist, 0, width / 2, 5, 1.5);

        for (let t = tInc; t < 1.000 + tInc; t += tInc) {

          let prevPoint = getPoint(points, t - tInc);
          let nextPoint = getPoint(points, t);


          context.beginPath();
          context.moveTo(prevPoint.x, prevPoint.y);
          context.lineTo(nextPoint.x, nextPoint.y);
          context.stroke();

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

      return -c * t*(t-2) + b;

    }

    function getRandomElem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    };

  };



};

canvasSketch(sketch, settings);
