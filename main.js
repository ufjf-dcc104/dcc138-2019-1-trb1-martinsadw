function Game() {
    this.gameState = {};

    this.gameState.canvas = document.getElementById('canvas');
    this.gameState.ctx = canvas.getContext('2d');

    this.gameState.cameraController = new CameraController();
    this.gameState.hudCamera = new Camera(this.gameState.ctx);
    this.gameState.hudCamera.isHUD = true;
    this.gameState.camera = new Camera(this.gameState.ctx);
    this.gameState.camera.size = 500;
    this.gameState.camera.widthHeightRatio = 0;
    this.gameState.player = new Player(this.gameState.ctx);

    this.gameState.planets = [];
    let newPlanet;

    newPlanet = new Planet(this.gameState.ctx);
    newPlanet.pos = new V2(158, 158);
    newPlanet.strength = 200;
    newPlanet.maxStrength = 0.02;
    newPlanet.size = 80;
    newPlanet.auraSize = 3;
    newPlanet.featheringSize = 5;
    newPlanet.color = "#000000";
    newPlanet.auraBeginColor = "#000000ff";
    newPlanet.auraEndColor = "#22222200";
    this.gameState.planets.push(newPlanet);

    newPlanet = new Planet(this.gameState.ctx);
    newPlanet.pos = new V2(350, -220);
    newPlanet.strength = 400;
    newPlanet.maxStrength = 0.05;
    newPlanet.size = 120;
    newPlanet.auraSize = 8;
    newPlanet.featheringSize = 5;
    newPlanet.color = "#cc2233";
    newPlanet.auraBeginColor = "#cc229955";
    newPlanet.auraEndColor = "#cc229900";
    this.gameState.planets.push(newPlanet);

    newPlanet = new Planet(this.gameState.ctx);
    newPlanet.pos = new V2(-180, 50);
    newPlanet.strength = 200;
    newPlanet.maxStrength = 0.02;
    newPlanet.size = 60;
    newPlanet.auraSize = 15;
    newPlanet.featheringSize = 10;
    newPlanet.color = "#2255dd";
    newPlanet.auraBeginColor = "#aaaaff28";
    newPlanet.auraEndColor = "#0000ff00";
    this.gameState.planets.push(newPlanet);

    this.gameState.availableHUD = {
        planetTragectory: true,
        planetGravityInfluence: true,
        targetMarker: true,
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

        this.gameState.input = updateInput(inputConfig);

        updatePlanetGravity(this.gameState);
        updatePlanetCollision(this.gameState)

        for (let i = 0; i < planets.length; ++i) {
            let planet = planets[i];
            planet.update(this.gameState);
        }
        player.update(this.gameState);

        for (let i = 0; i < planets.length; ++i) {
            let planet = planets[i];
            planet.draw(this.gameState);
        }
        player.draw(this.gameState);

        if (camera.pos.x < player.pos.x - 50) {
            camera.pos.x = player.pos.x - 50
        }
        if (camera.pos.x > player.pos.x + 50) {
            camera.pos.x = player.pos.x + 50
        }
        if (camera.pos.y < player.pos.y - 50) {
            camera.pos.y = player.pos.y - 50
        }
        if (camera.pos.y > player.pos.y + 50) {
            camera.pos.y = player.pos.y + 50
        }

        let targetPos = planets[0].pos;
        let targetDir = targetPos.clone().sub(camera.pos);
        let targetDistance = targetDir.length();
        targetDir.normalize();
        let markerPos = targetDir.clone().mult(Math.min(camera.minSize * 0.45, targetDistance)).add(camera.pos);
        markerPos.applyTransform(camera.canvasToPixels());

        cameraController.setCamera(hudCamera);

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
                ctx.fillText(Math.round(targetDistance) + " UA", markerPos.x, markerPos.y - 25);
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
                ctx.fillText(Math.round(targetDistance) + " UA", markerPos.x, markerPos.y - 70);
            }
        }
        ctx.textAlign = "left";

        this.gameState.framerate = this.gameState.framerate * 0.9 + (1 / dT) * 0.1;
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

        this.gameState.lastTime = this.gameState.time;
        window.requestAnimationFrame(this.step);
    }

    window.requestAnimationFrame(this.step);
}

let game = new Game();
