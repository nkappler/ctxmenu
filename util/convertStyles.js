/* 
storing css as a javascript object is about 40% less efficient than plain css, wasting almost 1kB.
this tool reads the css template file and creates a .ts file exporting the styles as string.
This way we can use the benefits of both IDE integration as well as efficiency of plain css,
whilst being in a typescript environment.
*/

const fs = require("fs");

let styles = fs.readFileSync("./src/styles.css", "utf-8").split("\r\n");
styles = styles.map(line => line
    .replace(/\s+\{/, "{")
    .replace(/\:\s+/, ":")
    .replace(/^\s+/g, ""));

fs.writeFileSync("./src/styles.ts", `// This file is autogenerated. Modify styles.css instead.\nexport const styles = \`${styles.join("")}\`;`, {});