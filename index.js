var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

const GAME_WIDTH = 300;
const GAME_HEIGHT = 600;

var paused = false;
var menu = true;

var circarc = [];

//Used to push the objects into circarc which is then draw in the game loop
function onecirc(x, y) {
  if (typeof(x) === 'undefined') x = GAME_WIDTH / 2;
  if (typeof(y) === 'undefined') y = GAME_HEIGHT / 4;
  let index = Math.floor(Math.random() * 4);
  let colors = ["#ff0080", "#ffe80f", "#32e2f1", "#8c12fb"];

  shuffleArray(colors);

  let radius = Math.floor(Math.random() * 11) + 60;

  let randint = Math.floor(Math.random() * 3) + 2; // Gives a random integer between 2 and 4

  let start = 0;
  let end = (2 * Math.PI) / randint;
  let onearc = [];

  for (let i = 0; i < randint; i++) {
    onearc.push(new Circobs(x, y, start, end, colors[i], radius));
    start += ((2 * Math.PI) / randint);
    end += ((2 * Math.PI) / randint);
  }
  circarc.push(onearc);
}

//Used to shuffle the colors array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var col = "";
var collision = false;

function detectCollision() {
  let collisionPossibleBottom = true;
  let collisioinPossibleTop = false;
  circarc.forEach(arc => {
    let length = arc.length;

    //Checks if ball can enter the arc or not
    if ((arc[0].angle >= Math.PI / 2) && (arc[0].angle <= (Math.PI / 2 + 2 * Math.PI / length))) {
      collisionPossibleBottom = false;
    } else {
      collisionPossibleBottom = true;
    }

    //Checks if ball can exit the arc or not
    if (length == 2) {
      if ((arc[0].angle >= Math.PI / 2) && (arc[0].angle <= 3 * (Math.PI / 2))) {
        collisionPossibleTop = true;
      } else {
        collisionPossibleTop = false;
      }
    } else if (length == 3) {
      if ((arc[0].angle >= Math.PI / 6) && (arc[0].angle <= 4 * Math.PI / 3)) {
        collisionPossibleTop = true;
      } else {
        collisionPossibleTop = false;
      }
    } else if (length == 4) {
      if ((arc[0].angle >= 0) && (arc[0].angle <= 3 * Math.PI / 2)) {
        collisionPossibleTop = true;
      } else {
        collisionPossibleTop = false;
      }
    }

    let bottomOfArcY = arc[0].position.y + arc[0].radius;
    let topOfArcY = arc[0].position.y - arc[0].radius;

    // To check collision between the top of the ball and the bottom of the arc
    if (((ball.position.y - 10) <= (bottomOfArcY + 5)) && ((ball.position.y - 10) >= (bottomOfArcY - 5))) {
      if (collisionPossibleBottom) {
        collision = true;
      }
    }

    //To check the collision between the bottom of the ball and the bottom of the arc
    if (((ball.position.y + 10) <= (bottomOfArcY + 5)) && ((ball.position.y + 10) >= (bottomOfArcY - 5))) {
      if (collisionPossibleBottom) {
        collision = true;
      }
    }

    //To check the collision between the top of the arc and the bottom of the ball
    if (((ball.position.y + 10) <= (topOfArcY + 5)) && ((ball.position.y + 10) >= (topOfArcY - 5))) {
      if (collisionPossibleTop) {
        collision = true;
      }
    }

    //To check the collision between the top of the arc and the top of the ball
    if (((ball.position.y - 10) <= (topOfArcY + 5)) && ((ball.position.y - 10) >= (topOfArcY - 5))) {
      if (collisionPossibleTop) {
        collision = true;
      }
    }

  });
}

//Used to move the objects in the canvas
let executeOnce = true;
let tempscore = 0;
let factor = 2.5;
let factorAngle = 1;

function movement() {
  //Moves the arcs
  if (ball.position.y < 320) {
    circarc.forEach(arcarray => {
      arcarray.forEach(arc => {
        arc.position.y += factor;
      });
    });

    //Moves the changecolor object
    if (changecolor.length !== 0) {
      changecolor.forEach(color => {
        color.position.y += factor;
      });
    }

    //Increases the speed of movement every time the score increases by 500
    if (tempscore > 500) {
      tempscore = 0;
      factor += 0.2;
      factorAngle += 0.2;
    }
    tempscore++;
    score++;
  }

  //Pushes a new object when the one on the screen reaches half of the canvas height
  if (circarc[0][0].position.y >= GAME_HEIGHT / 2) {
    if (executeOnce) {
      executeOnce = false;
      onecirc(150, -15);
      changecolor.push(new ColorChange());
    }
  }

  //Removes the object once it reaches the bottom of the canvas
  if (circarc[0][0].position.y >= GAME_HEIGHT) {
    executeOnce = true;
    changecolor.shift();
    circarc.shift();
  }
}

//Draws the scores on the canvas
let score = 0;

function scoredraw() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Score: " + score, 8, 20);
  ctx.fillText("HighScore:" + Math.max(score, highScore), 170, 20);
}

//Updates the High Scores in real time
let highScore = localStorage.getItem("hs") || 0;

function updateScores(score) {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("hs", highScore);
  }
}

//This class is used to draw a single arc
class Circobs {
  constructor(positionX, positionY, start, end, color, radius) {
    this.color = color;
    this.position = {
      x: positionX,
      y: positionY
    };
    this.start = start;
    this.end = end;
    this.angle = 0;
    this.radius = radius;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);
    ctx.lineWidth = 10;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, this.start, this.end);
    ctx.stroke();
    ctx.restore();
  }
}

//This class contains the ball object
var initial = true;
class Ball {
  constructor(gameWidth, gameHeight, color) {
    this.gameWidth = gameWidth;
    this.color = color;
    this.speed = 0;
    this.gravity = 10;
    this.position = {
      x: gameWidth / 2,
      y: gameHeight - 90,
      initY: gameHeight - 90,
      maxY: gameHeight / 2
    };
  }

  draw(ctx) {
    ctx.fillStyle = ball.color;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.lineWidth = 0.1;
    ctx.stroke();
    ctx.closePath();
  }

  moveUp() {
    this.speed = 4;
  }

  stop() {
    this.speed = 0;
  }

  update() {
    // Doesnt let the ball go above half the height of the canvas
    if (ball.position.y < ball.position.maxY) {
      ball.position.y = ball.position.maxY;
    }

    if (score !== 0) {
      initial = false;
    }

    if ((ball.position.y > ball.position.initY)) {
      if (initial) { // Doesnt let the ball fall down as long as the score is 0
        ball.position.y = ball.position.initY;
        ball.speed = ball.gravity * (1 / 60);
      }
    }

    //If the score is not zero and the ball touches the bottom of the canvas the game is over
    if (ball.position.y >= GAME_HEIGHT) {
      collision = true;
    }

    //Gravity being applied on the ball
    this.speed -= this.gravity * (1 / 60);
    this.position.y -= this.speed;
  }

}

//This class contains the object that is used to change the color of the ball
class ColorChange {
  constructor() {
    this.position = {
      x: GAME_WIDTH / 2,
      y: 140
    };
  }

  draw(ctx) {
    let colors = ["#ff0080", "#ffe80f", "#32e2f1", "#8c12fb"];
    let start = 0;
    for (let i = 0; i < colors.length; i++) {
      var startAngle = i * Math.PI / 2;
      var endAngle = startAngle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.arc(this.position.x, this.position.y, 10, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.strokeStyle = colors[i];
      ctx.fill();
      ctx.stroke();
    }
  }

  colorchange() {
    //If the ball is above the object sets the color to the one which allows entry into the next arc else sets it back to the previous color
    if (ball.position.y > this.position.y) {
      ball.color = (circarc[0][circarc[0].length - 1]).color;
    } else if (ball.position.y < this.position.y) {
      ball.color = (circarc[1][circarc[1].length - 1]).color;
    }
  }
}

//This is class used to handle inputs
var intv = 0;
var firstTime = true;
var myAudio = new Audio('sounds/soundtrack.mp3'); //Credits https://www.fesliyanstudios.com/royalty-free-music/downloads-c/8-bit-music/6
class InputHandler {
  constructor(ball) {
    document.addEventListener('keydown', (event) => {
      switch (event.keyCode) {
        case 38: // Up arrow key

          //Doesnt perform an action when paused is triggered
          if (paused) {
            return;
          }
          if (event.repeat) { //Doesnt let the user hold the key
            return;
          }

          //Sets the start menu to false and plays the background audio
          if (firstTime) {
            menu = false;
            ctx.textAlign = "start";
            requestAnimationFrame(render);
            firstTime = false;
            myAudio.addEventListener('ended', function() {
              this.currentTime = 0;
              this.play();
            }, false);
            myAudio.play();
          }

          //Gives speed to the ball
          ball.moveUp();

          //Allows movement
          intv = setInterval(movement, 10);

          //Clears the movement interval
          setTimeout(function() {
            clearInterval(intv);
          }, 150);

          break;

        case 27: //Escape Key
          //Toggles pause menu
          paused = !paused;
          if (!paused) {
            ctx.textAlign = "start";
          }
          requestAnimationFrame(render);

      }
    })

    document.addEventListener('keyup', (event) => {
      switch (event.keyCode) {
        case 38:
          if (paused) {
            return;
          }
          //Plays the jump sound on keyup
          var jump = new Audio("sounds/jump.wav"); //https://www.sounds-resource.com/mobile/colorswitch/sound/7826/
          jump.play();
          break;

      }
    })

  }
}

onecirc(); //Inititalizes the initial object
let ball = new Ball(GAME_WIDTH, GAME_HEIGHT, (circarc[0][circarc[0].length - 1]).color);
new InputHandler(ball);
let changecolor = [];

function render() { //Draws all the objects on the screen
  if (menu) { //Draws the start menu
    ctx.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fill();

    ctx.font = "15px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Press Up to move and esc to pause", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    return;
  }

  if (paused) { //Draws the pause menu
    ctx.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fill();

    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Paused", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    return;
  }



  ball.draw(ctx);

  circarc.forEach(arcarray => {
    arcarray.forEach(arcs => {
      arcs.draw(ctx);
      if (arcs.angle >= 2 * Math.PI) {
        arcs.angle = 0;
      }

      if (factorAngle > 3) {
        factorAngle = 3;
      }
      arcs.angle += factorAngle * Math.PI / 180;
    })
  });

  if (changecolor.length !== 0) {
    changecolor[0].draw(ctx);
    if (circarc.length > 1) {
      changecolor[0].colorchange();
    }
  }

  detectCollision();
  scoredraw();

  if (collision) {
    myAudio.pause();

    setTimeout(function() {
      updateScores(score);
      alert("You score: " + score);
      location.reload();
    }, 10);

  } else {
    requestAnimationFrame(render);
  }
}

function updateFrame() {
  if (paused || menu) {
    return;
  }
  ball.update();
}

function start() {
  render();
  setInterval(updateFrame, 10);
}

start();
