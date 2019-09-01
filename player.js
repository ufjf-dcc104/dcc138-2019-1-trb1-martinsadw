function Player(ctx) {
    this.ctx = ctx;

    this.pos = new V2(0, -40);
    this.vel = new V2(0.5, 0);
    this.maxSpeed = 4;
    this.radialAcel = 0.008;
    this.acel = 0.05;
    this.decel = 0.05;
    this.size = 2;
    this.segmentDistance = 0.1;
    this.trail = [this.pos.clone()];

    this.angleThreshold = 0.4;
    this.cMax = 0.12;
    this.cMin = 0.008;

    this.nextTrailPoint = 0;
    this.trailDelay = 0.04;
    this.trailSize = 30;

    this.a = false;

    this.update = function(gameState) {
        let {time, input, cameraController, camera, hudCamera} = gameState;

        // simpleControl.bind(this)(gameState);
        radialControl.bind(this)(gameState);

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // this.smoothTrail();
        // this.shakeTrail();

        // /* remove trail with movement
        // let pos = new V2(this.pos.x + 0.5, this.pos.y + 0.5);
        // if (pos.sub(this.trail[this.trail.length-1]).lengthSq() > this.segmentDistance * this.segmentDistance) {
        //     this.trail.push(new V2(this.pos.x + 0.5, this.pos.y + 0.5));
        //     if (this.trail.length > trailSize)
        //         this.trail.splice(0, 1);
        // }
        // */

        // /* remove trail with time
        if (time > this.nextTrailPoint) {
            this.nextTrailPoint += this.trailDelay;

            this.trail.push(new V2(this.pos.x + 0.5, this.pos.y + 0.5));
            if (this.trail.length > this.trailSize)
                this.trail.splice(0, 1);
        }
        else {
            this.trail[this.trail.length-1].copy(new V2(this.pos.x + 0.5, this.pos.y + 0.5))
        }
        // */
    }

    this.draw = function(gameState) {
        let gradientTrail = {
            widthValues: [ 0, this.size ],
            widthKeys: [ 0, 1 ],
            colorValues: [
                "#5500ff00",
                "#aa33aacc",
                "#dd3333ff",
            ],
            colorKeys: [
                0,
                0.7,
                1,
            ],
        };

        this.ctx.fillStyle = "#dd3333";
        drawPath(this.ctx, this.trail, gradientTrail);

        this.ctx.beginPath();
        this.ctx.arc(this.pos.x + 0.5, this.pos.y + 0.5, this.size*0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    this.smoothTrail = function() {
        for (let i = 0; i < this.trail.length; ++i) {
            if (i > 0) this.trail[i].add(this.trail[i-1].clone().sub(this.trail[i]).mult(0.1));
            if (i > 1) this.trail[i].add(this.trail[i-2].clone().sub(this.trail[i]).mult(0.05));
            if (i > 2) this.trail[i].add(this.trail[i-3].clone().sub(this.trail[i]).mult(0.03));
        }
    };

    this.shakeTrail = function() {
        let trailFloatness = 1 * this.vel.length();
        for (let i = 0; i < this.trail.length; ++i) {
            this.trail[i].add(new V2((Math.random() - 0.5) * trailFloatness, (Math.random() - 0.5) * trailFloatness));
        }
    };
}

function simpleControl(gameState) {
    let {time, input} = gameState;

    this.maxSpeed = 2.5;
    this.acel = 0.15;
    this.decel = 0.15;

    let acel = new V2(input["horizontal"], input["vertical"]).clampLength(1).mult(this.maxSpeed);

    let dVel = acel.clone().sub(this.vel);
    let dVelLength = dVel.length();
    dVel.normalize().mult(this.acel).clampLength(dVelLength);

    this.vel.x += dVel.x;
    this.vel.y += dVel.y;

    if (input["horizontal"] == 0) {
        if (this.vel.x > 0) {
            this.vel.x -= this.decel;
            this.vel.x = Math.max(0, this.vel.x);
        }
        if (this.vel.x < 0) {
            this.vel.x += this.decel;
            this.vel.x = Math.min(0, this.vel.x);
        }
    }
    else {
        this.vel.x += input["horizontal"] * this.acel;
    }

    if (input["vertical"] == 0) {
        if (this.vel.y > 0) {
            this.vel.y -= this.decel;
            this.vel.y = Math.max(0, this.vel.y);
        }
        if (this.vel.y < 0) {
            this.vel.y += this.decel;
            this.vel.y = Math.min(0, this.vel.y);
        }
    }
    else {
        this.vel.y += input["vertical"] * this.acel;
    }

    this.vel.x = clamp(-this.maxSpeed, this.vel.x, this.maxSpeed);
    this.vel.y = clamp(-this.maxSpeed, this.vel.y, this.maxSpeed);

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
}

function radialControl(gameState) {
    let {time, input, cameraController, camera, hudCamera} = gameState;

    let acel = new V2(input["horizontal"], input["vertical"]).clampLength(1).mult(this.maxSpeed);

    let velPolar = this.vel.clone().cartToPolar();
    let acelPolar = acel.clone().cartToPolar();

    dVelR = acelPolar.x - velPolar.x;
    dVelT = angleDiffence(acelPolar.y, velPolar.y);

    cameraController.setCamera(hudCamera);
    this.ctx.font = "15px monospace";
    this.ctx.fillStyle = "#00ffff";
    this.ctx.fillText("      Speed: " + round(velPolar.x, 2), 10, 100);
    this.ctx.fillText("  Direction: " + round(velPolar.y, 2), 10, 120);
    // this.ctx.fillText("acelPolar.x: " + acelPolar.x, 10, 140);
    // this.ctx.fillText("acelPolar.y: " + acelPolar.y, 10, 160);
    // this.ctx.fillText("      dVelR: " + dVelR, 10, 180);
    // this.ctx.fillText("      dVelT: " + dVelT, 10, 200);
    cameraController.setCamera(camera);

    if (acelPolar.x <= 0.01) {
        acelPolar.y = velPolar.y;
        dVelT = 0;
    }

    if (acelPolar.x > 0.01) {
        if (velPolar.x < 0.01) {
            velPolar.y = acelPolar.y;
            dVelT = 0;
        }

        if (Math.abs(dVelT) > this.angleThreshold*Math.PI)
            velPolar.x *= 0.98;
    }

    if (Math.abs(dVelT) < 0.35*Math.PI)
        velPolar.x += clamp(-0.00000, dVelR, this.radialAcel)

    let c = this.cMax - (velPolar.x * ((this.cMax - this.cMin) / this.maxSpeed));

    if (acelPolar.x > 0.01)
        velPolar.y += clamp(-c, dVelT, c)

    velPolar.x = clamp(0, velPolar.x, this.maxSpeed)

    this.vel.copy(velPolar).polarToCart();
}
