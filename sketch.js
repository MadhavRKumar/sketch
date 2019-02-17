const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {

    let vertColors = [
      {
        h: 261,
        s: 70,
        l: 16
      },
      {
        h: 51,
        s: 50,
        l: 84
      },
      {
        h: 249,
        s: 9,
        l: 86
      }
    ];

    let horzColors = [ 
      {
        h: 20,
        s: 33,
        l: 98
      },
      {
        h: 60,
        s: 20,
        l: 1
      }

    ]

    context.fillStyle = '#eae4c0';
    context.fillRect(0, 0, width, height);

    // let count = 0;
    // for (let i = 0; i < width; i += 20) {
    //   for (let j = 0; j < height; j += 20) {
    //     let x = j;
    //     let y = i;

    //     if (count % 2 == 0) {
    //       x += 10;
    //     }
    //     context.fillStyle = "rgba(0.3, 0.3, 0.3, 0.3)";
    //     context.beginPath();
    //     context.ellipse(x, y, 1.5, 1.5, 0, 0, 2 * Math.PI);
    //     context.fill();

    //   }
    // }




    let rot = 100;



    for (let c = 0; c < rot; c++) {
      let rows, cols;
      let colors;
      if (c % 2 == 0) {
        rows = getRandomInt(50, 100);
        cols = getRandomInt(3, 20);
        colors = horzColors;
      }
      else {
        cols = getRandomInt(50, 100);
        rows = getRandomInt(3, 20);
        colors = vertColors;
      }
      let wMargin = 1,
        hMargin = 1,
        wOffset = (1 - wMargin) * width / 2,
        hOffset = (1 - hMargin) * height / 2;



      let
        wInc = width / cols * wMargin,
        hInc = height / rows * hMargin,
        grid = Array(rows),
        transX = Math.sqrt(2) * wInc / 4,
        transY = Math.sqrt(2) * hInc / 4;

      context.translate(wOffset + transX, hOffset + transY);


      for (let i = 0; i < grid.length; i++) {
        grid[i] = Array(cols).fill(true);
      }





      // context.font = "20px Arial";
      // for(let i = 0; i < cols; i ++) {
      //   for(let j=0; j< rows; j++) {
      //     context.fillText(i + "," + j, i*wInc, j*hInc);
      //   }
      // }



      while (!isFull(grid)) {
        let start = getStart(grid),
          pos = start,
          lineStart = { y: start.row * hInc, x: start.col * wInc }
        points = [];
        points.push(lineStart);



        let validDirs = getValidDirections(pos, grid);
        if (validDirs.length == 0) {
          grid[pos.row][pos.col] = false;
        }

        let draw = false;
        while (validDirs.length > 0) {
          draw = true;
          grid[pos.row][pos.col] = false;

          let dir = getRandomElem(validDirs);

          let lineEnd = {
            x: lineStart.x + wInc * dir[1] + getRandom(-1.75,1.75) * wInc * dir[0] * dir[0],
            y: lineStart.y + hInc * dir[0] + getRandom(-1.75,1.75) * hInc * dir[1] * dir[1]
          }

          points.push(lineEnd);


          pos.row += dir[0];
          pos.col += dir[1];

          lineStart = { y: pos.row * hInc, x: pos.col * wInc }

          validDirs = getValidDirections(pos, grid);
        }

        if (points.length > 2) {
          let color = getRandomElem(colors);

          context.strokeStyle = `hsla(${color.h}, ${color.s*getRandom(0.8, 1.2)}%, ${color.l*getRandom(0.9, 1.1)}%, ${getRandom(0.75,0.9)})`;
          let i;
          context.lineWidth = getRandom(0.2, 8);
          let offset = 0;
          let lineAmount = getRandomInt(2, 10);
          let offInc = map(context.lineWidth, 0.2, 8, 1, 8);


          for (let lines = 0; lines < lineAmount; lines++) {
            context.beginPath();
            context.moveTo(points[0].x + offset, points[0].y);
            for (i = 1; i < points.length - 2; i++) {
              let xc = (points[i].x + points[i + 1].x) / 2;
              let yc = (points[i].y + points[i + 1].y) / 2;

              context.quadraticCurveTo(points[i].x + offset, points[i].y, xc + offset, yc);
            }
            context.quadraticCurveTo(points[i].x+ offset, points[i].y, points[i + 1].x+ offset, points[i + 1].y);

            //context.fill();
            context.stroke();
            context.lineWidth *= getRandom(0.1, 1.5);
            offset += getRandom(0.1,1.5)*offInc;

          }


        }
      }


      context.translate(-wOffset - transX, -hOffset - transY);

    }


    function getValidDirections(p, grid) {
      let directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      return directions.filter(
        dir => {
          return grid[p.row + dir[0]] && grid[p.row + dir[0]][p.col + dir[1]]
        }
      );
    }


    function getStart(grid) {
      let pos = grid.reduce((acc, cur) => {

        acc.push(cur.reduce((ac, cu, index) => {
          if (cu) {
            ac.push(index);
          }

          return ac;
        },
          []));

        return acc;
      },
        []);

      let x = Math.floor(getRandom(0, grid.length));
      let y = getRandomElem(pos[x]);

      return { row: x, col: y };
    }

    function isFull(grid) {
      let reducer = (acc, cur) => acc || cur;
      return !grid.flat().reduce(reducer);
    }

    function getRandom(min, max) {
      return Math.random() * (max - min) + min
    }

    function getRandomInt(min, max) {
      return Math.floor(getRandom(min, max));
    }

    function getRandomElem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function map(n, start1, stop1, start2, stop2) {
      return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
    };
  };
};

canvasSketch(sketch, settings);
