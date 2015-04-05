// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            return window.setTimeout(callback, 1000 / fps);
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
    fps = 30;
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
    color = "#dedede",
    bgColor = "#242424",
    /**
     * Holds reference to the initialized game loop.
     */
    init = {},
    obstacles = [],
    gapSize = 100,
    scrollSpeed = 1;

window.addEventListener("keypress", btnPress);
window.addEventListener("keypress", startGame);

// Set up canvas size
canvas.width = canvasWidth;
canvas.height = canvasHeight;

bird = {
    x: 50,
    y: canvasHeight * 0.5,
    size: 16,
    color: color,
    gravity: 0.5,
    vertSpeed: 0,
    jumpSpeed: 7,

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
    moveObstacles();
    draw();
}

function moveObstacles() {
    for (var i = obstacles.length - 1; i >= 0; --i)
        obstacles[i].x -= scrollSpeed;
    if (obstacles[0].x <= -obstacles[0].width) {
        // Move first object to the end of the array
        obstacles.push(obstacles.shift());
        obstacles[obstacles.length - 1].resetPosition(obstacles[0].x);
    }
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
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawObjects() {
    for (var i = obstacles.length - 1; i >= 0; --i) {
        ctx.fillStyle = color;
        ctx.fillRect(obstacles[i].x, 0, obstacles[i].width, obstacles[i].gapStart);
        ctx.fillRect(obstacles[i].x, obstacles[i].gapEnd, obstacles[i].width, canvasHeight);
    }
}

/**
 * Handles button presses. Only space bar is used for now.
 * @param e
 */
function btnPress(e) {
    // If space bar is pressed.
    if (e.keyCode == 32)
        bird.jump();
}

function ObstaclePair(positionInArray) {
    this.width = bird.size + bird.size;
    this.spacing = positionInArray * this.width * 5;
    this.x = canvasWidth + this.spacing;
    // This formula ensures the gap in between the obstacle pair will never touch the screen edge
    this.gapStart =
        Math.round(this.width + Math.random() * (canvasHeight - gapSize - this.width * 2));
    this.gapEnd = this.gapStart + gapSize;

    this.resetPosition = function (xPosOfNextObstaclePair) {
        this.spacing = (obstacles.length - 1) * this.width * 5;
        this.x = xPosOfNextObstaclePair + this.spacing;
    }
}

function createObstaclePair(amount) {
    for (var i = amount - 1; i >= 0; --i)
        obstacles.push(new ObstaclePair(obstacles.length));
}

function gameLoop() {
    init = requestAnimFrame (gameLoop);
    update();
    draw();
}

/**
 * Starts the game loop.
 * @param e
 */
function startGame(e) {
    window.removeEventListener("keypress", startGame);
    createObstaclePair(3);//temp. testing out how obstacle pairs are made
    gameLoop();
}

function instructions() {
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Press [space] to begin", canvasWidth * 0.5, 200);
}

draw();// Draw everything once
instructions();// And then draw the instructions over it