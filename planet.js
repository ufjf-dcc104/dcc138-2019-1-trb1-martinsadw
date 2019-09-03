function Planet(ctx) {
    this.ctx = ctx;

    this.pos = new V2(158, 158);
    this.strength = 100;
    this.maxStrength = 0.02;
    this.size = 80;
    this.auraSize = 3;
    this.featheringSize = 10;
    this.color = "#000000";
    this.auraBeginColor = "#000000ff";
    this.auraEndColor = "#22222200";

    this.coreColor = "#000";
    this.auraColor = "#000";

    this.updateColor = () => {
        this.coreColor = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, this.size * 0.5)
        this.coreColor.addColorStop(0, this.color);
        this.coreColor.addColorStop(1 - (this.featheringSize / this.size), this.color);
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
        this.pos.x = Math.cos(time * this.frequency * 2 * Math.PI + this.phase) * this.size * 5;
        this.pos.y = Math.sin(time * this.frequency * 2 * Math.PI + this.phase) * this.size * 5;
    };

    this.draw = (gameState) => {
        let {player, availableHUD} = gameState;

        this.updateColor();

        if (availableHUD.planetTragectory) {
            this.ctx.strokeStyle = "#cccccc66";
            this.ctx.setLineDash([5, 15]);
            this.ctx.beginPath();
            // this.ctx.arc(this.pos.x, this.pos.y, this.size * 5, 0, Math.PI * 2);
            this.ctx.arc(0, 0, this.size * 5, 0, Math.PI * 2);
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

        this.ctx.fillStyle = this.auraColor;
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.size * 0.5 + this.auraSize, 0, Math.PI * 2);
        this.ctx.fill();

        // this.ctx.fillStyle = this.color;
        this.ctx.fillStyle = this.coreColor;
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
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

    let bounceCoefficient = 2

    for (let i = 0; i < planets.length; ++i) {
        let planet = planets[i];

        let planetVector = planet.pos.clone().sub(player.pos);
        let planetDistance = planetVector.length();
        let planetDir = planetVector.clone().normalize();

        let collisionSpeed = player.vel.dot(planetDir);
        if (planetDistance < (planet.size * 0.5) + (player.size * 0.5) && collisionSpeed > 0) {
            player.vel.x += -planetDir.x * collisionSpeed * bounceCoefficient;
            player.vel.y += -planetDir.y * collisionSpeed * bounceCoefficient;

            console.log("-- collision info:");
            console.log(collisionSpeed);
            console.log(player.maxSpeed);
            console.log(collisionSpeed / player.maxSpeed);
            if (collisionSpeed / player.maxSpeed > 0.25) {
                let shakeDuration = 0.1 + (collisionSpeed / player.maxSpeed) * 0.2;
                let shakeIntensity = 0.25 + (collisionSpeed / player.maxSpeed) * 1.75;

                if (collisionSpeed / player.maxSpeed > 0.9) {
                    shakeDuration *= 2;
                    shakeIntensity *= 2;
                }

                for (let j = 0; j < 30; ++j) {
                    let fragmentPolarDir = planetDir.clone().mult(-1).cartToPolar();
                    fragmentPolarDir.x = randomRange(0.1, 0.3);
                    // TODO(andre:2019-09-03): Experimentar uma curva normal
                    fragmentPolarDir.y += randomRange(-0.2 * Math.PI, 0.2 * Math.PI) + randomRange(-0.2 * Math.PI, 0.2 * Math.PI) + randomRange(-0.2 * Math.PI, 0.2 * Math.PI);
                    let fragmentDir = fragmentPolarDir.clone().polarToCart();

                    let newFragment = new Fragment();
                    newFragment.pos.x = randomRange(-5, 5) + player.pos.x;
                    newFragment.pos.y = randomRange(-5, 5) + player.pos.y;
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
