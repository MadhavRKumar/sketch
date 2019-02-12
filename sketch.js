const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#FFFCFC';
    context.fillRect(0, 0, width, height);
    
    let count = 0;
    for(let i = 0; i < width; i += 20) {
      for(let j = 0; j < height; j += 20) {
        let x = j;
        let y = i;

        if(count% 2 == 0) {
          x += 10;
        }
        context.fillStyle = "rgba(0.3, 0.3, 0.3, 0.3)";
        context.beginPath();
        context.ellipse(x, y, 1.5, 1.5, 0, 0, 2*Math.PI);
        context.fill();

      }
    }
    
    
    
    
    let rot = 2;



    for (let c = 0; c < rot; c++) {
      let rows, cols;

      if(c % 2 == 0) {
        rows = getRandomInt(100, 800);
        cols = getRandomInt(10, 50);
      }
      else {
        cols = getRandomInt(100, 800);
        rows = getRandomInt(10, 50);
      }
      let wMargin = 0.9,
      hMargin = 0.9,
      wOffset = (1-wMargin)*width/2,
      hOffset = (1-hMargin)*height/2;



      let
        wInc = width / cols * wMargin,
        hInc = height / rows * hMargin,
        grid = Array(rows),
        transX = Math.sqrt(2) * wInc / 2,
        transY = Math.sqrt(2) * hInc / 2;

        context.translate(wOffset, hOffset);


      for (let i = 0; i < grid.length; i++) {
        grid[i] = Array(cols).fill(true);
      }



   

      //     context.font = "20px Arial";
 



      while (!isFull(grid)) {
        let start = getStart(grid),
          pos = start,
          lineStart = { y: start.row * hInc, x: start.col * wInc }
        points = [];
        points.push(lineStart);

        context.beginPath();
        context.moveTo(lineStart.x, lineStart.y);

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
            x: lineStart.x + wInc * dir[1] + getRandom(-1.2, 1.2)* wInc * dir[0] ,
            y: lineStart.y + hInc * dir[0] + getRandom(-1.2, 1.2) * hInc * dir[1]
          }

          points.push(lineEnd);


          pos.row += dir[0];
          pos.col += dir[1];

          lineStart = { y: pos.row * hInc, x: pos.col * wInc }

          validDirs = getValidDirections(pos, grid);
        }

        if (points.length > 2) {
          context.strokeStyle = '#333333';
          let i;
          for (i = 1; i < points.length - 2; i++) {
            let xc = (points[i].x + points[i + 1].x) / 2;
            let yc = (points[i].y + points[i + 1].y) / 2;

            context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            context.lineWidth = getRandom(1, 2.5);
          }
          context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);

          context.stroke();
          


        }
      }


      context.translate(-wOffset, -hOffset);

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
  };
};

canvasSketch(sketch, settings);
