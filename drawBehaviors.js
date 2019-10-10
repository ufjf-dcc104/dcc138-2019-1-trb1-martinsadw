function planetDraw(coreColor, auraColor, auraSize, fillStyle = "#f97") {
    return function (gameState) {
        let {player, availableHUD, ctx} = gameState;

        if (availableHUD.planetTragectory) {
            ctx.strokeStyle = "#cccccc66";
            ctx.setLineDash([5, 15]);
            ctx.beginPath();
            ctx.arc(this.orbit.center.x, this.orbit.center.y, this.orbit.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (availableHUD.planetGravityInfluence) {
            let influenceMinStrength = player.radialAcel;
            let influenceRadius = Math.sqrt(this.gravity.strength / influenceMinStrength);

            ctx.strokeStyle = "#cccccc33";
            ctx.fillStyle = "#cccccc11";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, influenceRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Draw Aura
        ctx.fillStyle = auraColor;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size * 0.5 + auraSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw Planet
        ctx.fillStyle = this.coreColor;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function fragmentDraw(shapeIndex, fillStyle = "#f97") {
    return function (gameState) {
        let {ctx} = gameState;

        let shape = fragmentsShapeList[shapeIndex];
        ctx.save();
        ctx.fillStyle = fillStyle;
        ctx.translate(this.pos.x, this.pos.y);
        ctx.scale(this.size, this.size);
        ctx.beginPath();
        ctx.moveTo(shape[0].x, shape[0].y);
        for (let i = 1; i < shape.length; ++i) {
            ctx.lineTo(shape[i].x, shape[i].y);
        }
        ctx.fill();

        ctx.restore();
    }
}

let fragmentsShapeList = [
    [new V2(1, 0), new V2(0, 0.6), new V2(-1, 0), new V2(0, -1)],
    [new V2(1, 0), new V2(0.8, 0.2), new V2(-0.4, 0.4), new V2(-1, -0.1), new V2(-0.4, -0.6), new V2(0.5, -0.5)],
    [new V2(0.5, 0.6), new V2(0.2, 0.3), new V2(0.2, 0.3), new V2(0.3, 1), new V2(-0.2, 0.2), new V2(-0.3, -0.6), new V2(0.2, -0.7), new V2(0.6, 0.0)],
    [new V2(1, 0.1), new V2(0.1, 0.5), new V2(-0.8, 0.4), new V2(-0.1, 0.2), new V2(-0.5, -0.1), new V2(-0.3, -0.3), new V2(0.6, -0.1)],
];
