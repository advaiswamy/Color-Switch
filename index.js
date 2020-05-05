var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

const GAME_WIDTH = 300;
const GAME_HEIGHT = 600;

var circarc = [];

function onecirc(x,y) {
  if (typeof(x)==='undefined') x = 150;
  if (typeof(y)==='undefined') y = 150;
  let index = Math.floor(Math.random() * 4);
  let colors = ["red", "yellow", "cyan", "purple"];
  let radius = Math.floor(Math.random() * 21) + 30;
  circarc.push(new Circobs(x, y, 0, colors[index], radius));
  circarc.push(new Circobs(x, y, Math.PI, "blue", radius));
}

var col = "";
var collision = false;
// var collisionPossible = true;

function detectCollision() {

for(let index = 1; index < circarc.length; index+=2)
{
  let y = circarc[index].position.y;
  let x = circarc[index].position.x;

  let currPosYRight = y + (circarc[index].radius * Math.sin(circarc[index].angle));
  let currPosYLeft = y + (circarc[index].radius * Math.sin(circarc[index].angle + Math.PI));
  let currPosXRight = x + (circarc[index].radius * Math.cos(circarc[index].angle));
  let currPosXLeft = x + (circarc[index].radius * Math.cos(circarc[index].angle + Math.PI));

  // if ((circarc[0].angle / (Math.PI / 2)) % 2 == 1) {
  //   if (collisionPossible) {
  //     collisionPossible = false;
  //   } else if (!collisionPossible) {
  //     collisionPossible = true;
  //   }
  // }

  let bottomOfArcY = circarc[index].position.y + circarc[index].radius;
  let topOfArcY = circarc[index].position.y - circarc[index].radius;

  //To check collision between the top of the ball and the bottom of the arc
  if (((ball.position.y - 10) <= (bottomOfArcY + 5)) && ((ball.position.y - 10) >= (bottomOfArcY - 5))) {
    if ((x > currPosXLeft) && (x < currPosXRight)) {
      collision = true;
    }
  }

  //To check the collision between the bottom of the ball and the top of the arc
  if (((ball.position.y + 10) <= (bottomOfArcY + 5)) && ((ball.position.y + 10) >= (bottomOfArcY - 5))) {
    if ((x > currPosXLeft) && (x < currPosXRight)) {
      collision = true;
    }
  }

  //To check the collision between the top of the arc and the bottom of the ball
  if (((ball.position.y + 10) <= (topOfArcY + 5)) && ((ball.position.y + 10) >= (topOfArcY - 5))) {
    if ((x < currPosXLeft) && (x > currPosXRight)) {
      collision = true;
    }
  }

  //To check the collision between the top of the arc and the top of the ball
  if (((ball.position.y - 10) <= (topOfArcY + 5)) && ((ball.position.y - 10) >= (topOfArcY - 5))) {
    if ((x < currPosXLeft) && (x > currPosXRight)) {
      collision = true;
    }
  }
}
}

//   if (((ball.position.y - 10) <= (bottomOfArcY + 5)) && ((ball.position.y - 10) >= (bottomOfArcY - 5)) && (collisionPossible)) {
//     collision = true;
//   }
// }

function movement() {
  if (ball.position.y < 320) {
    circarc.forEach(arc => {
      arc.position.y += 1;
    });
  }

  if(circarc[0].position.y === 300){
    onecirc(150,-10);
  }
  if (circarc[0].position.y === 600) {
    circarc.shift();
    circarc.shift();
  }
}

let score = 0;

function scoredraw() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

class Circobs {
  constructor(positionX, positionY, start, color, radius) {
    this.color = color;
    this.position = {
      x: positionX,
      y: positionY
    };
    this.start = start;
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
    ctx.arc(0, 0, this.radius, this.start, this.start + Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}

class Ball {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.color = "blue";
    this.speed = 0;
    this.maxSpeed = 5;
    this.gravity = 0.5;
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
    this.speed = 6;
  }

  stop() {
    this.speed = 0;
  }

  update() {
    
    if (ball.position.y < ball.position.maxY) {
      ball.gravity = 4;
    } else {
      ball.gravity = 0.5;
    }

    if (ball.position.y > ball.position.initY) {
      ball.position.y = ball.position.initY;
    }
    this.position.y -= (this.speed - this.gravity);
  }

}

var intv = 0;
class InputHandler {
  constructor(ball) {
    document.addEventListener('keydown', (event) => {
      switch (event.keyCode) {
        case 38:
          if (event.repeat) return;
          ball.moveUp();
          setTimeout(function() {
            ball.speed = 0;
          }, 80);
          intv = setInterval(movement, 10);
          setTimeout(function() {
            clearInterval(intv);
          }, 150);
          // movement();
          score++;
          break;

      }
    })

    document.addEventListener('keyup', (event) => {
      switch (event.keyCode) {
        case 38:
          ball.stop();
          break;

      }
    })

  }
}

onecirc();
let ball = new Ball(GAME_WIDTH, GAME_HEIGHT);
new InputHandler(ball);

function render() {
  ball.draw(ctx);
  circarc.forEach(arcs => {
    arcs.draw(ctx);
    arcs.angle += 1 * Math.PI / 180;
  });

  detectCollision();
  scoredraw();

  if (collision) {
    alert("You lost");
    location.reload();
  } else {
    requestAnimationFrame(render);
  }
}

function updateFrame() {
  ball.update();
}

function start() {
  render();
  setInterval(updateFrame, 10);
}

start();
