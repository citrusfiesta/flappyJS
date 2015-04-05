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
    color = "#dedede",
    bgColor = "#242424",
    /**
     * Holds reference to the initialized game loop.
     */
    init = {},
    obstacles = [],
    gapSize = 100;

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


    //move objects


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
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawObjects() {
    ctx.fillStyle = color;
    for (var obPair in obstacles) {
        console.debug("nr of objects in obstacles is", obstacles.length);
        //ctx.fillRect(obPair.x)
    }
}

/**
 * Handles button presses. Only space bar is used for now
 * @param e
 */
function btnPress(e) {
    // If space bar is pressed.
    if (e.keyCode == 32)
        bird.jump();
}

function ObstaclePair() {
    this.x = canvasWidth-100;
    this.width = bird.size + bird.size;
    // This formula ensures the gap in between the obstacle pair will never touch the screen edge
    this.gapStart = Math.round(this.width + Math.random() * (canvasHeight - this.width));

    ctx.fillStyle = color;
    ctx.fillRect(this.x, 0, this.width, this.gapStart);

    ctx.fillRect(this.x, this.gapStart + gapSize, this.width, canvasHeight);
}

function createObstaclePair() {
    obstacles.push(new ObstaclePair());
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
    gameLoop();
    createObstaclePair();//temp. testing out how obstacle pairs are made
}

function instructions() {
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Press [space] to begin", canvasWidth * 0.5, 200);
}

draw();// Draw everything once
instructions();// And then draw the instructions over it