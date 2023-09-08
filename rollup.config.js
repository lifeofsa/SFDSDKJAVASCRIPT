import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.es.js",
      format: "es",
      sourcemap: true,
    },
  ],

  plugins: [
    // babel({
    //   exclude: "node_modules/**"
    // }),
    // resolve(),
    // nodeResolve(),
    commonjs(),
    // json(),
    // typescript(),
  ],
};
