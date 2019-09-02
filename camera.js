function CameraController() {
    this.currentCamera = null;

    this.setCamera = function(camera) {
        if (this.currentCamera)
            this.currentCamera.popTransform();

        this.currentCamera = camera;
        this.currentCamera.pushTransform();
    }
}

function Camera(ctx) {
    this.ctx = ctx

    this.isHUD = false;

    this.pos = new V2(0, 0);
    this.size = 400;
    this.widthHeightRatio = 1;

    this.dim = new V2(0, 0);
    this.minSize = 0;
    this.maxSize = 0;
    this.scale = 1;

    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shake = new V2(0, 0);

    this.update = function(dT) {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;

        this.scale = (width * (1 - this.widthHeightRatio) + height * this.widthHeightRatio) / this.size;
        this.dim.x = width / this.scale;
        this.dim.y = height / this.scale;
        this.minSize = Math.min(this.dim.x, this.dim.y);
        this.maxSize = Math.max(this.dim.x, this.dim.y);

        if (this.shakeDuration > 0) {
            this.shakeDuration -= dT;
            this.shake.x = (Math.random() - 0.5) * this.shakeIntensity;
            this.shake.y = (Math.random() - 0.5) * this.shakeIntensity;
        }
        else {
            this.shake.x = 0;
            this.shake.y = 0;
        }
    };

    this.pushTransform = function() {
        let width = this.ctx.canvas.width;
        let height = this.ctx.canvas.height;

        this.ctx.save();
        if (!this.isHUD) {
            this.ctx.translate(width * 0.5, height * 0.5);
            this.ctx.scale(1, -1);
            this.ctx.scale(this.scale, this.scale);
        }
        this.ctx.translate(-this.pos.x + this.shake.x, -this.pos.y + this.shake.y);
    }

    this.popTransform = function() {
        this.ctx.restore();
    }

    this.cameraShake = function(duration, intensity) {
        this.shakeDuration = duration;
        this.shakeIntensity = intensity;
    };

    this.pixelsToCanvas = function() {
        return this.ctx.getTransform().invertSelf();
    }

    this.canvasToPixels = function() {
        return this.ctx.getTransform();
    }

    this.drawAxisDebug = function() {
        this.ctx.fillRect(-0.3, -0.3, 0.6, 0.6);

        this.ctx.fillRect(-100, -1, 200, 2);
        this.ctx.fillRect(-1, -100, 2, 200);

        for (let i = -10; i <= 10; ++i) {
            this.ctx.fillRect(10 * i - 0.5, -5, 1, 10);
        }
        for (let i = -10; i <= 10; ++i) {
            this.ctx.fillRect(-5, 10 * i - 0.5, 10, 1);
        }

        this.ctx.fillRect(10, 10, 10, 10);

        this.ctx.font = "1px sans-serif";
        this.ctx.fillText("Teste", 2, 1);
    }
}
