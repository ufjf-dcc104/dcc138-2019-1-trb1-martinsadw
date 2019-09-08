function generateFracture() {
    let fracture = [{childs: 0, length: 0, parent: null, pos: new V2(1, 0)}];
    let parentQueue = [0];

    let baseDir = new V2(-1, 0).cartToPolar();

    for (let i = 0; i < 100; ++i) {
        let parent;
        if (Math.random() < 0.2) {
            parent = Math.floor(Math.random() * fracture.length)
        } else {
            parent = parentQueue.shift();

            if (Math.random() < (0.0 + fracture[parent].childs * 0.2) && parentQueue.length > 0) {
                --i;
                continue;
            }
            else {
                parentQueue.push(parent);
            }
        };

        let basePoint = fracture[parent];

        let newPointDir = baseDir.clone();
        // let newPointDir;
        // if (basePoint.parent == null) {
        //     newPointDir = baseDir.clone();
        // }
        // else {
        //     prevPoint = fracture[basePoint.parent];
        //     newPointDir = basePoint.pos.clone().sub(prevPoint.pos).normalize();
        // }

        newPointDir.x *= randomRange(0.075, 0.15);
        // newPointDir.y += randomRange(-1 - basePoint.length * 0.1, 1 + basePoint.length * 0.1);
        newPointDir.y += randomRange(-1.7 + basePoint.length * 0.1, 1.7 - basePoint.length * 0.1);
        // newPointDir.y += randomRange(-1, 1) + randomRange(-1, 1);
        // newPointDir.y += randomRange(-1.5, 1.5);
        newPointDir.polarToCart().add(basePoint.pos);
        newPointDir.clampLength(1);

        let cutted = false;
        for (let j = 0; j < fracture.length; ++j) {
            let testBasePoint = fracture[j];
            if (testBasePoint.parent == null)
                continue;
            if (parent == j || parent == testBasePoint.parent)
                continue;

            let testPrevPoint = fracture[testBasePoint.parent];
            let intersection = segmentIntersectionPoint(basePoint.pos, newPointDir, testBasePoint.pos, testPrevPoint.pos);

            if (intersection != null) {
                newPointDir.copy(intersection);
                cutted = true;
            }
        }

        if (!cutted)
            parentQueue.push(fracture.length);

        fracture[parent].childs++;
        fracture.push({childs: 0, length: basePoint.length + 1, parent: parent, pos: newPointDir});
    }

    return fracture;
}

function drawFracture(ctx, fracture) {
    for (let i = 0; i < fracture.length; ++i) {
        let crack = fracture[i];
        if (crack.parent != null) {
            let basePoint = fracture[crack.parent];
            ctx.beginPath();
            ctx.lineWidth = Math.max(0.01, 0.04 - 0.005 * crack.length);
            ctx.moveTo(basePoint.pos.x, basePoint.pos.y);
            ctx.lineTo(crack.pos.x, crack.pos.y);
            ctx.stroke();
        }
    }
}
