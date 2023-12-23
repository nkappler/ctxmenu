const fs = require("fs");
const path = require("path");
const { version, author } = require("../package.json");

const file = path.join("src", "ctxmenu.ts");
const lines = fs.readFileSync(file, "utf-8").split("\n");

lines[0] = `/*! ctxMenu v${version} | (c) ${author} | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/`;

fs.writeFileSync(file, lines.join("\n"), {});