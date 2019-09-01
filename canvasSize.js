// https://stackoverflow.com/questions/33565332/html5-canvas-height-and-width-100-distorts-the-game-animation
let canvasMinSize = 0;
let canvasMaxSize = 0;
let centerCanvasX = 0;
let centerCanvasY = 0;

let needRedraw = true;
window.addEventListener('resize', askRedraw, false);
window.addEventListener('orientationchange', askRedraw, false);
function askRedraw() {
    needRedraw = true;
}

function redraw() {
    if (needRedraw) {
        needRedraw = false;

        let canvas = document.getElementById('canvas');
        canvas.style.margin = '5px';
        canvas.width = window.innerWidth - 10;
        canvas.height = window.innerHeight - 10;

        minCanvasSize = Math.min(canvas.width, canvas.height);
        maxCanvasSize = Math.max(canvas.width, canvas.height);

        centerCanvasX = canvas.width * 0.5
        centerCanvasY = canvas.height * 0.5
    }
}
redraw();
