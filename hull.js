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
    let palettes = [
      {
        bg: "#e0e0e0",
        fills: [
          { value: "#3b7253", weight: 50},
          { value: "#333333", weight: 200 }
        ]
      }
    ]

    let palette = util.getRandomElem(palettes);


    context.fillStyle = palette.bg;
    context.fillRect(0, 0, width, height);

    let wMargin = width / 20;
    let hMargin = height / 20;
    
    let N = 8000;
    let points = [];



    for(let i = 0; i < N; i++) {
      let a = util.getRandom(0, 2*Math.PI)
      let r = ((width/2)-wMargin)*Math.sqrt(random.value());

      let x = width/2 + r * Math.cos(a);
      let y = height/2 + r * Math.sin(a);

      let p = {x:util.getRandom(wMargin, width-wMargin),
        y: util.getRandom(wMargin, width-wMargin)};

        p = {x,y}
      points.push(p);


    }

    // points = util.poisson(
    //   {
    //     context,
    //     r: 10,
    //     min: { x: wMargin, y: hMargin },
    //     max: { x: width - wMargin, y: height - hMargin }
    //   }
    // )



    let clusters = kMeans(points, util.getRandomInt(8, 30), { x: wMargin, y: hMargin }, { x: width - wMargin, y: height - hMargin });


    for (let i = 0; i < clusters.length; i++) {
      if(random.value() > 0.5) {
        let pts = clusters[i];

        let clust = kMeans(pts, util.getRandomInt(2, 4), { x: wMargin, y: hMargin }, { x: width - wMargin, y: height - hMargin });

        clusters.splice(i, 1, ...clust)
      }
       
      

    }


    for (points of clusters) {

      context.fillStyle = random.weightedSet(palette.fills);
      context.strokeStyle = random.weightedSet(palette.fills);
      let pts = util.convexHull(points);
      if (pts.length > 0) {
        let path = new Path2D();
        path.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i <= pts.length; i++) {
          let p1 = pts[i % pts.length];
          context.lineWidth = 10;
          path.lineTo(p1.x, p1.y);
        }
        path.closePath();
        if (random.value() < 0.80) {


          if (random.value() > 0.5) {
            let xOff = util.getRandom(-10, 10);
            let yOff = util.getRandom(-10, 10);
            let blur = util.getRandom(10, 20);
            context.filter = `drop-shadow(${xOff}px ${yOff}px ${blur}px #666666)`;
            context.fill(path);
          }
          else { 
            context.filter = "none";
            context.stroke(path);
          }
        }
      }
    }
    function kMeans(points, k, min, max) {
      let centroids = [];
      let clusters = [];
      for (let i = 0; i < k; i++) {
        centroids.push({
          x: util.getRandom(min.x, max.x),
          y: util.getRandom(min.y, max.y)
        })

        clusters.push([]);
      }



      let iterations = 50;

      for (let i = 0; i < iterations; i++) {
        for (let j = 0; j < k; j++) {
          clusters[j] = [];
        }
        for (p of points) {
          let index = 0;
          let closest = centroids[0];

          for (let j = 0; j < centroids.length; j++) {
            let c = centroids[j];
            let d = util.distSq(c, p);

            if (d < util.distSq(p, closest)) {
              closest = c
              index = j;
            }
          }

          clusters[index].push(p);
        }

        for (let j = 0; j < clusters.length; j++) {
          let curClust = clusters[j];

          let avg = { x: 0, y: 0 }
          for (p of curClust) {
            avg.x += p.x;
            avg.y += p.y
          }

          avg.x /= curClust.length;
          avg.y /= curClust.length;

          centroids[j] = avg;
        }
      }

      return clusters;

    }

    function localMinMax(pts) {
      return pts.reduce(
        (acc, val) => {
          acc.x = (val.x < acc.x) ? val.x : acc.x;
          acc.y = (val.y < acc.y) ? val.y : acc.y;
         
          return acc;
        }, pts[0]
      )
    }




  };
};

canvasSketch(sketch, settings);
