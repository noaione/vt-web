const shelljs = require("shelljs");

shelljs.cp("-R", "src/views", "dist/views");
shelljs.cp("-R", "src/assets", "dist/assets");
