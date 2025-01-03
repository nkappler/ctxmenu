import typescript from '@rollup/plugin-typescript';
import fs from "fs";
import analyzer from "rollup-plugin-analyzer";
import dts from 'rollup-plugin-dts';
import { terser } from "rollup-plugin-terser";
import zlib from 'zlib';

const minifyOptions = {
    format: {
        comments: /ctxMenu/
    },
    // keep_fnames: true,
    mangle: {
        properties: {
            keep_quoted: "strict",
            builtins: false,
            reserved: [
                "subMenu",
                "html",
                "element",
                "text",
                "icon",
                "style",
                "prototype",
                "events",
                "tooltip",
                "title",
                "onShow",
                "onHide",
                "onBeforeShow",
                "onBeforeHide",
                "attributes",
                "subMenuAttributes",

                // most of the used builtins we would also need to reserve
                // "addEventListener",
                // "removeEventListener",
                // "bind",
                // "body",
                // "createElement",
                // "querySelector",
                // "call",
                // "slice",
                // "preventDefault",
                // "stopImmediatePropagation",
                // "append",
                // "map",
                // "filter",
                // "hasOwnProperty",
                // "entries",
                // "forEach",
                // "every",
                // "classList",
                // "add",
                // "concat",
                // "call",
                // "apply",
                // "getBoundingClientRect",
                // "assign",
                // "visualViewport",
                // "cloneNode",
                // "appendChild",
                // "removeChild",
                // "replaceChildren",
                // "width",
                // "height",
                // "children",
                // "remove",
                // "className",
                // "includes",
                // "stopPropagation",
                // "action",
                // "hide",
                // "setAttribute"
            ]
        }
    },
};

const options = {
    ...minifyOptions,
    format: {
        ...minifyOptions.format,
        beautify: true
    },
    compress: {
        defaults: false
    },
    mangle: false,
}

export default [{
    input: 'src/ctxmenu.ts',
    output: [{
        file: 'index.js',
        format: 'cjs',
        plugins: [terser(options)]
    }, {
        file: 'index.min.js',
        format: 'cjs',
        plugins: [terser(minifyOptions)]
    }],
    plugins: [typescript()]
}, {
    input: 'src/standalone.ts',
    output: [{
        file: 'standalone/ctxmenu.js',
        format: 'iife',
        plugins: [terser(options)]
    }],
    plugins: [
        typescript(),
        analyzer({ summaryOnly: true, })
    ],
}, {
    input: 'src/standalone.ts',
    output: [{
        file: 'standalone/ctxmenu.min.js',
        format: 'iife',
        plugins: [
            terser(minifyOptions),
            {
                name: 'log-file-size',
                writeBundle() {
                    const stats = fs.statSync('standalone/ctxmenu.min.js');
                    const fileContents = fs.readFileSync("standalone/ctxmenu.min.js");
                    const gzippedSize = zlib.gzipSync(fileContents).length;
                    console.log(
                        `
***********
Final minified file size: ${stats.size} bytes
Gzipped file size: ${gzippedSize} bytes
***********

`
                    );
                }
            }
        ]
    }],
    plugins: [
        typescript(),
    ]
},
{
    input: 'src/ctxmenu.ts',
    output: [{
        file: 'index.d.ts',
        format: 'es'
    }],
    plugins: [dts()],
},
{
    input: 'src/standalone.ts',
    output: [{
        file: 'standalone/ctxmenu.d.ts',
        format: 'es'
    }],
    plugins: [dts({ respectExternal: true })],
}]; 