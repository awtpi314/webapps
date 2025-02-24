let { platform } = require("os");

module.exports = {
  php:
    platform() === "win32"
      ? "C:\\Users\\awtpi\\scoop\\shims\\php.exe"
      : "/opt/homebrew/bin/php",
};
