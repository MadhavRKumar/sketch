const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#01010a';
    context.fillRect(0, 0, width, height);
    let nodes = [],
      nodeCount = getRandomInt(4000, 6000),
      wMargin = width/50,
      hMargin = height/50,
      maxDist = width / 10,
      colors = [
        // '#f6dada',
        '#efefef',
        '#01010a'
      ];

    console.log(nodeCount);

    context.fillStyle = '#f0f0f0'


    for (let i = 0; i < nodeCount; i++) {
      nodes.push({ x: getRandom(wMargin, width - wMargin), y: getRandom(hMargin, height - hMargin), r: getRandom(3, 10) })
    }

    for(let c = 0; c < colors.length; c++) {

    let clusters = getCluster(nodes);
    for (cluster of clusters) {
      if (cluster.length > 3) {


        for (let i = 0; i < cluster.length; i++) {
          let node = cluster[i];
          let connections = [];

          for (let j = 0; j < cluster.length; j++) {
            let other = cluster[j];
            if (dist(node.x, node.y, other.x, other.y) < maxDist && connections.length < node.r) {
              connections.push(other);
            }
          }


          for (other of connections) {
            // context.beginPath();
            // context.moveTo(node.x, node.y);
            // context.lineTo(other.x, other.y);
            // context.stroke();
            // context.closePath();

            let lineNum = getRandomInt(1, 2);
            for (let i = 0; i < lineNum; i++) {
              let points = new Array(4);

              let dx = other.x - node.x;
              let dy = other.x - node.x;
              let normMag = Math.hypot(dx, dy);
              let norm = { x: -dy / normMag, y: dx / normMag };
              let d = dist(node.x, node.y, other.x, other.y) / getRandom(1,3);
              let mag = getRandom(-d, d);


              norm.x *= mag;
              norm.y *= mag;
              let midPoint = getMidPoint(node, other);

              points[0] = node;
              points[1] = { x: midPoint.x + norm.x, y: midPoint.y + norm.y };
              points[2] = points[1];
              points[3] = other;
              context.strokeStyle = random.value() < 0.6 ? colors[c%colors.length] : getRandomElem(colors);

              drawLine(points);
            }
            // context.beginPath()
            // context.arc(midPoint.x, midPoint.y, node.r, 0, 2*Math.PI);
            // context.fill();
            // context.closePath();
          }
        }
      }


      // for(node of nodes) {
      //   context.beginPath()
      //   context.arc(node.x, node.y, node.r, 0, 2*Math.PI);
      //   context.fill();
      //   context.closePath();
      // }


    }
    }

    console.log(random.getSeed())


    function getCluster(nodes) {
      let k;
      if(random.value() > 0.5) {
        k = random.gaussian(5);
      }
      else {
        k = random.gaussian(11, 2);
      }
      //console.log(k);
      let iterations = 20;
      let centers = [];
      let clusters = [];
      for (let i = 0; i < k; i++) {
        centers.push({ x: getRandom(wMargin, width - wMargin), y: getRandom(hMargin, height - hMargin) });
      }
      for (let i = 0; i < iterations; i++) {

        clusters = [];

        for (let j = 0; j < k; j++) {
          clusters.push([]);
        }

        for (let j = 0; j < nodes.length; j++) {
          let n = nodes[j];
          let minIndex;
          let minDist = width * 2;
          for (let l = 0; l < centers.length; l++) {
            let c = centers[l];
            let d = dist(c.x, c.y, n.x, n.y);
            if (d < minDist) {
              minIndex = l;
              minDist = d;
            }
          }

          clusters[minIndex].push(n);

        }

        for (let j = 0; j < clusters.length; j++) {
          let avg = { x: 0, y: 0 };
          for (let l = 0; l < clusters[j].length; l++) {
            let n = clusters[j][l];
            avg.x += n.x;
            avg.y += n.y;
          }
          avg.x /= clusters[j].length;
          avg.y /= clusters[j].length;
          centers[j] = avg;
        }

      }
      return clusters;
    }



    function drawLine(points) {
      let tInc = 0.05;
      let totalDist = dist(points[0].x, points[0].y, points[3].x, points[3].y);
      context.beginPath();

      context.moveTo(points[0].x, points[0].y);
      let maxWidth = quadMap(totalDist, 0, maxDist, 0, 4);
      maxWidth = random.gaussian(maxWidth);
      for (let t = 0; t < 1 + tInc; t += tInc) {
        let point = getPoint(points, t);
        let d = dist(point.x, point.y, points[3].x, points[3].y);
        context.lineWidth = map(d, 0, totalDist, 0, maxWidth);
        context.lineTo(point.x, point.y);
        context.stroke();
      }


      context.closePath();
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

    function getMidPoint(start, end) {
      return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
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
