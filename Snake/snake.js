var apiKey = "fZd83cUM8MNVbIKeK8MuxdZLC4oIMih2";

$(document).ready(function () {
  var playgame = "snake";
  window.localStorage.setItem("playgame", playgame);

  $("#toggleBtn").on("click", function () {
    if ($("#toggleDisplay").attr("class") === "toggle toggleFalse") {
      $(".navbar").attr(
        "class",
        "navbar navbar-expand-lg navbar-dark bg-dark dark-mode"
      );
      $("body").attr("class", "dark-mode");
      $("#toggleDisplay").attr("class", "toggle toggleTrue");
      $(".card").attr("class", "card dark-mode border-white");
    } else {
      $(".navbar").attr(
        "class",
        "navbar navbar-expand-lg navbar-light light-mode"
      );
      $(".card").attr("class", "card light-mode");
      $("body").attr("class", "light-mode");
      $("#toggleDisplay").attr("class", "toggle toggleFalse");
    }
  });
});

$(function () {
  var canvas = $("#canvas")[0];
  var ctx = canvas.getContext("2d");

  var cHeight = canvas.height;
  var cWidth = canvas.width;
  var snakeHeight = 10;
  var snakeWidth = 10;
  var blockSize = 10;

  var score = 0;

  var snake = [
    {
      x: 200,
      y: 40,
      oldX: 0,
      oldY: 0,
      drawn: false,
    },
    {
      x: 200,
      y: 30,
      oldX: 0,
      oldY: 0,
      drawn: false,
    },
    {
      x: 200,
      y: 20,
      oldX: 0,
      oldY: 0,
      drawn: false,
    },
  ];
  var food = {
    x: 50,
    y: 50,
    eaten: false,
  };
  const LEFT = 37;
  const UP = 38;
  const RIGHT = 39;
  const DOWN = 40;

  var fps = 100;

  var keyPressed = DOWN;

  var game;

  var redirectTimer;
  $("#restart").hide();
  $("#submitBtn").on("click", function (event) {
    event.preventDefault();
    startGame();
    $("#submitBtn").hide();
    $("#restart").show();
  });

  $("#restart").on("click", function (event) {
    event.preventDefault();
    // console.log("hello");
    window.location.href = "./snake.html";
  });

  function highScores() {
    redirectTimer = setTimeout(function () {
      window.location.href = "./../highscores/highscores.html";
    }, 5000);
  }

  function stopGame() {
    clearInterval(game);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $("#canvas").hide();
    $.ajax({
      type: "GET",
      url: `http://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=gameover`,
      dataType: "JSON",
    }).then(function (res) {
      var gif =
        res.data[Math.floor(Math.random() * res.data.length)].images.original
          .url;
      $(".container").prepend(
        `<img src=${gif} class="img-fluid rounded mx-auto d-block mt-5"/>`
      );
    });
    highScores();
  }

  function startGame() {
    game = setInterval(gameLoop, fps);
  }

  function gameLoop() {
    clearCanvas();
    drawFood();
    moveSnake(keyPressed);
    drawSnake();
  }

  function drawSnake() {
    ctx.fillStyle = "#a64ac9";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    $.each(snake, function (index, value) {
      ctx.fillRect(value.x, value.y, snakeWidth, snakeHeight);
      ctx.strokeRect(value.x, value.y, snakeWidth, snakeHeight);
      snake[index].drawn = true;
      if (index == 0) {
        if (collided(value.x, value.y)) {
          stopGame();
        } else {
          if (caughtFood(value.x, value.y)) {
            updateScore();
            updateFoodEatenFlag();
            makeSnakeBigger();
          }
        }
      }
    });
  }

  function updateScore() {
    score++;
    $("#score").text(score);
    window.localStorage.setItem("score", score);
    if (score % 5 == 0) {
      updateSpeed();
    }
  }

  function updateSpeed() {
    fps += 10;
  }

  function updateFoodEatenFlag() {
    food.eaten = true;
  }

  function makeSnakeBigger() {
    snake.push({
      x: snake[snake.length - 1].x,
      y: snake[snake.length - 1].y,
    });
  }

  function collided(x, y) {
    return (
      snake.filter((item, index) => {
        return index != 0 && item.x == x && item.y == y;
      }).length > 0 ||
      x < 0 ||
      x > cWidth ||
      y < 0 ||
      y > cHeight
    );
  }

  function caughtFood(x, y) {
    return x == food.x && y == food.y;
  }

  function drawFood() {
    ctx.fillStyle = "#fccd04";
    let xy = getPositionForFood();
    food = {
      x: xy.x,
      y: xy.y,
      eaten: false,
    };
    ctx.fillRect(food.x, food.y, snakeWidth, snakeHeight);
  }

  function getPositionForFood() {
    let xy;
    if (food.eaten == true) {
      let xArray = (yArray = []);
      $.each(snake, function (index, value) {
        if ($.inArray(value.x, xArray) == -1) {
          xArray.push(value.x);
        }
        if ($.inArray(value.y, yArray) == -1) {
          yArray.push(value.y);
        }
      });
      xy = getEmptyBlock(xArray, yArray);
    } else {
      xy = food;
    }
    return xy;
  }

  function getEmptyBlock(xArray, yArray) {
    let newXY = {};
    newX = getRandomNumber(cWidth - 10, 10);
    newY = getRandomNumber(cHeight - 10, 10);
    if ($.inArray(newX, xArray) == -1 && $.inArray(newY, yArray) == -1) {
      newXY.x = newX;
      newXY.y = newY;
      return newXY;
    } else {
      return getEmptyBlock(xArray, yArray);
    }
  }

  function getRandomNumber(max, multipleOf) {
    let result = Math.floor(Math.random() * max);
    result = result % 10 == 0 ? result : result + (multipleOf - (result % 10));
    return result;
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, cWidth, cHeight);
  }

  $(document).keydown(function (e) {
    if ($.inArray(e.which, [LEFT, UP, RIGHT, DOWN]) != -1) {
      keyPressed = checkKeyAllowed(e.which);
    }
  });

  function checkKeyAllowed(tempKey) {
    let key;
    if (tempKey == DOWN) {
      key = keyPressed != UP ? tempKey : keyPressed;
    } else if (tempKey == UP) {
      key = keyPressed != DOWN ? tempKey : keyPressed;
    } else if (tempKey == LEFT) {
      key = keyPressed != RIGHT ? tempKey : keyPressed;
    } else if (tempKey == RIGHT) {
      key = keyPressed != LEFT ? tempKey : keyPressed;
    }
    return key;
  }

  function moveSnake(keyPressed) {
    $.each(snake, function (index, value) {
      if (snake[index].drawn == true) {
        snake[index].oldX = value.x;
        snake[index].oldY = value.y;
        if (index == 0) {
          if (keyPressed == DOWN) {
            snake[0].y = snake[0].y + blockSize;
          } else if (keyPressed == UP) {
            snake[0].y = snake[0].y - blockSize;
          } else if (keyPressed == LEFT) {
            snake[0].x = snake[0].x - blockSize;
          } else if (keyPressed == RIGHT) {
            snake[0].x = snake[0].x + blockSize;
          }
        } else {
          snake[index].x = snake[index - 1].oldX;
          snake[index].y = snake[index - 1].oldY;
        }
        snake[index].drawn = false;
      }
    });
  }
});
