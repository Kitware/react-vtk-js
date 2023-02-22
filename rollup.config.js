import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import analyze from 'rollup-plugin-analyzer';

const plugins = [
  typescript(),
  babel({
    include: 'src/**',
    exclude: 'node_modules/**',
    extensions: ['.js'],
    babelHelpers: 'runtime',
    presets: ['@babel/env', '@babel/preset-react'],
    plugins: ['@babel/plugin-transform-runtime'],
  }),
  commonjs(),
  analyze({
    stdout: true,
    summaryOnly: true,
  }),
];

const external = [
  /^@babel\/runtime\/?/,
  /^@kitware\/vtk\.js/,
  'react',
  'react/jsx-runtime',
  'regenerator-runtime',
  'deep-equal',
];

export default [
  {
    input: 'src/index.ts',
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
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.js', '.ts', '.tsx'],
      }),
      ...plugins,
    ],
  },
  {
    input: 'src/index.ts',
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
      terser(),
    ],
  },
];
