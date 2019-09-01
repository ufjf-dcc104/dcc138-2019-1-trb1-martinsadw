let easeInterpolation = new UnitBezier(0.25, 0.1, 0.25, 1);
let easeInInterpolation = new UnitBezier(0.42, 0, 1, 1);
let easeOutInterpolation = new UnitBezier(0, 0, 0.58, 1);
let easeInOutInterpolation = new UnitBezier(0.42, 0, 0.58, 1);

// https://math.stackexchange.com/questions/1849784/calculate-miter-points-of-stroked-vectors-in-cartesian-plane
// https://css-tricks.com/tight-fitting-svg-shapes/
// https://www.w3.org/TR/fill-stroke-3/#propdef-stroke-linejoin
// https://www.w3.org/TR/svg-strokes/#LineJoin
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit
// http://www.cheat-sheets.org/saved-copy/HTML5_Canvas_Cheat_Sheet.pdf
function drawPath(ctx, points, options) {
    if (points.length <= 1)
        return;

    ctx.save();

    let widthValues = options.widthValues || [0.1];
    let widthKeys = options.widthKeys || [0];

    let colorValues = options.colorValues || ["#000"];
    let colorKeys = options.colorKeys || [0];

    let width = interpolateValues(points, widthKeys, widthValues, function(prev, t, next) {
        return lerp(prev, easeOutInterpolation.solve(t), next);
    });
    let color = interpolateValues(points, colorKeys, colorValues, function(prev, t, next) {
        return blendColor(prev, easeInInterpolation.solve(t), next);
    });

    // console.log(width);
    // console.log(color);

    // let width = [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.75, 0.85, 0.95, 1, 1, 1];
    // let color = ["#dd333300", "#dd333311", "#dd333311", "#dd333311", "#dd333322", "#dd333333", "#dd333344", "#dd333355", "#dd333366", "#dd333377", "#dd333388", "#dd333399", "#dd3333aa", "#dd3333bb", "#dd3333cc", "#dd3333dd", "#dd3333ee", "#dd3333ff", "#dd3333ff", "#dd3333ff"];

    let tangents = [];
    let weigths = [];
    let outer = [];
    tangents.push(points[1].clone().sub(points[0]).perp().normalize());
    weigths.push(width[0] * 0.5);
    outer.push(true);

    for (let i = 1; i < points.length - 1; ++i) {
        let line0 = points[i].clone().sub(points[i-1]);
        let line1 = points[i+1].clone().sub(points[i]);

        let perp0 = line0.clone().perp().normalize();
        let perp1 = line1.clone().perp().normalize();
        let tangent = perp0.clone().lerp(0.5, perp1).normalize();

        tangents.push(tangent);
        weigths.push(width[i] * 0.5 / perp0.dot(tangent));
        outer.push(perp0.dot(line1) <= 0);
    }

    tangents.push(points[points.length - 1].clone().sub(points[points.length - 2]).perp().normalize());
    weigths.push(width[points.length - 1] * 0.5);
    outer.push(true);

    // for (let i = 0; i < points.length - 1; ++i) {
    //     let grd = ctx.createLinearGradient(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
    //     grd.addColorStop(0, color[i]);
    //     grd.addColorStop(1, color[i+1]);
    //     ctx.fillStyle = grd;
    //
    //     ctx.beginPath();
    //     ctx.moveTo(points[i].x + tangents[i].x * weigths[i], points[i].y + tangents[i].y * weigths[i]);
    //     ctx.lineTo(points[i+1].x + tangents[i+1].x * weigths[i+1], points[i+1].y + tangents[i+1].y * weigths[i+1]);
    //     ctx.lineTo(points[i+1].x - tangents[i+1].x * weigths[i+1], points[i+1].y - tangents[i+1].y * weigths[i+1]);
    //     ctx.lineTo(points[i].x - tangents[i].x * weigths[i], points[i].y - tangents[i].y * weigths[i])
    //     ctx.fill();
    // }

    for (let i = 0; i < points.length - 1; ++i) {
        let perp = points[i+1].clone().sub(points[i]).perp().normalize();

        let grd = ctx.createLinearGradient(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
        grd.addColorStop(0, color[i]);
        grd.addColorStop(1, color[i+1]);
        ctx.fillStyle = grd;

        ctx.beginPath();
        if (outer[i]) {
            ctx.moveTo(points[i].x + tangents[i].x * width[i] * 0.5, points[i].y + tangents[i].y * width[i] * 0.5);
            ctx.arcTo(points[i].x + perp.x * width[i] * 0.5, points[i].y + perp.y * width[i] * 0.5,
                      points[i+1].x + tangents[i+1].x * weigths[i+1], points[i+1].y + tangents[i+1].y * weigths[i+1],
                      width[i] * 0.5);
            ctx.moveTo(points[i].x + perp.x * width[i] * 0.5, points[i].y + perp.y * width[i] * 0.5);
        }
        else {
            ctx.moveTo(points[i].x + tangents[i].x * weigths[i], points[i].y + tangents[i].y * weigths[i]);
        }

        if (outer[i+1]) {
            ctx.arcTo(points[i+1].x + perp.x * width[i+1] * 0.5, points[i+1].y + perp.y * width[i+1] * 0.5,
                      points[i+1].x + tangents[i+1].x * width[i+1] * 0.5, points[i+1].y + tangents[i+1].y * width[i+1] * 0.5,
                      width[i+1] * 0.5);
            ctx.lineTo(points[i+1].x + tangents[i+1].x * width[i+1] * 0.5, points[i+1].y + tangents[i+1].y * width[i+1] * 0.5);
            ctx.lineTo(points[i+1].x - tangents[i+1].x * weigths[i+1], points[i+1].y - tangents[i+1].y * weigths[i+1]);
        }
        else {
            ctx.lineTo(points[i+1].x + tangents[i+1].x * weigths[i+1], points[i+1].y + tangents[i+1].y * weigths[i+1]);

            ctx.lineTo(points[i+1].x - tangents[i+1].x * width[i+1] * 0.5, points[i+1].y - tangents[i+1].y * width[i+1] * 0.5);
            ctx.arcTo(points[i+1].x - perp.x * width[i+1] * 0.5, points[i+1].y - perp.y * width[i+1] * 0.5,
                      points[i].x - tangents[i].x * weigths[i], points[i].y - tangents[i].y * weigths[i],
                      width[i+1] * 0.5);
        }

        if (outer[i]) {
            ctx.lineTo(points[i].x - tangents[i].x * weigths[i], points[i].y - tangents[i].y * weigths[i])
            ctx.lineTo(points[i].x + tangents[i].x * width[i] * 0.5, points[i].y + tangents[i].y * width[i] * 0.5);
        }
        else {
            ctx.arcTo(points[i].x - perp.x * width[i] * 0.5, points[i].y - perp.y * width[i] * 0.5,
                      points[i].x - tangents[i].x * width[i] * 0.5, points[i].y - tangents[i].y * width[i] * 0.5,
                      width[i] * 0.5);
            ctx.lineTo(points[i].x - tangents[i].x * width[i] * 0.5, points[i].y - tangents[i].y * width[i] * 0.5);
        }
        ctx.fill();

        // ctx.fillStyle = "#00f";
        // ctx.beginPath();
        // ctx.arc(points[i].x, points[i].y, width[i] * 0.5, 0, Math.PI * 2);
        // ctx.fill();
    }

    // ctx.beginPath();
    // ctx.moveTo(points[0].x + tangents[0].x * weigths[0], points[0].y + tangents[0].y * weigths[0]);
    // for (let i = 1; i < tangents.length; ++i) {
    //     ctx.lineTo(points[i].x + tangents[i].x * weigths[i], points[i].y + tangents[i].y * weigths[i]);
    // }
    //
    // ctx.lineTo(points[tangents.length - 1].x - tangents[tangents.length - 1].x * weigths[tangents.length - 1], points[tangents.length - 1].y - tangents[tangents.length - 1].y * weigths[tangents.length - 1])
    // for (let i = tangents.length - 2; i >= 0; --i) {
    //     ctx.lineTo(points[i].x - tangents[i].x * weigths[i], points[i].y - tangents[i].y * weigths[i])
    // }
    // ctx.fill();

    // ctx.lineWidth = 0.1;
    // for (let i = 0; i < points.length - 1; ++i) {
    //     ctx.beginPath();
    //     ctx.moveTo(points[i].x, points[i].y)
    //     ctx.lineTo(points[i+1].x, points[i+1].y)
    //     ctx.stroke();
    // }
    //
    // ctx.lineWidth = 0.05;
    // for (let i = 0; i < points.length; ++i) {
    //     ctx.beginPath();
    //     // ctx.moveTo(points[i].x, points[i].y)
    //     ctx.moveTo(points[i].x - tangents[i].x * weigths[i], points[i].y - tangents[i].y * weigths[i])
    //     ctx.lineTo(points[i].x + tangents[i].x * weigths[i], points[i].y + tangents[i].y * weigths[i])
    //     ctx.stroke();
    // }

    ctx.restore();
}

function interpolateValues(points, keysList, valuesList, interpolationFunction) {
    let values = [];

    for (let i = 0, currentKey = 0; i < points.length; ++i) {
        let pointKey = i / (points.length - 1);

        while (currentKey < keysList.length && pointKey > keysList[currentKey]) ++currentKey;

        let prevKey = (currentKey <= 0 ? 0 : keysList[currentKey-1]);
        let nextKey = (currentKey >= keysList.length ? 1 : keysList[currentKey]);
        let prevValue = (currentKey <= 0 ? valuesList[currentKey] : valuesList[currentKey-1]);
        let nextValue = (currentKey >= keysList.length ? valuesList[currentKey-1] : valuesList[currentKey]);

        let interpolationValue;
        if (nextKey - prevKey <= 0)
            interpolationValue = 0;
        else
            interpolationValue = (pointKey - prevKey) / (nextKey - prevKey);

        let value = interpolationFunction(prevValue, interpolationValue, nextValue);

        values.push(value);
    }

    return values;
}
