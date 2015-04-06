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
    canvasHeightHalf = canvasHeight * 0.5,
    /**
     * The player character.
     */
    bird = {},
    color = "#efefef",
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
    scrollSpeed = 2,
    // Images
    birdImg = new Image(),
    birdAnimImg = new Image(),
    bgImg = new Image(),
    groundImg = new Image(),
    tubeDownImg = new Image(),
    tubeUpImg = new Image(),

    groundPos = 0,
    groundHeight = canvasHeight - 32,
    minTubeVisible = 32,
    halfPi = Math.PI * 0.5;

// Expanding upon the bird variable
bird = {
    x: 50,
    y: canvasHeight * 0.5,
    width: 24,
    height: 24,
    color: color,
    score: 0,
    /**
     * Used for help with incrementing the score.
     */
    scored: false,
    gravity: 0.4,
    vertSpeed: 0,
    jumpSpeed: 6,
    imgWidthHalf: 17,
    imgHeightHalf: 12,

    jump:function() {
        this.vertSpeed = -this.jumpSpeed;
    },

    addGravity:function() {
        this.vertSpeed += this.gravity;
        this.y += this.vertSpeed;
    },

    draw: function() {
        // Save current canvas context
        ctx.save();
        // Move the canvas for rotation
        ctx.translate(this.x + this.imgWidthHalf - 5, this.y + this.imgHeightHalf);
        // Rotate accordingly
        if (this.vertSpeed < 3)
            ctx.rotate(-0.5);
        else if (this.vertSpeed > Math.PI + 4)
            ctx.rotate(halfPi);
        else
            ctx.rotate((this.vertSpeed - 4) * 0.5);
        // Draw the rotated image
        ctx.drawImage(birdImg, -this.imgWidthHalf, -this.imgHeightHalf);
        // Restore canvas to original state for further drawing
        ctx.restore();
    }
};

function preload() {
    // Set up canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set up font properties
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.lineWidth = 5;
    ctx.strokeStyle = bgColor;
    ctx.fillStyle = color;

    loadImages();
}

/**
 * Loads all images. When done, init() is called.
 */
function loadImages() {
    var imagesLoaded = 0;

    birdImg.onload = function () {
        imagesLoaded++;
        if (imagesLoaded == 6)
            init();
    };
    birdAnimImg.onload = function () {
        imagesLoaded++;
        if (imagesLoaded == 6)
            init();
    };
    groundImg.onload = function () {
        imagesLoaded++;
        if (imagesLoaded == 6)
            init();
    };
    bgImg.onload = function () {
        imagesLoaded++;
        if (imagesLoaded == 6)
            init();
    };
    tubeDownImg.onload = function () {
        imagesLoaded++;
        if (imagesLoaded == 6)
            init();
    };
    tubeUpImg.onload = function () {
        imagesLoaded++;
        if (imagesLoaded == 6)
            init();
    };

    birdImg.src = "assets/img/bird.png";
    birdAnimImg.src = "assets/img/bird.png";
    groundImg.src = "assets/img/ground.png";
    bgImg.src = "assets/img/bg.png";
    tubeDownImg.src = "assets/img/tubeDownward.png";
    tubeUpImg.src = "assets/img/tubeUpward.png";
}

/**
 * Sets up the game for a fresh start.
 */
function init() {
    // Reset the player character
    bird.x = 50;
    bird.y = canvasHeight * 0.5;
    bird.vertSpeed = 0;
    bird.score = 0;
    bird.width = bird.height = birdImg.height;
    bird.imgHeightHalf = birdImg.height * 0.5;
    bird.imgWidthHalf = birdImg.width * 0.5;

    // Draw everything once
    draw();

    // Add instructions
    ctx.strokeText("[space] to begin flapping", canvasWidthHalf, 200);
    ctx.fillText("[space] to begin flapping", canvasWidthHalf, 200);

    // Add event listener for starting the game
    window.addEventListener("keypress", startGame);

    // Adding event listener for the main gameplay
    window.addEventListener("keypress", btnPress);
}

/**
 * Handles the game physics.
 */
function update() {
    bird.addGravity();
    moveObjects();
    collisionCheck(bird, obstacles[0]);
}

/**
 * Moves the obstacles and ground forward.
 */
function moveObjects() {
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

    groundPos -= scrollSpeed;
    // Ground pattern repeats after 24 pixels
    if (groundPos < -23)
        groundPos = 0;
}

/**
 * Collision check between the bird and the upcoming obstacle only.
 * @param b The bird, player character.
 * @param o The upcoming obstacle.
 */
function collisionCheck(b, o) {
    // If the player hits the ground, it's game over.
    if (b.y + b.height > groundHeight)
        gameOver();
    // If the player hits an obstacle, it's game over.
    if (b.x + b.width >= o.x && b.x <= o.x + o.width) {
        if (b.y <= o.gapStart || b.y + b.height >= o.gapEnd)
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
    drawGround();
    bird.draw();
}

function drawBg() {
    ctx.drawImage(bgImg, 0, 0);
}

/**
 * Moves the ground towards the player and draws it.
 */
function drawGround() {
    ctx.drawImage(groundImg, groundPos, groundHeight);
}

/**
 * Draws everything except for the background and the player character.
 */
function drawObjects() {
    // Draw obstacles
    for (var i = obstacles.length - 1; i >= 0; --i) {
        ctx.drawImage(tubeDownImg, obstacles[i].x, obstacles[i].gapStart - tubeDownImg.height);
        ctx.drawImage(tubeUpImg, obstacles[i].x, obstacles[i].gapEnd);
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
    this.width = tubeDownImg.width;
    /**
     * The horizontal spacing between the obstacles.
     * @type {number}
     */
    this.spacing = positionInArray * this.width * 4;
    this.x = canvasWidth + this.spacing;
    /**
     * Where the vertical gap between obstacles begins.
     * @type {number}
     */
    // This formula ensures the vertical gap in the obstacle will never touch the screen edge
    this.gapStart =
        Math.round(minTubeVisible + Math.random() * (groundHeight - gapSize - minTubeVisible * 2));
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
        this.spacing = (obstacles.length - 1) * this.width * 4;
        this.x = xPosNextObstacle + this.spacing;
        this.gapStart =
            Math.round(minTubeVisible + Math.random() * (groundHeight - gapSize - minTubeVisible * 2));
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

function deathAnim() {
    game = requestAnimFrame(deathAnim);
    bird.addGravity();
    draw();
    if (bird.y - bird.vertSpeed > canvasHeight) {
        cancelRequestAnimFrame(game);
        // Draw instructions
        ctx.strokeText("[enter] to restart", canvasWidthHalf, 200);
        ctx.fillText("[enter] to restart", canvasWidthHalf, 200);
        window.addEventListener("keypress", restart);
    }
}

/**
 * Starts the game loop when space bar is pressed.
 * @param e
 */
function startGame(e) {
    // If space bar is pressed.
    if (e.keyCode == 32) {
        window.removeEventListener("keypress", startGame);
        createObstacle(2);
        gameLoop();
    }
}

/**
 * Called when player collides with obstacle. Handles the stopping of the game.
 */
function gameOver(){
    // Remove the abilty to jump
    window.removeEventListener("keypress", btnPress);
    // Stop the game loop.
    cancelRequestAnimFrame(game);
    // Start the death animation
    bird.jump();
    deathAnim();
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

preload();// Preload assets