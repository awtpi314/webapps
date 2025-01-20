window.addEventListener("load", function () {
  let volumeEnabled = false;
  let currentAudio = "audio/ground.mp3";

  const projectLinks = {
    1: "project1/project1.html",
    2: "project2/project2.html",
    3: "project3/project3.html",
    4: "project4/project4.html",
  };

  window.addEventListener("beforeunload", function () {
    mario.forEach((mario) => {
      mario.style.animation = "";
    });
    fadeOutBox.style = "";
    if (volumeEnabled) {
      toggleVolume();
    }
  });

  function backToPlayer() {
    const selector = document.getElementById("alexander-select");
    selector.style.animation = "click-mario-reverse 0.3s forwards";
    const selectorPage = document.getElementById("player-selector");
    selectorPage.style.animation = "fade-out 0.3s reverse";

    const backToPlayerBtn = document.getElementById("player-selector-back");
    backToPlayerBtn.style.display = "none";

    const playerSelectPage = document.getElementById("player-selector-page");
    const levelSelectPage = document.getElementById("level-selector-page");
    playerSelectPage.style.animation = "show-player-selector 0.3s forwards";
    levelSelectPage.style.animation = "hide-level-selector 0.3s forwards";

    setTimeout(() => {
      selector.style.animation = "";
      selectorPage.style.animation = "";
    }, 500);

    backToPlayerBtn.removeEventListener("click", backToPlayerBtn);
    selector.addEventListener("click", showLevelSelect);

    currentAudio = "audio/ground.mp3";
    const mediaPlayer = document.getElementById("media-player");
    mediaPlayer.src = currentAudio;
    mediaPlayer.play();
  }

  function showLevelSelect() {
    const selector = document.getElementById("alexander-select");
    selector.style.animation = "click-mario 2s forwards";
    const selectorPage = document.getElementById("player-selector");
    selectorPage.style.animation = "fade-out 0.3s forwards";

    setTimeout(() => {
      const backToPlayer = document.getElementById("player-selector-back");
      backToPlayer.style.display = "flex";

      const playerSelectPage = document.getElementById("player-selector-page");
      const levelSelectPage = document.getElementById("level-selector-page");
      playerSelectPage.style.animation = "hide-player-selector 0.3s forwards";
      levelSelectPage.style.animation = "show-level-selector 0.3s forwards";
    }, 500);

    const showLevelSelect = document.getElementById("alexander-select");
    showLevelSelect.removeEventListener("click", showLevelSelect);
    const backToPlayerBtn = document.getElementById("player-selector-back");
    backToPlayerBtn.addEventListener("click", backToPlayer);

    currentAudio = "audio/underground.mp3";
    const mediaPlayer = document.getElementById("media-player");
    mediaPlayer.src = currentAudio;
    mediaPlayer.play();
  }

  const showLevelSelectBtn = document.getElementById("alexander-select");
  showLevelSelectBtn.addEventListener("click", showLevelSelect);

  function moveToPipeHorizontal(marioPipe, pipeNumber) {
    const mario = document.querySelectorAll(".level-select-mario");

    if (marioPipe >= pipeNumber) {
      document.getElementById("sfx-player").src = "audio/pipe.mp3";
      document.getElementById("sfx-player").play();
      mario.forEach((mario) => {
        mario.style.animation +=
          ", mario-enter-pipe-horizontal 0.7s linear forwards";
      });

      setTimeout(() => {
        const fadeOutBox = document.getElementById("fade-out-box");
        fadeOutBox.style.animation = "animate-out 1s ease-out";
        fadeOutBox.style.zIndex = 100;

        setTimeout(() => {
          window.location.href = projectLinks[pipeNumber];
        }, 1000);
      }, 700);

      return;
    }

    document.getElementById("sfx-player").src = "audio/jump.mp3";
    document.getElementById("sfx-player").play();

    const animationName = `mario-jump-pipe${marioPipe + 1}`;
    mario.forEach((mario) => {
      mario.style.animation = animationName + " 0.7s linear forwards";
    });

    setTimeout(() => {
      moveToPipeHorizontal(marioPipe + 1, pipeNumber);
    }, 700);
  }

  const pipe1H = document.getElementById("pipe-1-horizontal");
  pipe1H.addEventListener("click", () => moveToPipeHorizontal(0, 1));

  const pipe2H = document.getElementById("pipe-2-horizontal");
  pipe2H.addEventListener("click", () => moveToPipeHorizontal(0, 2));

  const pipe3H = document.getElementById("pipe-3-horizontal");
  pipe3H.addEventListener("click", () => moveToPipeHorizontal(0, 3));

  const pipe4H = document.getElementById("pipe-4-horizontal");
  pipe4H.addEventListener("click", () => moveToPipeHorizontal(0, 4));

  function toggleVolume() {
    document.getElementById("no-volume-icon").style.display = volumeEnabled
      ? "block"
      : "none";
    document.getElementById("volume-icon").style.display = volumeEnabled
      ? "none"
      : "block";

    volumeEnabled = !volumeEnabled;

    document.getElementById("media-player").muted = !volumeEnabled;
    document.getElementById("sfx-player").muted = !volumeEnabled;
    document.getElementById("media-player").play();
  }

  document
    .getElementById("volume-control-box")
    .addEventListener("click", toggleVolume);
});
