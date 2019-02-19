const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [2400, 1800]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#fdfffc';
    context.fillRect(0, 0, width, height);
    let colors = [
      {
        h: 0,
        s: 0,
        l: 25
      },
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
      //hsl(336, 52%, 36%)
      {
        h: 336,
        s: 52,
        l: 36
      },
      //hsl(204, 43%, 76%)
      {
        h: 204,
        s: 43,
        l: 76
      },



    ];
    let N = 100;
    for (let i = 0; i < N; i++) {
      let points = new Array(4);


      points[0] = { x: 0, y: getRandom(height * 0.45, height * 0.55) };
      points[1] = { x: getRandom(0, width), y: getRandom(0, height) };
      points[2] = { x: getRandom(0, width), y: getRandom(0, height) }
      points[3] = { x: width, y: getRandom(height * 0.05, height * 0.95) };

      drawLine(points, true);
    }



    function drawLine(points, first) {
        let tInc = 0.005;
        for (let t = tInc; t < 1.000 + tInc; t += tInc) {

          let prevPoint = getPoint(points, t - tInc);
          let nextPoint = getPoint(points, t);
          let dist = Math.hypot(nextPoint.x - width / 2 + getRandom(-width / 8, width / 8), nextPoint.y - height / 2 + getRandom(-height / 12, height / 2));
          let index = clamp(Math.floor(map(dist, 0, width / 2, 0, colors.length)), 0, colors.length - 1);
          let color = Math.random() < 0.95 ? colors[index] : getRandomElem(colors);
          context.strokeStyle = `hsla(${color.h}, ${color.s * getRandom(0.8, 1.2)}%, ${color.l * getRandom(0.9, 1.1)}%, ${getRandom(0.2, 0.5)})`;
          context.lineWidth = getRandom(0.5, 10);


          context.beginPath();
          context.moveTo(prevPoint.x, prevPoint.y);
          context.lineTo(nextPoint.x, nextPoint.y);
          context.stroke();

          if(Math.random() > 0.999 && first) {
            let pts = new Array(4);
            pts[0] = { x: prevPoint.x, y: prevPoint.y };
            pts[1] = { x: getRandom(0, width), y: getRandom(0, height) };
            pts[2] = { x: getRandom(0, width), y: getRandom(0, height) }

            if(Math.random() > 0.5) {
              pts[3] = { x: prevPoint.x, y: 0 };
            } else {
              pts[3] = { x: prevPoint.x, y: height };
            }

            drawLine(pts,false);

          }
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

    function getRandomElem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    };

  };



};

canvasSketch(sketch, settings);
