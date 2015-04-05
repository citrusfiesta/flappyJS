// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            return window.setTimeout(callback, 1000 / 30);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();

// Initializing variables
var
    /**
     * Enables the drawing of all the graphical elements.
     * @type {HTMLElement}
     */
    canvas = document.getElementById("canvas"),
    /**
     * Used for drawing objects in the canvas.
     * @type {CanvasRenderingContext2D}
     */
    ctx = canvas.getContext("2d");
    canvasWidth = 300,
    canvasHeight = 534,
    /**
     * The player character.
     */
    bird = {},
    lightColor = "#dedede",
    darkColor = "#242424",
    init = {};// variable to initialize animation

window.addEventListener("keypress", btnPress);
window.addEventListener("keypress", startGame);

// Set up canvas size
canvas.width = canvasWidth;
canvas.height = canvasHeight;

bird = {
    x: 50,
    y: canvasHeight * 0.5,
    size: 16,
    color: lightColor,
    gravity: 0.5,
    vertSpeed: 0,
    jumpSpeed: 8,

    jump:function() {
        this.vertSpeed = -this.jumpSpeed;
    },

    addGravity:function() {
        this.vertSpeed += this.gravity;
        this.y += this.vertSpeed;
    },

    draw: function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
};

function update() {
    bird.addGravity();
    draw();
}

/**
 * Handles displaying all the graphics on the canvas.
 */
function draw() {
    drawBg();
    drawObjects();
    bird.draw();
}

function drawBg() {
    ctx.fillStyle = darkColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawObjects() {

}

function btnPress(e) {
    // If space bar is pressed.
    if (e.keyCode == 32)
        bird.jump();
}

function gameLoop() {
    init = requestAnimFrame (gameLoop);
    update();
    draw();
}

/**
 * Starts the game loop.
 * @param e Event instance that was used to call this function.
 */
function startGame(e) {
    window.removeEventListener("keypress", startGame);
    gameLoop();
}

function instructions() {
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Press [space] to begin", canvasWidth * 0.5, 200);
}

draw();
instructions();