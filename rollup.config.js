import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import analyze from 'rollup-plugin-analyzer';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const plugins = [
  !process.env.NOLINT &&
    eslint({
      include: 'src/**/*.js',
      exclude: 'node_modules/**',
    }),
  babel({
    include: 'src/**',
    exclude: 'node_modules/**',
    extensions: ['.js'],
    babelHelpers: 'runtime',
    presets: ['@babel/env', '@babel/preset-react'],
    plugins: ['@babel/plugin-transform-runtime'],
  }),
  commonjs(),
  terser(),
  analyze({
    stdout: true,
    summaryOnly: true,
  }),
];

const external = [
  '@babel/runtime',
  '@kitware/vtk.js',
  'prop-types',
  'react',
  'regenerator-runtime',
];

export default [
  {
    input: 'src/index.js',
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      {
        file: 'dist/cjs/react-vtk.js',
        format: 'cjs',
      },
    ],
    external,
    plugins,
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/umd/react-vtk.js',
        format: 'umd',
        exports: 'named',
        name: 'ReactVtkJS',
      },
    ],
    external,
    plugins: [
      nodeResolve({
        // include: 'node_modules/**',
        // don't rely on node builtins for web
        preferBuiltins: false,
        browser: true,
      }),
      ...plugins,
    ],
  },
];
