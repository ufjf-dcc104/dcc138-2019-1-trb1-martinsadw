function Fragment() {
    this.pos = new V2(100, 100);
    this.vel = new V2(0, 0);
    this.size = 4;
    this.shapeIndex = 0;

    this.impulse = 6;
    this.invulnerable = true;
    this.invulnerabilityDuration = 0.5;

    this.shouldDestroy = false;
    this.ignoreOrbit = false;

    this.behaviors = []

    this.update = (gameState) => {
        let {player} = gameState;
        let dT = gameState.time - gameState.lastTime;

        if (this.impulse > 0) {
            this.impulse *= 0.95;
        }
        this.impulse = Math.max(0, this.impulse);

        this.invulnerable = false;
        if (this.invulnerabilityDuration > 0) {
            this.invulnerable = true;
            this.invulnerabilityDuration -= dT;
        }
        let fragmentVector = this.pos.clone().sub(player.pos);
        let fragmentDistance = fragmentVector.length();
        let fragmentDir = fragmentVector.clone().normalize();
        let attraction = fragmentDir.clone().mult(-5);

        this.pos.add(this.vel.clone().mult(1 + this.impulse));
        for (let i = 0; i < this.behaviors.length; ++i) {
            this.behaviors[i].bind(this)(gameState);
        }

        if (fragmentDistance < player.size * 0.8 + 70 && !this.invulnerable) {
            this.pos.add(attraction);
            this.ignoreOrbit = true;
        }
        else {
            this.ignoreOrbit = false;
        }

        if (fragmentDistance < (this.size * 0.5) + (player.size * 0.5) && !this.invulnerable) {
            player.collectFragment(this);
            this.destroy();
        }
    };

    this.draw = (gameState) => {
        let {ctx} = gameState;

        let shape = fragmentsShapeList[this.shapeIndex];
        ctx.save();
        ctx.fillStyle = "#f97";
        ctx.translate(this.pos.x, this.pos.y);
        ctx.scale(this.size, this.size);
        ctx.beginPath();
        ctx.moveTo(shape[0].x, shape[0].y);
        for (let i = 1; i < shape.length; ++i) {
            ctx.lineTo(shape[i].x, shape[i].y);
        }
        ctx.fill();

        ctx.restore();
    };

    this.destroy = () => {
        this.shouldDestroy = true;
    }
}

let fragmentsShapeList = [
    [new V2(1, 0), new V2(0, 0.6), new V2(-1, 0), new V2(0, -1)],
    [new V2(1, 0), new V2(0.8, 0.2), new V2(-0.4, 0.4), new V2(-1, -0.1), new V2(-0.4, -0.6), new V2(0.5, -0.5)],
    [new V2(0.5, 0.6), new V2(0.2, 0.3), new V2(0.2, 0.3), new V2(0.3, 1), new V2(-0.2, 0.2), new V2(-0.3, -0.6), new V2(0.2, -0.7), new V2(0.6, 0.0)],
    [new V2(1, 0.1), new V2(0.1, 0.5), new V2(-0.8, 0.4), new V2(-0.1, 0.2), new V2(-0.5, -0.1), new V2(-0.3, -0.3), new V2(0.6, -0.1)],
];
