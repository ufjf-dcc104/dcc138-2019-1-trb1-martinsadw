function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(min, value, max) {
    return Math.min(Math.max(min, value), max);
}

function lerp(v0, v, v1) {
    return v0 + (v1 - v0) * v;
}

function round(v, p) {
    let mult = Math.pow(10, p);
    return (Math.round(v * mult) / mult);
}

function pMod(n, m) {
  return ((n % m) + m) % m;
}

function pad(s, n) {
    if (n != 2) console.warn("not implemented");

    return (s < 10 ? "0" + s : "" + s);
}

function uniformSampling(min, max, quant) {
    let points = [];
    for (let i = 0; i < quant; ++i) {
        points.push(new V2((Math.random() * (max.x - min.x)) + min.x,
                           (Math.random() * (max.y - min.y)) + min.y));
    }

    return points;
}

// https://stackoverflow.com/questions/42603609/even-distribution-of-random-points-in-2d
// https://www.jasondavies.com/poisson-disc/
// https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
function poissonSampling(min, max, r, k=30, p=1) {
    let size = max.clone().sub(min);

    let cellSize = r / Math.sqrt(2);
    let gridSize = Math.max(size.x, size.y)
    let gridLength = Math.ceil(gridSize / cellSize);
    let grid = []
    let activeList = []
    let points = []

    for (let i = 0; i < gridLength; ++i) {
        grid[i] = [];
        for (let j = 0; j < gridLength; ++j) {
            grid[i][j] = -1;
        }
    }

    let point = new V2(Math.random() * gridSize, Math.random() * gridSize);
    points.push(point);
    activeList.push(points.length - 1);
    grid[Math.floor(point.x / cellSize)][Math.floor(point.y / cellSize)] = points.length - 1;

    while (activeList.length > 0) {
        let activePoint = points[activeList.pop()];

        let newPoint = activePoint.clone();
        for (let n = 0; n < k; ++n) {
            // http://stackoverflow.com/a/9048443/64009
            let A = (2 / (3 * r * r));
            let t = Math.random() * 2 * Math.PI;
            let d = Math.sqrt(2 * Math.random() / A + r*r);

            newPoint.x = activePoint.x + d * Math.cos(t);
            newPoint.y = activePoint.y + d * Math.sin(t);

            if (newPoint.x > gridSize || newPoint.x < 0 || newPoint.y > gridSize || newPoint.y < 0)
                continue;

            if (grid[Math.floor(newPoint.x / cellSize)][Math.floor(newPoint.y / cellSize)] == -1) {
                points.push(newPoint.clone());
                activeList.push(points.length - 1);
                grid[Math.floor(newPoint.x / cellSize)][Math.floor(newPoint.y / cellSize)] = points.length - 1;
            }
        }
    }

    points = points.filter(function() {
        return (Math.random() < p);
    }).map(function(p) {
        return p.add(min);
    })

    return points;
}

// https://stackoverflow.com/questions/14819058/mixing-two-colors-naturally-in-javascript
// https://github.com/Qix-/color-string#readme
// https://css-tricks.com/converting-color-spaces-in-javascript/
function standardizeColor(str) {
    let c = document.createElement('canvas').getContext('2d');
    c.fillStyle = str;
    return c.fillStyle;
}

function colorFromString(colorString) {
    let color = {r: 0, g: 0, b: 0, a: 1};

    let regex = /^#(?:(?:([a-f0-9])([a-f0-9])([a-f0-9])([a-f0-9])?)|(?:([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?))$/i;
    let match = colorString.match(regex);
    if (match) {
        if (match[1]) {
            color.r = parseInt(match[1] + match[1], 16) / 255;
            color.g = parseInt(match[2] + match[2], 16) / 255;
            color.b = parseInt(match[3] + match[3], 16) / 255;
            if (match[4])
                color.a = parseInt(match[4] + match[4], 16) / 255;
        }
        else if (match[5]) {
            color.r = parseInt(match[5], 16) / 255;
            color.g = parseInt(match[6], 16) / 255;
            color.b = parseInt(match[7], 16) / 255;
            if (match[8])
                color.a = parseInt(match[8], 16) / 255;
        }
    }

    return color;
}

function colorToString(color) {
    let intColor = {r: Math.round(color.r * 255),
                    g: Math.round(color.g * 255),
                    b: Math.round(color.b * 255),
                    a: Math.round(color.a * 255)};

    let r = (intColor.r < 16 ? "0" + intColor.r.toString(16) : intColor.r.toString(16));
    let g = (intColor.g < 16 ? "0" + intColor.g.toString(16) : intColor.g.toString(16));
    let b = (intColor.b < 16 ? "0" + intColor.b.toString(16) : intColor.b.toString(16));
    let a = (intColor.a < 16 ? "0" + intColor.a.toString(16) : intColor.a.toString(16));

    // return "#" + r + g + b + (color.a < 1 ? a : "");
    return "#" + r + g + b + a;
}

function blendColor(cs0, v, cs1) {
    let c0 = colorFromString(cs0);
    let c1 = colorFromString(cs1);

    let c2 = {r: c0.r * (1 - v) + c1.r * v,
              g: c0.g * (1 - v) + c1.g * v,
              b: c0.b * (1 - v) + c1.b * v,
              a: c0.a * (1 - v) + c1.a * v};

    return colorToString(c2);
}


function angleDiffence(a1, a2) {
    let phi = Math.abs(a1 - a2) % (2*Math.PI);
    let distance = phi > Math.PI ? (2*Math.PI) - phi : phi;

    let sign = ((a1 - a2 >= 0 && a1 - a2 <= Math.PI) || (a1 - a2 >= -2*Math.PI && a1 - a2 <= -Math.PI) ? 1 : -1);

    return distance * sign;
}

function pointOnSegment(p, q, x, y) {
    return (Math.min(p.x, q.x) <= x && x <= Math.max(p.x, q.x) &&
            Math.min(p.y, q.y) <= y && y <= Math.max(p.y, q.y));
}

// https://www.geeksforgeeks.org/program-for-point-of-intersection-of-two-lines/
function segmentIntersectionPoint(p1, q1, p2, q2)
{
    // Line p1q1 represented as a1x + b1y = c1
    let a1 = q1.y - p1.y;
    let b1 = p1.x - q1.x;
    let c1 = a1 * (p1.x) + b1 * (p1.y);

    // Line p2q2 represented as a2x + b2y = c2
    let a2 = q2.y - p2.y;
    let b2 = p2.x - q2.x;
    let c2 = a2 * (p2.x) + b2 * (p2.y);

    let determinant = a1 * b2 - a2 * b1;

    if (determinant != 0)
    {
        let x = (b2 * c1 - b1 * c2) / determinant;
        let y = (a1 * c2 - a2 * c1) / determinant;

        if (pointOnSegment(p1, q1, x, y) && pointOnSegment(p2, q2, x, y))
            return new V2(x, y);
        // else
        //     console.log(a1, b1, c1, a2, b2, c2);
    }
    return null;
}

function V2(x, y) {
    this.x = x;
    this.y = y;
}

V2.prototype.lengthSq = function() {
    return (this.x * this.x) + (this.y * this.y);
}

V2.prototype.length = function() {
    return Math.sqrt(this.lengthSq());
}

V2.prototype.distanceSq = function(p) {
    return (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y);
}

V2.prototype.distance = function(p) {
    return Math.sqrt(this.distanceSq(p));
}

V2.prototype.clamp = function(min, max) {
    this.x = clamp(min, this.x, max);
    this.y = clamp(min, this.y, max);
    return this;
}

V2.prototype.clampLength = function(max) {
    let length = this.length();
    return (length > max ? this.mult(max / length) : this);
}

V2.prototype.clone = function() {
    return new V2(this.x, this.y);
}

V2.prototype.copy = function(p) {
    this.x = p.x;
    this.y = p.y;
    return this;
}

V2.prototype.normalize = function() {
    let length = this.length();

    if (length != 0) {
        this.x /= length;
        this.y /= length;
    }

    return this;
}

V2.prototype.cartToPolar = function() {
    let r = this.length();
    let t = Math.atan2(this.y, this.x);
    this.x = r;
    this.y = t;

    return this;
}

V2.prototype.polarToCart = function() {
    let x = this.x * Math.cos(this.y);
    let y = this.x * Math.sin(this.y);
    this.x = x;
    this.y = y;

    return this;
}

V2.prototype.perp = function() {
    let x = this.x;
    this.x = this.y;
    this.y = -x;
    return this;
}

V2.prototype.add = function(p) {
    this.x += p.x;
    this.y += p.y;
    return this;
}

V2.prototype.sub = function(p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
}

V2.prototype.mult = function(s) {
    this.x *= s;
    this.y *= s;
    return this;
}

V2.prototype.lerp = function(v, p) {
    this.x = lerp(this.x, v, p.x);
    this.y = lerp(this.y, v, p.y);
    return this;
}

V2.prototype.dot = function(p) {
    return (this.x * p.x) + (this.y * p.y);
}

V2.prototype.project = function(p) {
    let projectionSize = this.dot(p);
    this.copy(p).normalize().mult(projectionSize);
    return this;
}

// https://stackoverflow.com/questions/40835163/best-way-to-transform-mouse-coordinates-to-html5-canvass-transformed-context
V2.prototype.applyTransform = function(m) {
    this.x = this.x * m.a + this.y * m.c + m.e
    this.y = this.x * m.b + this.y * m.d + m.f
    return this;
}

// https://stackoverflow.com/a/11697909
function UnitBezier(p1x, p1y, p2x, p2y) {
    // pre-calculate the polynomial coefficients
    // First and last control points are implied to be (0,0) and (1.0, 1.0)
    this.cx = 3.0 * p1x;
    this.bx = 3.0 * (p2x - p1x) - this.cx;
    this.ax = 1.0 - this.cx -this.bx;

    this.cy = 3.0 * p1y;
    this.by = 3.0 * (p2y - p1y) - this.cy;
    this.ay = 1.0 - this.cy - this.by;
}

UnitBezier.prototype.epsilon = 1e-6; // Precision
UnitBezier.prototype.sampleCurveX = function(t) {
    return ((this.ax * t + this.bx) * t + this.cx) * t;
}
UnitBezier.prototype.sampleCurveY = function(t) {
    return ((this.ay * t + this.by) * t + this.cy) * t;
}
UnitBezier.prototype.sampleCurveDerivativeX = function(t) {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
}


UnitBezier.prototype.solveCurveX = function(x, epsilon) {
    var t0;
    var t1;
    var t2;
    var x2;
    var d2;
    var i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {
        x2 = this.sampleCurveX(t2) - x;
        if (Math.abs(x2) < epsilon)
            return t2;
        d2 = this.sampleCurveDerivativeX(t2);
        if (Math.abs(d2) < epsilon)
            break;
        t2 = t2 - x2 / d2;
    }

    // No solution found - use bi-section
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {
        x2 = this.sampleCurveX(t2);
        if (Math.abs(x2 - x) < epsilon)
            return t2;
        if (x > x2) t0 = t2;
        else t1 = t2;

        t2 = (t1 - t0) * .5 + t0;
    }

    // Give up
    return t2;
}
// Find new T as a function of Y along curve X
UnitBezier.prototype.solve = function (x, epsilon) {
    this.epsilon = epsilon || this.epsilon;
    return this.sampleCurveY(this.solveCurveX(x, this.epsilon));
}
