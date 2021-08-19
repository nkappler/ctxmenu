const fs = require("fs");
const { version, author } = require("../package.json");

const lines = fs.readFileSync("./src/ctxmenu.ts", "utf-8").split("\r\n");

lines[0] = `/*! ctxMenu v${version} | (c) ${author} | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/`;

fs.writeFileSync("./src/ctxmenu.ts", lines.join("\r\n"), {});