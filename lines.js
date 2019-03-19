const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [4800, 6000]
};

const sketch = () => {
  return ({ context, width, height }) => {
    let bg = '#fff2f2'
    let stroke = '#606060';
    context.fillStyle = bg;
    context.fillRect(0, 0, width, height);
    let wMargin = width/50,
      hMargin = wMargin,
      points = [],
      xCount = 5000,
      yCount = 50,
      xSpacing = (width - 2 * wMargin) / xCount,
      ySpacing = (height - 2 * hMargin) / yCount,
      colors = [
        stroke,
        '#f2ffff',
        bg,
        '#f2ffff',
        stroke
      ]


    // context.lineWidth = 10;
    // context.strokeStyle = bg;

    // let size = width / 200;
    // let w = 2 * size;
    // let h = Math.sqrt(3) * size;
    // let c = 0;
    // for (let i = 0; i <= width; i += w * 0.75) {
    //   for (let j = c % 2 == 0 ? 0 : -h / 2; j <= height; j += h) {
    //     if (random.chance(1)) {


    //       let r = size;
    //       context.beginPath();
    //       context.moveTo(i + r, j);
    //       for (let a = 0; a <= Math.PI * 2; a += 2 * Math.PI / 6) {
    //         let x = Math.cos(a) * r;
    //         let y = Math.sin(a) * r;
    //         context.strokeStyle = stroke;
    //         context.lineTo(i + x, j + y);
    //         context.stroke();

    //       }
    //       context.closePath();
    //     }
    //   }
    //   c++;
    // }




    context.strokeStyle = stroke;
    context.fillStyle = context.strokeStyle;
    context.lineCap = "round";



    let count = 0;




    for (let x = wMargin; x <= width - wMargin + xSpacing; x += xSpacing * random.gaussian(1, 0.5)) {
      let isEven = (count % 2 == 0);
      if (random.value() < 1) {
        for (let y = isEven ? height - hMargin : hMargin; y >= hMargin && y <= height - hMargin; y += isEven ? -ySpacing * random.gaussian(1, 0.5) : ySpacing * random.gaussian(1, 0.5)) {
          points.push({ x, y });
          if (isEven) {
            context.strokeStyle = stroke;
            context.fillStyle = context.strokeStyle;

            context.beginPath();
            context.arc(x, y, clamp(random.gaussian(4, 2), 0, 8), 0, 2 * Math.PI);
            context.fill();

            let dist = ySpacing * random.gaussian(1, 0.5) / 2;
            let fract = random.value();

            context.moveTo(x, y - (dist * fract));
            context.lineTo(x, y + (dist * (1 - fract)));
            context.lineWidth = random.gaussian(1);
            context.stroke();
            context.closePath();

            context.beginPath();
            let strokeIndex = Math.floor(map(x + getRandom(-width / 4, width / 4), 0, width, 0, colors.length));
            context.strokeStyle = colors[strokeIndex];

            let angle = random.noise3D(x / 2000, y / 2000, (count / 3000)) * 2 * Math.PI;
            let hx = Math.cos(angle) * dist;
            let hy = Math.sin(angle) * dist;
            context.moveTo(x - hx * fract, y - hy * (fract));
            context.lineTo(x + hx * (1 - fract), y + hy * (1 - fract));
            context.lineWidth = random.gaussian(4, 2);
            context.stroke();

            context.closePath();
          }
        }
      }
      count++;
    }

    // context.beginPath();
    // context.moveTo(wMargin, height - hMargin);
    // for(let i = 0; i < points.length; i++) {
    //   let curPoint = points[i];
    //   context.lineTo(curPoint.x, curPoint.y);
    //   context.lineWidth = random.gaussian(1);
    //   context.stroke();

    // }
    // context.closePath();








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

      return -c * t * (t - 2) + b
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

    function dist(x1, y1, x2, y2) {
      return Math.hypot(x1 - x2, y1 - y2);
    }

  };
};

canvasSketch(sketch, settings);
