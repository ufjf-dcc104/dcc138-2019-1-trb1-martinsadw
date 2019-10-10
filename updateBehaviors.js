function orbitBehavior(center, radius, duration, phase) {
    return function (gameState) {
        if (!this.orbit) {
            this.orbit = {
                center: center,
                radius: radius,
                duration: duration,
                phase: phase,
                disable: false,
            }
        }

        if (this.orbit.disable) return;

        let {time} = gameState;

        this.pos.x = Math.cos(time * 2 * Math.PI / this.orbit.duration + this.orbit.phase) * this.orbit.radius + this.orbit.center.x;
        this.pos.y = Math.sin(time * 2 * Math.PI / this.orbit.duration + this.orbit.phase) * this.orbit.radius + this.orbit.center.y;
    }
}

function attractBehavior(speed) {
    return function (gameState) {
        if (!this.attract) {
            this.attract = {
                speed: speed,
                attracting: false,
                disable: false,
            }
        }

        if (this.attract.disable) return;

        let {player} = gameState;

        if (!this.attract.attracting) {
            let fragmentDistance = this.pos.clone().sub(player.pos).length();

            if (fragmentDistance < player.size * 0.8 + 70 && !this.invulnerable) {
                this.attract.attracting = true;
            }
        }
        else {
            speed += 0.05;

            if (this.orbit) {
                this.orbit.disable = true;
            }

            this.vel = player.pos.clone().sub(this.pos).normalize().mult(speed);
        }
    }
}

function invulnerableBehavior(duration) {
    return function (gameState) {
        if (!this.invulnerable) {
            this.invulnerable = {
                duration: duration,
                disable: false,
            }
        }

        if (this.invulnerable.disable) return;

        if (this.invulnerable.duration > 0) {
            this.invulnerable.disable = false;
            this.invulnerable.duration -= dT;
        }
        else {
            this.invulnerable.disable = true;
        }
    }
}
