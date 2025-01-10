window.addEventListener("load", function () {
  let lastAnimationTimer = 0;
  let bounceTimer = 0;
  let lastAnimationTime = Date.now();
  let marioState = 0;
  let lastScrollY = 0;

  function setMarioState(state, direction) {
    let marios = document.querySelectorAll(".mario");

    marios.forEach((mario) => {
      if (mario.id === state) {
        mario.style.display = "block";
      } else {
        mario.style.display = "none";
      }

      if (direction === "left") {
        mario.style.scale = "-1 1";
        mario.style.transform = "translateX(50%)";
      } else if (direction === "right") {
        mario.style.scale = "1 1";
        mario.style.transform = "translateX(-50%)";
      }
    });
  }

  function updateBackgrounds() {
    let backgrounds = document.querySelectorAll(".background");

    backgrounds.forEach((background) => {
      let ratio = window.innerWidth / window.innerHeight;
      if (ratio < 1.866667) {
        ratio = 1.866667;
      }
      background.style.left =
        window.innerWidth / 2 +
        -window.scrollY * ratio +
        Number.parseInt(background.id.slice(-1)) * background.clientWidth +
        "px";
    });
  }

  window.addEventListener("resize", function () {
    updateBackgrounds();
  });

  setMarioState("mario-stand", "right");
  updateBackgrounds();

  window.addEventListener("scroll", function () {
    if (lastAnimationTimer) {
      clearTimeout(lastAnimationTimer);
    }
    if (bounceTimer) {
      clearTimeout(bounceTimer);
    }
    this.document.getElementById("scroll-prompt").style.animation = "none";

    updateBackgrounds();

    if (Date.now() - lastAnimationTime >= 100) {
      setMarioState(
        "mario-run" + ++marioState,
        lastScrollY < window.scrollY ? "right" : "left"
      );
      if (marioState === 3) {
        marioState = 0;
      }
      lastAnimationTime = Date.now();
    }

    lastAnimationTimer = setTimeout(() => {
      setMarioState("mario-stand");
      marioState = 0;
    }, 50);

    bounceTimer = setTimeout(() => {
      let scrollPrompt = document.getElementById("scroll-prompt");

      scrollPrompt.style.animation = "smoothBounce 2s infinite";
    }, 4000);

    lastScrollY = window.scrollY;
  });
});
