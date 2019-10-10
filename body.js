function Body() {
    this.pos = new V2(0, 0);
    this.vel = new V2(0, 0);
    this.size = 1;

    this.impulse = 6;
    this.impulseDecay = 0.95;

    this.updateBehaviors = [];
    this.drawBehaviors = [];

    this.update = (gameState) => {
        if (this.impulse > 0) {
            this.impulse *= 0.95;
        }
        this.impulse = Math.max(0, this.impulse);

        this.pos.add(this.vel.clone().mult(1 + this.impulse));

        for (let i = 0; i < this.updateBehaviors.length; ++i) {
            this.updateBehaviors[i].bind(this)(gameState);
        }
    }

    this.draw = (gameState) => {
        for (let i = 0; i < this.drawBehaviors.length; ++i) {
            this.drawBehaviors[i].bind(this)(gameState);
        }
    }
}
