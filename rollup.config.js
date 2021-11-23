import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import dts from 'rollup-plugin-dts';

const minifyOptions = {
    format: {
        comments: /ctxMenu/
    }
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
    }, {
        file: 'standalone/ctxmenu.min.js',
        format: 'iife',
        plugins: [terser(minifyOptions)]
    }],
    plugins: [typescript()]
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