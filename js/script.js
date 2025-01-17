window.addEventListener("load", function () {
  const backToPlayer = document.getElementById("player-selector-back");
  backToPlayer.addEventListener("click", () => {
    const selector = document.getElementById("alexander-select");
    selector.style.animation = "click-mario-reverse 0.3s forwards";
    const selectorPage = document.getElementById("player-selector");
    selectorPage.style.animation = "fade-out 0.3s reverse";

    const levelSelector = document.getElementById("level-selector");
    const backToPlayer = document.getElementById("player-selector-back");
    selectorPage.style.display = "flex";
    levelSelector.style.display = "none";
    backToPlayer.style.display = "none";

    setTimeout(() => {
      selector.style.animation = "";
      selectorPage.style.animation = "";
    }, 500);
  });

  document.getElementById("alexander-select").addEventListener("click", () => {
    const selector = document.getElementById("alexander-select");
    selector.style.animation = "click-mario 1.5s forwards";
    const selectorPage = document.getElementById("player-selector");
    selectorPage.style.animation = "fade-out 0.3s forwards";

    const backToPlayer = document.getElementById("player-selector-back");
    backToPlayer.style.display = "flex";

    setTimeout(() => {
      const levelSelector = document.getElementById("level-selector");
      selectorPage.style.display = "none";
      levelSelector.style.display = "flex";
    }, 500);
  });
});
