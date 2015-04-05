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
    darkColor = "#242424";

window.addEventListener("keypress", btnPress);

// Set up canvas size
canvas.width = canvasWidth;
canvas.height = canvasHeight;

bird = {
    x: 50,
    y: canvasHeight * 0.5,
    size: 16,
    color: lightColor,
    gravity: 5,
    vertSpeed: 0,
    jumpSpeed: 5,

    jump:function () {
        vertSpeed = jumpSpeed;
    },

    draw: function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
};

function update() {
    //add gravity to player

    
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

draw();//temp. put this in update loop later