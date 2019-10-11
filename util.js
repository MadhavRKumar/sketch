const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');



function drawCurve(params) {
    let {ps, context} = params;
    

    context.moveTo(ps[0].x, ps[0].y);


    for (i = 1; i < ps.length - 2; i ++)
    {
    var xc = (ps[i].x + ps[i + 1].x) / 2;
    var yc = (ps[i].y + ps[i + 1].y) / 2;
    context.quadraticCurveTo(ps[i].x, ps[i].y, xc, yc);
    }
    // curve through the last two points
    context.quadraticCurveTo(ps[i].x, ps[i].y, ps[i+1].x,ps[i+1].y)

}





function intersects(line1, line2) {

    let x1 = line1.start.x;
    let y1 = line1.start.y;
    let x2 = line1.end.x;
    let y2 = line1.end.y;


    let x3 = line2.start.x;
    let y3 = line2.start.y;
    let x4 = line2.end.x;
    let y4 = line2.end.y;


    let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom == 0) {
        return;
    }

    let tNum = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);

    let t = tNum / denom;

    let uNum = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3));

    let u = uNum / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        let point = { x: 0, y: 0 };
        point.x = (x1 + t * (x2 - x1));
        point.y = (y1 + t * (y2 - y1));
        return point;
    }

}



function drawRect(params) {
    let 
    {
        context, 
        center, 
        w, 
        h, 
        noFill = false
    } 
    = params;

    if(!context) throw new Error("drawRect requires a context!!!");

    let corner = { x: center.x, y: center.y };

    corner.x -= w / 2;
    corner.y -= h / 2;
    let path = new Path2D();
    drawLine({ x: corner.x, y: corner.y + h }, corner, { context: path, moveTo: true });
    drawLine(corner, { x: corner.x + w, y: corner.y }, { context: path });
    drawLine({ x: corner.x + w, y: corner.y }, { x: corner.x + w, y: corner.y + h }, { context: path })
    drawLine({ x: corner.x + w, y: corner.y + h }, { x: corner.x, y: corner.y + h }, { context: path })
    if (!noFill)
        context.fill(path);
    context.stroke(path);
    path.closePath();

}

function drawLine(start, end, options) {
    let { context, moveTo = false, control } = options;

    if(!context) throw new Error("drawLine requires a context!!!");


    let distance = dist(start.x, start.y, end.x, end.y);
    let dt;

    if (distance < 50) {
        dt = 2;
    }
    else if (distance < 100) {
        dt = 1;
    }
    else if (distance < 200) {
        dt = 0.5;
    } else if (dist < 400) {
        dt = 0.3;
    } else if (dist < 600) {
        dt = 0.2;
    }
    else {
        dt = getRandom(0.09, 0.11);
    }


    if (moveTo) {
        context.moveTo(start.x, start.y);
    }
    let prev = start;
    for (let t = 0; t <= 2.0; t += dt) {
        let cur = getSquigglePoint(start, end, t, control);
        let tan = { x: start.x - end.x, y: start.y - end.y };
        let normal = { x: -tan.y, y: tan.x };
        normal = normalize(normal);
        let ctrl = getSquiggleControlPoint(prev, cur, normal);
        context.quadraticCurveTo(ctrl.x, ctrl.y, cur.x, cur.y);

        prev = cur;
    }



}

function getSquigglePoint(start, end, t, control) {
    let tau = t / 2.0;
    let polyTerm = 15 * Math.pow(tau, 4)
        - 6 * Math.pow(tau, 5)
        - 10 * Math.pow(tau, 3);
    if (control) {
        return getQuadraticPoint([start, control, end], tau);
    }
    else {
        return {
            x: start.x + (start.x - end.x) * polyTerm,
            y: start.y + (start.y - end.y) * polyTerm
        };
    }
}

function getSquiggleControlPoint(prev, cur, norm) {
    let midPoint = { x: (prev.x + cur.x) / 2, y: (prev.y + cur.y) / 2 };

    let xDisplace = getRandom(-5, 5);
    let yDisplace = getRandom(-5, 5);

    midPoint.x += (xDisplace * norm.x);
    midPoint.y += (yDisplace * norm.y);

    return midPoint;
}


function poisson(params) {

    let {
        prePoints = [],
        r = 20,
        width,
        height,
        wMargin = 0,
        hMargin = 0
    } = params;

    let cellSize = r / Math.sqrt(2),
        rows = Math.ceil( width / cellSize) + 1,
        cols = Math.ceil( height / cellSize) + 1;
    let grid = new Array(rows), active = [], points = [];

    if (prePoints) {
        points.push(...prePoints);
    }
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        for (let j = 0; j < cols; j++) {
            grid[i][j] = (null);
        }
    }

    let p0 = { x: getRandom(wMargin, width - wMargin), y: getRandom(wMargin, width - wMargin) };
    active.push(p0);
    points.push(p0);
    for (let p of points) {
        if (isValid(p, grid, cellSize, rows, cols, r))
            insertPoint(grid, cellSize, p);
    }

    while (active.length > 0) {
        let randomIndex = getRandomInt(0, active.length);
        let p = active[randomIndex];

        let found = false;

        for (let tries = 0; tries < 100; tries++) {
            let theta = getRandom(0, 2 * Math.PI);
            let curR = getRandom(r, 2 * r);
            let pNew = { x: p.x + curR * Math.cos(theta), y: p.y + curR * Math.sin(theta) }

            if (!isValid(pNew, grid, cellSize, rows, cols, r)) { continue };

            points.push(pNew);

            insertPoint(grid, cellSize, pNew);
            active.push(pNew);
            found = true;
            break;
        }

        if (!found) {
            active.splice(randomIndex, 1);
        }

    }


    let filterPoints = points.filter(p => !prePoints.includes(p));

    return filterPoints;

    function isValid(p, grid, cellsize, rows, cols, radius) {

        if (p.x < wMargin || p.x >= width - wMargin || p.y < hMargin || p.y >= height - hMargin) {
            return false;
        }
        let xIndex = Math.floor(p.x / cellsize);
        let yIndex = Math.floor(p.y / cellsize);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let x = xIndex + i;
                let y = yIndex + j;
                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    if (grid[y][x] !== null) {
                        let pOther = grid[y][x];
                        let dx = pOther.x - p.x;
                        let dy = pOther.y - p.y;

                        if (dx * dx + dy * dy < radius * radius)
                            return false;
                    }

                }
            }
        }

        return true;
    }

    function insertPoint(grid, cellsize, p0) {
        let x = Math.floor(p0.x / cellsize);
        let y = Math.floor(p0.y / cellsize);

        grid[y][x] = p0;
    }
}



function drawQuadraticLine(params) {

    let 
    {
        points, 
        inc =  1.0 / 10, 
        context,
        draw = true,
    } 
    = params;

    if(!context) throw new Error("drawQuadraticLine requires a context!!!");

    let ps = [];
    if(draw) {
        context.beginPath();
    }
    let prev = getQuadraticPoint(points, 0);
    ps.push(prev);
    for (let t = inc; t <= 1; t += inc) {
        let cur = getQuadraticPoint(points, t);
        ps.push(cur);
        if(draw) {
            drawLine(prev, cur, { context: context });
            context.stroke();
        }
  
        prev = cur;
    }

    if(draw)
    {
        context.closePath();
    }

    return ps;
}



function getQuadraticPoint(points, t) {
    let omt = 1 - t;
    let omt2 = omt * omt;
    let t2 = t * t;
    let point = { x: 0, y: 0 };
    let [p0, p1, p2] = points;
    point.x = omt2 * p0.x + 2 * t * omt * p1.x + t2 * p2.x;

    point.y = omt2 * p0.y + 2 * t * omt * p1.y + t2 * p2.y;

    return point;
}

function getQuadraticTangent(points, t) {
    let [p0, p1, p2] = points;
    let point = { x: 0, y: 0 };

    point.x = 2 * (p0.x * (t - 1) - p1.x * (2 * t - 1) + p2.x * t);
    point.y = 2 * (p0.y * (t - 1) - p1.y * (2 * t - 1) + p2.y * t);

    return point;
}

function drawCubicLine(params) {

    let 
    {
        context,
        points, 
        draw = true, 
        inc =  0.15
    }
    = params;

    let ps = [];

    if(!context) throw new Error("drawCubicLine requires a context!!!");


    let prev = getCubicPoint(points, 0);
    context.beginPath();
    for (let t = inc; t <= 1 + inc; t += inc) {
        let point = getCubicPoint(points, t);
        ps.push(point);


        if (draw) {
            drawLine(prev, point, {});
            context.stroke();
        }


        prev = point;

    }
    context.closePath();



    return ps;
}



function getCubicPoint(points, t) {
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

// does not alter point, returns normalized vector
function normalize(point) {
    let mag = Math.hypot(point.x, point.y);

    let p = { x: point.x / mag, y: point.y / mag };

    return p;
}

function dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}

function getPointOnLine(p1, p2, t) {
    if (p1.x !== p2.x) {
        let a = (p2.y - p1.y) / (p2.x - p1.x);

        let x = (p2.x - p1.x) * t + p1.x;

        let y = a * (x - p1.x) + p1.y;

        return { x, y, r: 10 };
    }
    else {
        let x = p1.x;
        let y = (p2.y - p1.y) * t + p1.y;

        return { x, y, r: 10 };

    }
}

function getRandom(min, max) {
    return random.value() * (max - min) + min
}

function map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

function lerp(start, end, t) {
    return (end-start)*t + start;
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



let util = {
    drawCurve: drawCurve,
    intersects: intersects,
    drawRect: drawRect,
    drawLine: drawLine,
    poisson: poisson,
    drawQuadraticLine: drawQuadraticLine,
    drawCubicLine: drawCubicLine,
    normalize: normalize,
    dot: dot,
    getPointOnLine: getPointOnLine,
    getRandom: getRandom,
    map: map,
    lerp: lerp,
    quadMap: quadMap,
    getRandomElem: getRandomElem,
    getRandomInt: getRandomInt,
    clamp: clamp,
    dist: dist
};


module.exports = util;

