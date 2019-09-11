// https://urchn.org/post/moar-cracks
// http://www.dgp.toronto.edu/~elf/.misc/GI99BlastFract.pdf

function generateFractureList() {
    fractures = []

    for (let i = 0; i < 6; ++i) {
        let fractureLength = randomRange(5, 10);
        fractures.push({
            // points: generateFracture(fractureLength),
            points: expandFracture(null, fractureLength),
            length: fractureLength,
            angle: randomRange(-Math.PI, Math.PI),
        });
    }

    return fractures;
}

function expandFracture(fracture, quant) {
    if (fracture == null || fracture.length <= 0) {
        fracture = [{
            parent: null,
            depth: 0, // Profundidade na árvore
            height: 0, // Distância até o herdeiro mais distante
            quantChildren: 0, // Quantidade de herdeiros
            children: [],
            pos: new V2(1, 0),
            cuttedBy: null, // Id do nó que interceptou o segmento
        }];
    }

    let baseDir = new V2(-1, 0).cartToPolar();

    for (let i = 0; i < quant; ++i) {
        let parent = 0;

        // Seleciona o nó pai
        for (let current = 0;;) {
            let currentNode = fracture[current];
            let selectionChance = 0.4 - currentNode.quantChildren * 0.02 - currentNode.children.length * 0.1;

            if (currentNode.cuttedBy != null) {
                current = currentNode.cuttedBy;
            }
            else if (Math.random() < selectionChance) {
                parent = current;
                break;
            }
            else if (currentNode.children.length <= 0) {
                parent = current;
                break;
            }
            else {
                current = currentNode.children[Math.floor(Math.random() * currentNode.children.length)];
            }
        }

        let parentNode = fracture[parent];
        let newNodeDir = baseDir.clone();
        // let newNodeDir;
        // if (parentNode.parent == null) {
        //     newNodeDir = baseDir.clone();
        // }
        // else {
        //     prevPoint = fracture[parentNode.parent];
        //     newNodeDir = parentNode.pos.clone().sub(prevPoint.pos).normalize();
        // }

        newNodeDir.x *= randomRange(0.1, 0.2);
        // newNodeDir.y += randomRange(-1 - parentNode.depth * 0.1, 1 + parentNode.depth * 0.1);
        newNodeDir.y += randomRange(-1.7 + parentNode.depth * 0.1, 1.7 - parentNode.depth * 0.1);
        // newNodeDir.y += randomRange(-1, 1) + randomRange(-1, 1);
        // newNodeDir.y += randomRange(-1.5, 1.5);
        newNodeDir.polarToCart().add(parentNode.pos);
        newNodeDir.clampLength(1);

        let cuttedBy = null;
        for (let j = 0; j < fracture.length; ++j) {
            let testNode = fracture[j];
            if (testNode.parent == null)
                continue;
            if (parent == j || parent == testNode.parent)
                continue;

            let testPrevNode = fracture[testNode.parent];
            let intersection = segmentIntersectionPoint(parentNode.pos, newNodeDir, testNode.pos, testPrevNode.pos);

            if (intersection != null) {
                newNodeDir.copy(intersection);
                cuttedBy = j;
            }
        }

        // Cria o novo nó
        let newNode = {
            parent: parent,
            depth: parentNode.depth + 1,
            height: 0,
            quantChildren: 0,
            children: [],
            pos: newNodeDir,
        };

        fracture.push(newNode);
        parentNode.children.push(fracture.length - 1)

        // Atualiza os nós até a raiz
        for (let current = parent; current != null;) {
            let currentNode = fracture[current];

            currentNode.quantChildren += 1;
            currentNode.height = Math.max(currentNode.height, (currentNode.depth - newNode.depth));

            current = currentNode.parent;
        }
    }

    return fracture;
}

function generateFracture(size) {
    let fracture = [{childs: 0, length: 0, parent: null, pos: new V2(1, 0)}];
    let parentQueue = [0];

    let baseDir = new V2(-1, 0).cartToPolar();

    for (let i = 0; i < size; ++i) {
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

        newPointDir.x *= randomRange(0.1, 0.2);
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
            ctx.lineWidth = Math.max(0.01, 0.04 - 0.005 * crack.depth);
            ctx.moveTo(basePoint.pos.x, basePoint.pos.y);
            ctx.lineTo(crack.pos.x, crack.pos.y);
            ctx.stroke();
        }
    }
}
