$(document).ready(function () {
  var highScore = JSON.parse(window.localStorage.getItem("highScore")) || [];
  score = window.localStorage.getItem("score");
  playgame = window.localStorage.getItem("playgame");
  var mode = "lightMode";
  enterInitials();
  $("#toggleBtn").on("click", function () {
    if ($("#toggleDisplay").attr("class") === "toggle toggleFalse") {
      $(".navbar").attr(
        "class",
        "navbar navbar-expand-lg navbar-dark bg-dark dark-mode"
      );
      $("body").attr("class", "dark-mode");
      $("#toggleDisplay").attr("class", "toggle toggleTrue");
      $(".card").attr("class", "card dark-mode border-white");
      mode = "darkMode";
    } else {
      $(".navbar").attr(
        "class",
        "navbar navbar-expand-lg navbar-light light-mode"
      );
      $(".card").attr("class", "card light-mode");
      $("body").attr("class", "light-mode");
      $("#toggleDisplay").attr("class", "toggle toggleFalse");
    }

    window.localStorage.setItem("mode", mode);
  });
  newJoke();

  function newJoke() {
    $.ajax({
      type: "GET",
      url: "https://icanhazdadjoke.com/",
      dataType: "json",
    }).then(function (res) {
      console.log(res);
      var joke = res.joke;
      $("#joke").html(joke);
    });
  }

  $("#joke").on("click", function (e) {
    e.preventDefault();
    newJoke();
  });

  function enterInitials() {
    $("#showQuestion").text(`Your final score is ${score}`);
    $("#showOptions").append(`<div>Enter your name here</div>`);
    $("#showOptions").append("<form id='form'></form>");
    $("#form").append(
      "<input id='name' autofocus type='text' class='mr-3' placeholder='enter name here'></input>"
    );
    $("#form").append(
      "<input id='btnSubmit' type='submit' value='Submit'></input>"
    );
    $(document).on("click", "#btnSubmit", function (e) {
      e.preventDefault();
      var $name = $("#name").val();

      if (!$name) {
        showPopup("Please enter a valid name", "info", score);
      } else {
        $("#name").val("");
        highScore.push({ $name, score, playgame });
        window.localStorage.setItem("highScore", JSON.stringify(highScore));
        showHighScore();
      }
    });
  }

  function showHighScore() {
    $(document).on("click", "#resetHighScore", function () {
      window.localStorage.removeItem("highScore");
      highScore = null;
      insertHighScoreTable();
    });
    if (highScore !== null) {
      highScore.sort(function (a, b) {
        return b.score - a.score;
      });
    }
    insertHighScoreTable();
  }

  function insertHighScoreTable() {
    $("#showQuestion").append(
      `<div class='d-inline highScore'></div>
      <div class='d-inline float-right btn' id='resetHighScore'>RESET Score</div>
      <table class='table'>
      <thead>
      <th scope='col'>Game</th>
      <th scope='col'>Name</th>
      <th scope='col'>Score</th>
      </thead>
      <tbody id='tbody'></tbody>
      </table>`
    );
    var showCount = 7;
    if (highScore !== null) {
      if (highScore.length < showCount) {
        showCount = highScore.length;
      }
      for (var i = 0; i < showCount; i++) {
        $("#tbody").append(
          `<tr id='tr${i}'></tr>
          <th scope='row'>${highScore[i].playgame}</th>
          <th>${highScore[i].$name}</th>
          <th>${highScore[i].score}</th>`
        );
      }
    }
  }
});
