// RequestAnimFrame: a browser API for getting smooth animations.
// Got it from: http://cssdeck.com/labs/ping-pong-game-tutorial-with-html5-canvas-and-sounds
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            return window.setTimeout(callback, setTimeoutDelay);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame||
        window.mozCancelRequestAnimationFrame   ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame    ||
        clearTimeout
})();

// Initializing variables
var
    /**
     * Enables the drawing of all the graphical elements.
     * @type {HTMLElement}
     */
    canvas = document.getElementById("canvas"),
    fps = 30,
    setTimeoutDelay = 1000 / fps,
    /**
     * Used for drawing objects in the canvas.
     * @type {CanvasRenderingContext2D}
     */
    ctx = canvas.getContext("2d"),
    canvasWidth = 300,
    canvasWidthHalf = canvasWidth * 0.5,
    canvasHeight = 400,
    /**
     * The player character.
     */
    bird = {},
    color = "#dedede",
    bgColor = "#242424",
    /**
     * Holds reference to the initialized game loop.
     */
    game,
    /**
     * Array holding the obstacles.
     * @type {Array}
     */
    obstacles = [],
    /**
     * Size of the vertical gap through which the player has to fly.
     * @type {number}
     */
    gapSize = 100,
    /**
     * How fast the obstacles come at you.
     * @type {number}
     */
    scrollSpeed = 1,
    birdImg = new Image(),
    bgImg = new Image(),
    tubeDownImg = new Image(),
    tubeUpImg = new Image(),
    groundImg = new Image(),
    groundPos = 0;

// Expanding upon the bird variable
bird = {
    x: 50,
    y: canvasHeight * 0.5,
    size: 16,
    color: color,
    score: 0,
    /**
     * Used for help with incrementing the score.
     */
    scored: false,
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
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
};

// Adding event listener for the main gameplay
window.addEventListener("keypress", btnPress);

/**
 * Sets up the entire game for a fresh start.
 */
function init() {
    // Set up canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set up image source
    birdImg.src = "assets/img/bird.png";
    bgImg.src = "assets/img/bg.png";
    tubeDownImg.src = "assets/img/tubeDownward.png";
    tubeUpImg.src = "assets/img/tubeUpward.png";
    groundImg.src = "assets/img/ground.png";

    // Set up font properties
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.lineWidth = 5;
    ctx.strokeStyle = bgColor;
    ctx.fillStyle = color;

    // Reset the player character
    bird.x = 50;
    bird.y = canvasHeight * 0.5;
    bird.score = 0;

    // Draw everything once
    draw();

    // Add instructions
    ctx.fillText("Press [space] to begin flapping", canvasWidthHalf, 200);

    window.addEventListener("keypress", startGame);
}

/**
 * Handles the game physics.
 */
function update() {
    bird.addGravity();
    moveObstacles();
    collisionCheck(bird, obstacles[0]);
}

/**
 * Moves the obstacles forward.
 */
function moveObstacles() {
    // Move all obstacles forward
    for (var i = obstacles.length - 1; i >= 0; --i)
        obstacles[i].x -= scrollSpeed;

    // If obstacle goes off-screen, put it in the back of the array and reset its position
    if (obstacles[0].x <= -obstacles[0].width) {
        obstacles.push(obstacles.shift());
        obstacles[obstacles.length - 1].resetPosition(obstacles[0].x);
        // Once the array is correctly sorted, set scored to false again.
        // (If it is set to false too soon, the score will just keep incrementing)
        bird.scored = false;
    }
}

/**
 * Collision check between the bird and the upcoming obstacle only.
 * @param b The bird, player character.
 * @param o The upcoming obstacle.
 */
function collisionCheck(b, o) {
    // If the player goes hits the screen edges, it's game over.
    if (b.y < 0 || b.y + b.size > canvasHeight)
        gameOver();
    // If the player hits an obstacle, it's game over.
    if (b.x + b.size >= o.x && b.x <= o.x + o.width) {
        if (b.y <= o.gapStart || b.y + b.size >= o.gapEnd)
            gameOver();
    }
    // If the player passes an obstacle, player earns a point.
    else if (b.scored == false && b.x > o.x + o.width) {
        b.score++;
        b.scored = true;
    }
}

/**
 * Handles displaying of all the graphics on the canvas.
 */
function draw() {
    drawBg();
    drawObjects();
    drawGround()
    bird.draw();
}

function drawBg() {
    ctx.drawImage(bgImg, 0, 0);
}

function drawGround() {
    // Ground pattern repeats after 24 pixels
    if (--groundPos < -23)
        groundPos = 0;
    ctx.drawImage(groundImg, groundPos, 368);
}

/**
 * Draws everything except for the dark background and the player character.
 */
function drawObjects() {
    // Draw obstacles
    for (var i = obstacles.length - 1; i >= 0; --i) {
        ctx.fillRect(obstacles[i].x, 0, obstacles[i].width, obstacles[i].gapStart);
        ctx.fillRect(obstacles[i].x, obstacles[i].gapEnd, obstacles[i].width, canvasHeight);
    }
    // Draw score
    ctx.strokeText(bird.score.toString(), canvasWidthHalf, 100);
    ctx.fillText(bird.score.toString(), canvasWidthHalf, 100);
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

/**
 * The obstacle object.
 * @param positionInArray X position is based on the position in the array of the current object.
 * @constructor
 */
function Obstacle(positionInArray) {
    this.width = bird.size + bird.size;
    /**
     * The horizontal spacing between the obstacles.
     * @type {number}
     */
    this.spacing = positionInArray * this.width * 5;
    this.x = canvasWidth + this.spacing;
    /**
     * Where the vertical gap between obstacles begins.
     * @type {number}
     */
    // This formula ensures the vertical gap in the obstacle will never touch the screen edge
    this.gapStart =
        Math.round(this.width + Math.random() * (canvasHeight - gapSize - this.width * 2));
    /**
     * Where the vertical gap between obstacles ends.
     * @type {number}
     */
    this.gapEnd = this.gapStart + gapSize;

    /**
     * Called when object goes off-screen. Moves object all the way to the right and resets its gap.
     *
     * Uses less resources than creating and destroying obstacles
     * @param xPosNextObstacle
     */
    this.resetPosition = function (xPosNextObstacle) {
        this.spacing = (obstacles.length - 1) * this.width * 5;
        this.x = xPosNextObstacle + this.spacing;
        this.gapStart =
            Math.round(this.width + Math.random() * (canvasHeight - gapSize - this.width * 2));
        this.gapEnd = this.gapStart + gapSize;
    }
}

/**
 * Creates a set amount of obstacles.
 * @param amount How much obstacles are created.
 */
function createObstacle(amount) {
    for (var i = amount - 1; i >= 0; --i)
        obstacles.push(new Obstacle(obstacles.length));
}

/**
 * While this is running, the game is running.
 */
function gameLoop() {
    game = requestAnimFrame (gameLoop);
    draw();
    update();
}

/**
 * Starts the game loop when space bar is pressed.
 * @param e
 */
function startGame(e) {
    // If space bar is pressed.
    if (e.keyCode == 32) {
        window.removeEventListener("keypress", startGame);
        // Create
        createObstacle(3);
        gameLoop();
    }
}

/**
 * Called when player collides with obstacle. Handles the stopping of the game.
 */
function gameOver(){
    // Draw instructions
    ctx.strokeText("Press [enter] to restart", canvasWidthHalf, 200);
    ctx.fillText("Press [enter] to restart", canvasWidthHalf, 200);
    window.addEventListener("keypress", restart);
    // Stop the game loop.
    cancelRequestAnimFrame(game);
}

/**
 * Clears the obstacle array and calls init() to reset the game.
 * @param e
 */
function restart(e) {
    // If enter/return is pressed.
    if (e.keyCode == 13) {
        window.removeEventListener("keypress", restart);
        // Clear the obstacle array
        obstacles = [];
        init();
    }
}

init();// Initialize everything