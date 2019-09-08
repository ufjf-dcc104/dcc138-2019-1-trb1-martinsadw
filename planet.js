function Planet(ctx) {
    this.ctx = ctx;

    this.name = "";
    this.orbitDuration = 100;
    this.orbitPhase = 0;
    this.orbitRadius = 500;
    this.strength = 100;
    this.maxStrength = 0.02;
    this.size = 80;
    this.auraSize = 3;
    this.featheringSize = 10;
    this.color = "#000000";
    this.auraBeginColor = "#000000ff";
    this.auraEndColor = "#22222200";
    this.cracksColor = "#444444";
    this.systemCenter = new V2(Math.random() * 10000, Math.random() * 10000);

    this.pos = new V2(0, 0);

    this.coreColor = "#000";
    this.auraColor = "#000";

    this.cracks = generateFracture();

    this.updateColor = () => {
        this.coreColor = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, this.size * 0.5)
        this.coreColor.addColorStop(0, this.color);
        this.coreColor.addColorStop(1 - (this.featheringSize / (this.size * 0.5)), this.color);
        this.coreColor.addColorStop(1, this.color + "00");

        this.auraColor = ctx.createRadialGradient(this.pos.x, this.pos.y, this.size * 0.5, this.pos.x, this.pos.y, this.size * 0.5 + this.auraSize);
        this.auraColor.addColorStop(0, this.auraBeginColor);
        this.auraColor.addColorStop(1, this.auraEndColor);
    };

    this.frequency = Math.random() * 0.009 + 0.001;
    this.phase = Math.random() * 2 * Math.PI;

    this.update = (gameState) => {
        let {time} = gameState;

        // this.pos.clone(new V2(Math.cos(time) * this.size, Math.sin(time) * this.size))
        this.pos.x = Math.cos(time * 2 * Math.PI / this.orbitDuration + this.orbitPhase) * this.orbitRadius + this.systemCenter.x;
        this.pos.y = Math.sin(time * 2 * Math.PI / this.orbitDuration + this.orbitPhase) * this.orbitRadius + this.systemCenter.y;
    };

    this.draw = (gameState) => {
        let {player, availableHUD} = gameState;

        this.updateColor();

        if (availableHUD.planetTragectory) {
            this.ctx.strokeStyle = "#cccccc66";
            this.ctx.setLineDash([5, 15]);
            this.ctx.beginPath();
            // this.ctx.arc(this.pos.x, this.pos.y, this.size * 5, 0, Math.PI * 2);
            this.ctx.arc(this.systemCenter.x, this.systemCenter.y, this.orbitRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        if (availableHUD.planetGravityInfluence) {
            let influenceMinStrength = player.radialAcel;
            let influenceRadius = Math.sqrt(this.strength / influenceMinStrength);

            this.ctx.strokeStyle = "#cccccc33";
            this.ctx.fillStyle = "#cccccc11";
            this.ctx.beginPath();
            this.ctx.arc(this.pos.x, this.pos.y, influenceRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }

        // Draw Aura
        this.ctx.fillStyle = this.auraColor;
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.size * 0.5 + this.auraSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Planet
        // this.ctx.fillStyle = this.color;
        this.ctx.fillStyle = this.coreColor;
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Cracks
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        this.ctx.scale(this.size * 0.5 - this.featheringSize, this.size * 0.5 - this.featheringSize);
        ctx.strokeStyle = this.cracksColor;
        drawFracture(this.ctx, this.cracks);
        this.ctx.restore();
    };
}

function updatePlanetGravity(gameState) {
    let {ctx, player, planets, cameraController, camera, hudCamera} = gameState;

    for (let i = 0; i < planets.length; ++i) {
        let planet = planets[i];

        let planetVector = planet.pos.clone().sub(player.pos);
        let planetDistance = planetVector.length();
        let planetDir = planetVector.clone().normalize();
        let gravityForce = planet.strength / (planetDistance * planetDistance);
        let gravity = planetDir.clone().mult(Math.min(gravityForce, planet.maxStrength))

        // cameraController.setCamera(hudCamera);
        // ctx.font = "15px monospace";
        // ctx.fillStyle = "#00ffff";
        // ctx.fillText("    Gravity: " + round(gravityForce, 5), 10, 140);
        // cameraController.setCamera(camera);

        player.vel.x += gravity.x;
        player.vel.y += gravity.y;
    }
}

function updatePlanetCollision(gameState) {
    let {player, planets, fragments, cameraController} = gameState;

    let bounceCoefficient = 1

    for (let i = 0; i < planets.length; ++i) {
        let planet = planets[i];

        let planetVector = player.pos.clone().sub(planet.pos);
        let planetDistance = planetVector.length();

        if (planetDistance < (planet.size * 0.5) + (player.size * 0.5) && player.vel.dot(planetVector) < 0) {
            let collisionNormal = planetVector.clone().normalize();
            let collisionPos = collisionNormal.clone().mult(planet.size * 0.5).add(planet.pos);
            let collisionSpeed = Math.abs(player.vel.dot(collisionNormal));

            player.vel.x += collisionNormal.x * collisionSpeed * (1 + bounceCoefficient);
            player.vel.y += collisionNormal.y * collisionSpeed * (1 + bounceCoefficient);

            console.log("-- collision info:");
            console.log("collisionSpeed: " + collisionSpeed);
            console.log("player.maxSpeed: " + player.maxSpeed);
            console.log("ratio: " + collisionSpeed / player.maxSpeed);
            if (collisionSpeed / player.maxSpeed > 0.25) {
                let shakeDuration = 0.1 + (collisionSpeed / player.maxSpeed) * 0.2;
                let shakeIntensity = 0.25 + (collisionSpeed / player.maxSpeed) * 1.75;

                if (collisionSpeed / player.maxSpeed > 0.9) {
                    shakeDuration *= 2;
                    shakeIntensity *= 2;
                }

                for (let j = 0; j < 30; ++j) {
                    let fragmentPolarDir = collisionNormal.clone().cartToPolar();
                    fragmentPolarDir.x = randomRange(0.1, 0.3);
                    // TODO(andre:2019-09-03): Experimentar uma curva normal
                    fragmentPolarDir.y += randomRange(-0.2 * Math.PI, 0.2 * Math.PI) + randomRange(-0.2 * Math.PI, 0.2 * Math.PI) + randomRange(-0.2 * Math.PI, 0.2 * Math.PI);
                    let fragmentDir = fragmentPolarDir.clone().polarToCart();

                    let newFragment = new Fragment();
                    newFragment.pos.x = randomRange(-5, 5) + collisionPos.x;
                    newFragment.pos.y = randomRange(-5, 5) + collisionPos.y;
                    newFragment.vel.copy(fragmentDir);
                    newFragment.impulse = randomRange(15, 30);
                    newFragment.size = Math.random() * 2 + 2;
                    newFragment.shapeIndex = Math.floor(Math.random() * 4);
                    fragments.push(newFragment);
                }

                player.size -= collisionSpeed / player.maxSpeed;
                cameraController.currentCamera.cameraShake(shakeDuration, shakeIntensity)
            }
        }
    }
}
