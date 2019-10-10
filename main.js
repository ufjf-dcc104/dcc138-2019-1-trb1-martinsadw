function Game() {
    this.gameState = {};

    this.gameState.canvas = document.getElementById('canvas');
    this.gameState.ctx = canvas.getContext('2d');

    this.gameState.cameraController = new CameraController();
    this.gameState.hudCamera = new Camera(this.gameState.ctx);
    this.gameState.hudCamera.isHUD = true;
    this.gameState.camera = new Camera(this.gameState.ctx);
    this.gameState.camera.size = 500;
    this.gameState.camera.widthHeightRatio = 0.5;
    this.gameState.player = new Player(this.gameState.ctx);

    this.gameState.planets = [];
    this.gameState.fragments = [];

    for (let i = 0; i < map.systems.length; ++i) {
        let system = map.systems[i];
        let systemCenter = new V2(system.pos.x, system.pos.y);

        for (let j = 0; j < system.planets.length; ++j) {
            let planet = system.planets[j];

            let newPlanet = new Planet(this.gameState.ctx);
            newPlanet.name = planet.name;
            newPlanet.orbitDuration = planet.orbitDuration;
            newPlanet.orbitPhase = planet.orbitPhase;
            newPlanet.orbitRadius = planet.orbitRadius;
            newPlanet.strength = planet.strength;
            newPlanet.maxStrength = planet.maxStrength;
            newPlanet.size = planet.size;
            newPlanet.auraSize = planet.auraSize;
            newPlanet.featheringSize = planet.featheringSize;
            newPlanet.color = planet.color;
            newPlanet.auraBeginColor = planet.auraBeginColor;
            newPlanet.auraEndColor = planet.auraEndColor;
            newPlanet.cracksColor = planet.cracksColor;
            newPlanet.systemCenter = systemCenter;

            this.gameState.planets.push(newPlanet);
        }

        // if (system.asteroidBelt) {
        //     let asteroidBelt = system.asteroidBelt;
        //     for (let j = 0; j < asteroidBelt.quant; ++j) {
        //         let polarPos = new V2(randomRange(asteroidBelt.beginRadius, asteroidBelt.endRadius), randomRange(0, 2 * Math.PI));
        //         let pos = polarPos.clone().polarToCart();
        //         let vel = pos.clone().perp().normalize().mult(randomRange(0.05, 0.1));
        //
        //         let newFragment = new Fragment();
        //         newFragment.pos.x = pos.x;
        //         newFragment.pos.y = pos.y;
        //         newFragment.vel.x = vel.x;
        //         newFragment.vel.y = vel.y;
        //         newFragment.size = asteroidBelt.size * randomRange(0.90, 1.2);
        //         newFragment.shapeIndex = Math.floor(Math.random() * 4);
        //         newFragment.behaviors.push(orbitBehavior(systemCenter, polarPos.x, randomRange(180, 250), polarPos.y))
        //         this.gameState.fragments.push(newFragment);
        //     }
        // }

        if (system.asteroidBelt) {
            let asteroidBelt = system.asteroidBelt;
            for (let j = 0; j < asteroidBelt.quant; ++j) {
                let polarPos = new V2(randomRange(asteroidBelt.beginRadius, asteroidBelt.endRadius), randomRange(0, 2 * Math.PI));
                let pos = polarPos.clone().polarToCart();
                let vel = pos.clone().perp().normalize().mult(randomRange(0.05, 0.1));

                let newFragment = new Body();
                newFragment.pos.x = pos.x;
                newFragment.pos.y = pos.y;
                newFragment.vel.x = vel.x;
                newFragment.vel.y = vel.y;
                newFragment.size = asteroidBelt.size * randomRange(0.90, 1.2);

                newFragment.updateBehaviors.push(orbitBehavior(systemCenter, polarPos.x, randomRange(180, 250), polarPos.y))
                newFragment.updateBehaviors.push(attractBehavior(5))
                newFragment.drawBehaviors.push(fragmentDraw(Math.floor(Math.random() * 4)))
                this.gameState.fragments.push(newFragment);
            }
        }

        if (system.star) {
            switch (system.star.type) {
                case "single":
                    let newPlanet = new Planet(this.gameState.ctx);
                    newPlanet.name = system.star.name;
                    newPlanet.orbitDuration = 1;
                    newPlanet.orbitPhase = 0;
                    newPlanet.orbitRadius = 0;
                    newPlanet.strength = system.star.strength;
                    newPlanet.maxStrength = system.star.maxStrength;
                    newPlanet.size = system.star.size;
                    newPlanet.auraSize = system.star.auraSize;
                    newPlanet.featheringSize = system.star.featheringSize;
                    newPlanet.color = system.star.color;
                    newPlanet.auraBeginColor = system.star.auraBeginColor;
                    newPlanet.auraEndColor = system.star.auraEndColor;
                    newPlanet.cracksColor = system.star.cracksColor;
                    newPlanet.systemCenter = systemCenter;

                    this.gameState.planets.push(newPlanet);
                    break;
                default:
                    console.warn("Unknown star type");
            }
        }
    }

    this.gameState.availableHUD = {
        planetTragectory: true,
        planetGravityInfluence: true,
        targetMarker: true,
        playerSize: true,
        gameTime: true,
    }

    this.gameState.time = 0;
    this.gameState.lastTime = 0;
    this.gameState.framerate = 60;

    this.gameState.input = 60;

    this.gameState.points = uniformSampling(new V2(0, 0), new V2(1, 1), 500)
    // this.gameState.points = poissonSampling(new V2(-400, -400), new V2(400, 400), 2, 30, 0.005);
    this.gameState.points = this.gameState.points.map(function (p) {
        return {
            p: p,
            c: "#ccccff66",
            radius: Math.random() * 1.5 + 0.2,
            phase: Math.random() * 2 * Math.PI,
            freq: Math.random() * 2 + 2,
            parallax: Math.random() * 0.15 + 0.15,
        };
    });

    this.step = (windowTime) => {
        let {canvas, ctx, points, lastTime, cameraController, camera, hudCamera, player, planets, availableHUD} = this.gameState;

        this.gameState.time = windowTime / 1000;
        let dT = this.gameState.time - this.gameState.lastTime;

        redraw();
        ctx.fillStyle = "#111144";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.gameState.camera.update(dT);
        this.gameState.hudCamera.update(dT);

        for (let i = 0; i < points.length; ++i) {
            ctx.fillStyle = points[i].c;
            ctx.beginPath();
            let posX = pMod(points[i].p.x * canvas.width - camera.pos.x * points[i].parallax, canvas.width);
            let posY = pMod(points[i].p.y * canvas.height + camera.pos.y * points[i].parallax, canvas.height);
            let oscillation = Math.abs(Math.sin(this.gameState.time * Math.PI / points[i].freq + points[i].phase));
            ctx.arc(posX, posY, points[i].radius * oscillation, 0, Math.PI * 2);
            ctx.fill();
        }

        this.gameState.cameraController.setCamera(this.gameState.camera);

        ctx.fillStyle = "#ffffff";
        camera.drawAxisDebug();
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(75, 22, 5, 3);

        ctx.fillStyle = "#0000ff";
        ctx.fillRect(-90, 55, 4, 6);

        ctx.fillStyle = "#00ffff";
        ctx.fillRect(-60, -90, 2, 10);

        ctx.strokeStyle = "#00000033";
        ctx.strokeRect(-500, -500, 1000, 1000);

        ctx.fillStyle = "#80b";

        ctx.beginPath();
        ctx.arc(1200,   -20,   10 * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1200,     0,   20 * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1200,    35,   40 * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(1500,  -180,  120 * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1500,     0,  200 * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1500,   320,  400 * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(3000, -1700, 1200 * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3000,     0, 2000 * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3000,  3100, 4000 * 0.5, 0, Math.PI * 2);
        ctx.fill();

        this.gameState.input = updateInput(inputConfig);

        updatePlanetGravity(this.gameState);
        updatePlanetCollision(this.gameState)

        if (this.gameState.input["debug2"]) {
            for (let j = 0; j < 15; ++j) {
                let polarPos = new V2(randomRange(camera.size * 0.15, camera.size * 0.3), randomRange(0, 2 * Math.PI));
                let pos = polarPos.clone().polarToCart().add(player.pos);

                let newFragment = new Fragment();
                newFragment.pos.x = pos.x;
                newFragment.pos.y = pos.y;
                newFragment.vel.x = 0;
                newFragment.vel.y = 0;
                newFragment.size = randomRange(camera.size * 0.004, camera.size * 0.010);
                newFragment.impulse = 5;
                newFragment.shapeIndex = Math.floor(Math.random() * 4);
                newFragment.behaviors.push(attractBehavior(randomRange(camera.size * 0.002, camera.size * 0.004)));
                this.gameState.fragments.push(newFragment);
            }
        }

        for (let i = 0; i < this.gameState.planets.length; ++i) {
            let planet = this.gameState.planets[i];
            planet.update(this.gameState);
        }
        for (let i = 0; i < this.gameState.fragments.length; ++i) {
            let fragment = this.gameState.fragments[i];
            fragment.update(this.gameState);
        }
        player.update(this.gameState);

        this.gameState.planets = this.gameState.planets.filter(filterDestroyedObjects);
        this.gameState.fragments = this.gameState.fragments.filter(filterDestroyedObjects);

        for (let i = 0; i < this.gameState.planets.length; ++i) {
            let planet = this.gameState.planets[i];
            planet.draw(this.gameState);
        }
        for (let i = 0; i < this.gameState.fragments.length; ++i) {
            let fragment = this.gameState.fragments[i];
            fragment.draw(this.gameState);
        }
        player.draw(this.gameState);

        if (camera.pos.x < player.pos.x - camera.dim.x * 0.1) {
            camera.pos.x = player.pos.x - camera.dim.x * 0.1
        }
        if (camera.pos.x > player.pos.x + camera.dim.x * 0.1) {
            camera.pos.x = player.pos.x + camera.dim.x * 0.1
        }
        if (camera.pos.y < player.pos.y - camera.dim.y * 0.1) {
            camera.pos.y = player.pos.y - camera.dim.y * 0.1
        }
        if (camera.pos.y > player.pos.y + camera.dim.y * 0.1) {
            camera.pos.y = player.pos.y + camera.dim.y * 0.1
        }

        // player.size = 2    // camera.size = 400;
        // player.size = 40   // camera.size = 2000;
        // player.size = 120  // camera.size = 3600;
        // player.size = 400  // camera.size = 8000;
        // let scaleFactor = 100 / Math.log(1 + player.size);
        // camera.size = player.size * scaleFactor;

        camera.size = 300 * Math.sqrt(player.size);

        let targetPos = this.gameState.planets[1].pos;
        let targetDir = targetPos.clone().sub(camera.pos);
        let targetDistance = targetDir.length();
        targetDir.normalize();
        let markerPos = targetDir.clone().mult(Math.min(camera.minSize * 0.45, targetDistance)).add(camera.pos);
        markerPos.applyTransform(camera.canvasToPixels());

        cameraController.setCamera(hudCamera);

        // ctx.fillRect(camera.dim.x * (0.5 - 0.1) * camera.scale,
        //              camera.dim.y * (0.5 - 0.1) * camera.scale,
        //              camera.dim.x * 0.2 * camera.scale,
        //              camera.dim.y * 0.2 * camera.scale);

        ctx.font = "30px sans-serif";
        ctx.fillStyle = "#add";
        ctx.fillText("Meteor Game", 10, 50);

        if (availableHUD.targetMarker) {
            if (targetDistance > camera.minSize * 0.45) {
                let targetPerpDir = targetDir.clone().perp();

                ctx.fillStyle = "#44d";
                ctx.beginPath();
                ctx.moveTo(markerPos.x                       , markerPos.y                       );
                ctx.lineTo(markerPos.x + targetPerpDir.x * 15, markerPos.y - targetPerpDir.y * 15);
                ctx.lineTo(markerPos.x +     targetDir.x * 25, markerPos.y -     targetDir.y * 25);
                ctx.lineTo(markerPos.x - targetPerpDir.x * 15, markerPos.y + targetPerpDir.y * 15);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(markerPos.x, markerPos.y, 15, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#002";
                ctx.beginPath();
                ctx.arc(markerPos.x, markerPos.y, 12, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#add";
                ctx.font = "15px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(Math.round(targetDistance) + " km", markerPos.x, markerPos.y - 25);
            }
            else {
                ctx.fillStyle = "#44d";
                ctx.beginPath();
                ctx.moveTo(markerPos.x     , markerPos.y - 50     );
                ctx.lineTo(markerPos.x + 15, markerPos.y - 50     );
                ctx.lineTo(markerPos.x     , markerPos.y - 50 + 25);
                ctx.lineTo(markerPos.x - 15, markerPos.y - 50     );
                ctx.fill();

                ctx.beginPath();
                ctx.arc(markerPos.x, markerPos.y - 50, 15, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#002";
                ctx.beginPath();
                ctx.arc(markerPos.x, markerPos.y - 50, 12, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#add";
                ctx.font = "15px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(Math.round(targetDistance) + " km", markerPos.x, markerPos.y - 70);
            }
        }
        ctx.textAlign = "left";

        this.gameState.framerate = this.gameState.framerate * 0.9 + (1 / dT) * 0.1;
        if (availableHUD.gameTime) {
            ctx.font = "13px sans-serif";
            ctx.fillStyle = "#add";
            ctx.fillText(pad(Math.round(this.gameState.framerate), 2), 25, canvas.height - 55);
            ctx.font = "11px sans-serif";
            ctx.fillText("FPS", 43, canvas.height - 55);

            ctx.font = "20px sans-serif";
            ctx.fillStyle = "#add";
            let timeMili = Math.floor(this.gameState.time * 1000) % 1000;
            let timeSec = Math.floor(this.gameState.time) % 60;
            let timeMin = Math.floor(this.gameState.time / 60) % 60;
            let timeHour = Math.floor(this.gameState.time / (60 * 60));
            ctx.fillText(timeHour + ":" + pad(timeMin, 2) + ":" + pad(timeSec, 2), 25, canvas.height - 30);

            ctx.font = "13px sans-serif";
            ctx.fillStyle = "#9bb";
            ctx.fillText("." + timeMili, 92, canvas.height - 30);
        }

        if (availableHUD.playerSize) {
            ctx.strokeStyle = "#cccccc66";
            for (let i = 0; i < 3; ++i) {
                ctx.beginPath()
                ctx.arc(canvas.width - 80, canvas.height - 80, 10 + 20*i, 0, Math.PI * 2);
                ctx.stroke();
            }

            let playerHUDSize = Math.log(player.size) * 5;
            // let playerHUDSize = Math.log(player.size) * 10;

            ctx.fillStyle = "#dd3333";
            ctx.beginPath()
            ctx.arc(canvas.width - 80, canvas.height - 80, playerHUDSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = "15px sans-serif";
            ctx.fillStyle = "#d55";
            ctx.textAlign = "end";
            ctx.fillText(round(player.mass, 1) + " kg", canvas.width - 150, canvas.height - 50)

            ctx.font = "15px sans-serif";
            ctx.fillStyle = "#d55";
            ctx.textAlign = "center";
            ctx.fillText(round(player.size, 1) + " km", canvas.width - 80, canvas.height - 150)

            ctx.strokeStyle = "#d55";
            ctx.beginPath()
            ctx.moveTo(canvas.width - 80 - playerHUDSize, canvas.height - 140)
            ctx.lineTo(canvas.width - 80 + playerHUDSize, canvas.height - 140)
            ctx.stroke();

            ctx.beginPath()
            ctx.moveTo(canvas.width - 80 - playerHUDSize, canvas.height - 145)
            ctx.lineTo(canvas.width - 80 - playerHUDSize, canvas.height - 135)
            ctx.stroke();

            ctx.beginPath()
            ctx.moveTo(canvas.width - 80 + playerHUDSize, canvas.height - 145)
            ctx.lineTo(canvas.width - 80 + playerHUDSize, canvas.height - 135)
            ctx.stroke();
        }

        this.gameState.lastTime = this.gameState.time;
        window.requestAnimationFrame(this.step);
    }

    window.requestAnimationFrame(this.step);
}

function filterDestroyedObjects(object, index, array) {
    return !object.shouldDestroy;
}

let game = new Game();
