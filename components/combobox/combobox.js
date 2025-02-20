window.addEventListener("load", function () {
  this.document
    .querySelectorAll(".awtpi-combobox")
    .forEach(function (combobox) {
      const input = combobox.querySelector("input");

      function openDropdown(e) {
        e?.stopPropagation();
        const comboboxDropdown = combobox.querySelector(
          ".awtpi-combobox-dropdown"
        );
        comboboxDropdown.classList.remove("close");
        comboboxDropdown.classList.add("open");

        document.addEventListener("click", closeDropdown);

        input.focus();
      }

      function closeDropdown(e) {
        e?.stopPropagation();
        const comboboxDropdown = combobox.querySelector(
          ".awtpi-combobox-dropdown"
        );
        comboboxDropdown.classList.remove("open");
        comboboxDropdown.classList.add("close");

        document.removeEventListener("click", closeDropdown);
      }

      combobox.addEventListener("click", openDropdown);

      const disappearTimeouts = [];
      input.addEventListener("input", function (e) {
        disappearTimeouts.forEach(function (timeout) {
          clearTimeout(timeout);
        });

        const value = e.target.value;
        combobox
          .querySelectorAll(".awtpi-combobox-option")
          .forEach(function (option) {
            option.classList.remove("cull");
            if (
              option.textContent.toLowerCase().includes(value.toLowerCase())
            ) {
              option.style.display = "block";
            } else {
              option.classList.add("cull");
              disappearTimeouts.push(
                setTimeout(function () {
                  option.style.display = "none";
                }, 400)
              );
            }
          });
      });

      combobox
        .querySelectorAll(".awtpi-combobox-option")
        .forEach(function (option) {
          option.addEventListener("click", function (e) {
            e.stopPropagation();
            input.value = e.target.textContent;
            input.dispatchEvent(new Event("input"));
            combobox.querySelector(".awtpi-combobox-value").value =
              option.getAttribute("data-value");
            closeDropdown();
          });
        });

      const boundingRect = combobox.getBoundingClientRect();
      if (boundingRect.top > window.innerHeight / 2) {
        combobox
          .querySelector(".awtpi-combobox-dropdown")
          .classList.add("render-top");
      } else {
        combobox
          .querySelector(".awtpi-combobox-dropdown")
          .classList.add("render-bottom");
      }
    });
});
