const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const util = require('./util');

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    let wMargin = width/10;
    let hMargin = height/10;

    let r = width/8;

    let points = util.poisson(
      {
        width,
        height,
        wMargin,
        hMargin,
        r
      }
    );
      let w = r/2;
      let h = w*1.1;
    context.fillStyle = 'white';
    
    for(pos of points) { 
      
      context.save();
      context.translate(pos.x, pos.y);
      context.rotate(util.getRandom(0, 2*Math.PI));
      context.translate(-pos.x, -pos.y);
      drawHand( {
        pos,
        w,
        h
      })

      context.restore();
    }

    // let w = width/2;
    // let h = height/3;
    // let pos = {x:width/2, y:height/2};
    // drawHand({
    //   pos,
    //   w,
    //   h
    // })
    



    function drawHand(params) {
      let {
        pos,
        w,
        h
      } = params;
      
      context.beginPath();
      context.arc(pos.x, pos.y, w/2, 0, Math.PI);
     let width = w/5;
     let aStart = 7*Math.PI/24;
     let aEnd = 1.4644;
     let a = aStart;
     let aInc = (aEnd - aStart)/5;

      for(let x = pos.x - w/2; x <= (pos.x + w/2 - width + 0.000001); x += width) { 

        let height = Math.sin(a*a*a)*h;
        drawFinger(
          {
            p: {x, y: pos.y},
            height,
            width
          } 
        );
        a += aInc;
  
      }
      context.closePath();
      context.fill();
      context.stroke();

    }

    function drawFinger(params) {
      let {
        p,
        height,
        width
      } = params;

      context.lineTo(p.x, p.y - height);
      context.arc(p.x + width/2, p.y - height, width/2, Math.PI, 2*Math.PI);
      context.lineTo(p.x +width, p.y);


    }

    




  };
};

canvasSketch(sketch, settings);
