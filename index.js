window.onload = function() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext('2d');
  const GAME_WIDTH = 300;
  const GAME_HEIGHT = 600;

  var paused = false;
  var menu = true;

  var gameObstacle = [];

  //Used to push the objects into gameObstacle which is then draw in the game loop
  function obj(x, y) {
    if (typeof(x) === 'undefined') x = GAME_WIDTH / 2;
    if (typeof(y) === 'undefined') y = GAME_HEIGHT / 4;

    let obsChoice = Math.floor(Math.random() * 5);
    let currentObs = [];
    if (obsChoice <= 1) { //Makes a triangle
      currentObs.push(new Triangleobs(x, y));
    } else { // Makes a circle
      makecirc(currentObs, x, y);
    }
    gameObstacle.push(currentObs);
  }

  //Makes a circle
  function makecirc(currentObs, x, y) {
    let colors = ["#ff0080", "#ffe80f", "#32e2f1", "#8c12fb"];
    shuffleArray(colors);
    let radius = Math.floor(Math.random() * 11) + 60;
    let randint = Math.floor(Math.random() * 3) + 2; // Gives a random integer between 2 and 4
    let start = 0;
    let end = (2 * Math.PI) / randint;
    for (let i = 0; i < randint; i++) {
      currentObs.push(new Circobs(x, y, start, end, colors[i], radius));
      start += ((2 * Math.PI) / randint);
      end += ((2 * Math.PI) / randint);
    }
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
    let colors = ["rgba(255,232,15,255)", "rgba(140,18,251,255)", "rgba(255,0,128,255)", "rgba(50,226,241,255)"];
    let ballColor = ctx.getImageData(ball.position.x, ball.position.y, 1, 1).data;
    let aboveBall = ball.position.y - ball.radius - 1;
    let aboveBallColor = ctx.getImageData(ball.position.x, aboveBall, 1, 1).data;
    let belowBall = ball.position.y + ball.radius + 1;
    let belowBallColor = ctx.getImageData(ball.position.x, belowBall, 1, 1).data;
    let rightBall = ball.position.x + ball.radius + 1;
    let rightBallColor = ctx.getImageData(rightBall, ball.position.y, 1, 1).data;
    let leftBall = ball.position.x - ball.radius - 1;
    let leftBallColor = ctx.getImageData(leftBall, ball.position.y, 1, 1).data;

    let ballColorrgba = `rgba(${ballColor[0]},${ballColor[1]},${ballColor[2]},${ballColor[3]})`;
    let aboveBallColorrgba = `rgba(${aboveBallColor[0]},${aboveBallColor[1]},${aboveBallColor[2]},${aboveBallColor[3]})`;
    let belowBallColorrgba = `rgba(${belowBallColor[0]},${belowBallColor[1]},${belowBallColor[2]},${belowBallColor[3]})`;
    let rightBallColorrgba = `rgba(${rightBallColor[0]},${rightBallColor[1]},${rightBallColor[2]},${rightBallColor[3]})`;
    let leftBallColorrgba = `rgba(${leftBallColor[0]},${leftBallColor[1]},${leftBallColor[2]},${leftBallColor[3]})`;

    if ((aboveBallColorrgba == colors[0]) ||
      (aboveBallColorrgba == colors[1]) ||
      (aboveBallColorrgba == colors[2]) ||
      (aboveBallColorrgba == colors[3])) {

      //Adds a tolerance value to the color check since image data sometimes doesnt give accurate values

      let check = aboveBallColor.map(function(item, index) {
        return item - ballColor[index];
      });
      if (!(check.every(item => ((item <= 10) && (item >= -10))))) {
        collision = true;
      }
    }

    if ((belowBallColorrgba == colors[0]) ||
      (belowBallColorrgba == colors[1]) ||
      (belowBallColorrgba == colors[2]) ||
      (belowBallColorrgba == colors[3])) {
      let check = belowBallColor.map(function(item, index) {
        return item - ballColor[index];
      });
      if (!(check.every(item => ((item <= 10) && (item >= -10))))) {
        collision = true;
      }
    }

    if ((rightBallColorrgba == colors[0]) ||
      (rightBallColorrgba == colors[1]) ||
      (rightBallColorrgba == colors[2]) ||
      (rightBallColorrgba == colors[3])) {
      let check = rightBallColor.map(function(item, index) {
        return item - ballColor[index];
      });
      if (!(check.every(item => ((item <= 10) && (item >= -10))))) {
        collision = true;
      }
    }

    if ((leftBallColorrgba == colors[0]) ||
      (leftBallColorrgba == colors[1]) ||
      (leftBallColorrgba == colors[2]) ||
      (leftBallColorrgba == colors[3])) {
      let check = leftBallColor.map(function(item, index) {
        return item - ballColor[index];
      });
      if (!(check.every(item => ((item <= 10) && (item >= -10))))) {
        collision = true;
      }
    }

  }

  //Used to move the objects in the canvas
  let executeOnce = true;
  let tempscore = 0;
  let factor = 2.5;
  let factorAngle = 1.2;
  let powerUpVal = false;
  let powerUpInit = Math.floor(Math.random() * 500);
  let execOncePowerUp = true;
  let pwrUpProb = Math.floor(Math.random()*10) + 1;

  function movement() {
    //Moves the arcs
    if (ball.position.y < 320) {
      gameObstacle.forEach(arcarray => {
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

      //Moves the powerUp object
      if (powerUp.length !== 0) {
        powerUp[0].position.y += factor;
      }

      //Increases the speed of movement every time the score increases by 500
      if (tempscore > 500) {
        tempscore = 0;
        factor += 0.2;
        factorAngle += 0.2;
        powerUpInit = Math.floor(Math.random() * 250) + 250;
        execOncePowerUp = true;

      }
      tempscore++;
      score++;
    }

    objectHandler();
  }

  function objectHandler() {
    //Pushes a new object when the one on the screen reaches half of the canvas height
    if (gameObstacle[0][0].position.y >= GAME_HEIGHT / 2) {
      if (executeOnce) {
        executeOnce = false;
        obj(150, -15);
        //Pushes the poweup if the following conditions satisfy else pushes changecolor
        if ((execOncePowerUp) && (powerUpInit <= tempscore) &&(pwrUpProb > 7)) {
          powerUp.push(new PowerUp());
          execOncePowerUp = false;
        } else {
          changecolor.push(new ColorChange());
        }

      }
    }

    //Removes the object once it reaches the bottom of the canvas
    if (gameObstacle[0][0].position.y >= GAME_HEIGHT) {
      executeOnce = true;
      changecolor.shift();
      gameObstacle.shift();
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

  //This class contains the triangle
  class Triangleobs {
    constructor(positionX, positionY) {
      this.position = {
        x: positionX,
        y: positionY
      };
      this.collisionPossible = true;
      this.angle = 0;
      this.colors = ["#ff0080", "#ffe80f", "#32e2f1", "#8c12fb"];

      shuffleArray(this.colors);
      this.color = this.colors[0];
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.angle);
      ctx.lineCap = "round";
      ctx.lineWidth = 10;
      ctx.strokeStyle = this.colors[0];
      ctx.beginPath();
      ctx.moveTo(-75, -75 / Math.pow(3, 0.5));
      ctx.lineTo(75, -75 / Math.pow(3, 0.5));
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = this.colors[1];
      ctx.beginPath();
      ctx.moveTo(75, -75 / Math.pow(3, 0.5));
      ctx.lineTo(0, 150 / Math.pow(3, 0.5));
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = this.colors[2];
      ctx.beginPath();
      ctx.moveTo(0, 150 / Math.pow(3, 0.5));
      ctx.lineTo(-75, -75 / Math.pow(3, 0.5));
      ctx.stroke();
      ctx.closePath();
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
      this.radius = 10;
    }

    draw(ctx) {
      ctx.fillStyle = ball.color;
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
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
      //If the ball is above the object sets the color to the one which allows entry into the next arc
      if (ball.position.y - 10 < this.position.y) {
        ball.color = gameObstacle[1][0].color;
        let collect = new Audio("sounds/collect.wav");
        collect.play();
        changecolor.shift();
      }
    }
  }

  class PowerUp {
    constructor() {
      this.image = new Image()
      this.image.src = document.getElementById('img_powerup').src;
      this.position = {
        x: GAME_WIDTH / 2 - 15,
        y: 125
      };
    }

    collide() {
      if (ball.position.y - 10 <= this.position.y + 30) {
        let collect = new Audio("sounds/collect.wav");
        collect.play();
        powerUp.shift();
        powerUpVal = true;
        let colors = ["#ff0080", "#ffe80f", "#32e2f1", "#8c12fb"];
        let i = 0;
        //Used to change the color of the ball continuously when powerup is collected
        let intv = setInterval(function() {
          if (i === colors.length) {
            i = 0;
          } else {
            ball.color = colors[i];
            i++;
          }
        }, 100);
        //Sets the color back to normal after 5s
        setTimeout(function() {
          powerUpVal = false;
          clearInterval(intv);
          if (changecolor.length === 0)
            ball.color = gameObstacle[1][0].color;
          else
            ball.color = gameObstacle[0][0].color;
        }, 5000);
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

            //Doesnt perform an action when paused is set to true
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

  obj(); //Inititalizes the initial object
  let ball = new Ball(GAME_WIDTH, GAME_HEIGHT, (gameObstacle[0][0]).color);
  new InputHandler(ball);
  let changecolor = [];
  let powerUp = [];
  let shift = 0;
  let counter = 0;
  let powerUpInterval = 0;
  let intvlOnce = true;

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

    if (powerUp.length !== 0)
      powerUp[0].collide();


    ball.draw(ctx);

    gameObstacle.forEach(arcarray => {
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
      if (gameObstacle.length > 1) {
        changecolor[0].colorchange();
      }
    }

    if (powerUp.length !== 0) {
      let frameHeightShift = powerUp[0].image.height / 6;
      let frameHeight = powerUp[0].image.height;
      let frameWidth = powerUp[0].image.width;
      let posX = powerUp[0].position.x;
      let posY = powerUp[0].position.y;

      ctx.drawImage(powerUp[0].image, 0, shift, frameWidth, frameHeightShift, posX, posY, 30, 30);
      if (intvlOnce) {
        intvlOnce = false;
        powerUpInterval = setInterval(function() {

          shift += frameHeightShift;
          if (shift >= frameHeight - frameHeightShift) {
            shift = 0;
          }
        }, 100);
      }
    } else {
      intvlOnce = true;
      clearInterval(powerUpInterval);
    }

    if (!powerUpVal)
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
};
