/* 
storing css as a javascript object is about 40% less efficient than plain css, wasting almost 1kB.
this tool reads the css template file and creates a .ts file exporting the styles as string.
This way we can use the benefits of both IDE integration as well as efficiency of plain css,
whilst being in a typescript environment.
*/

const fs = require("fs");

let lines = fs.readFileSync("./src/styles.css", "utf-8").split("\n");
const styles = lines.map(line => line
    .replace(/\r/g, "")         // remove carriage return for DOS line endings
    .replace(/\s0\./g, " .")    // remove leading zero from fractions, eg '0.4rem' => '.4rem'
    .replace(/,\s/g, ",")        // remove whitespace after comma
    .replace(/\s+\{/g, "{")      // remove empty space between selector and rule brackets, eg '.class {' => '.class{'
    .replace(/\:\s+/g, ":")      // remove empty space between rule name and rule value, eg 'padding: 1rem' => 'padding:1rem'
    .replace(/^\s+/g, ""))      // remove empty space caused by indentation
    .join("")                   // join lines
    .replace(/;}/g, "}");       // remove trailing semicolon of last rule in a block, eg 'padding:1rem;}' => 'padding:1rem}'

fs.writeFileSync("./src/styles.ts", `// This file is autogenerated. Modify styles.css instead.\nexport const styles = \`${styles}\`;`, {});