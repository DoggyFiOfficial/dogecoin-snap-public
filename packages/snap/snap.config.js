module.exports = {
  experimental: {
    wasm: true,
  },
  input: 'src/index.ts',
  output: {
    path: 'dist',
  },
  polyfills: true,
  server: {
    port: 8080,
  },
};

// /* eslint-disable node/no-process-env */
// const through = require('through2');

// require('dotenv').config();

// module.exports = {
//   cliOptions: {
//     src: './src/index.ts',
//     port: 8080,
//   },
//   bundlerCustomizer: (bundler) => {
//     bundler
//       .transform(function () {
//         let data = '';
//         return through(
//           function (buffer, _encoding, callback) {
//             data += buffer;
//             callback();
//           },
//           function (callback) {
//             this.push("globalThis.Buffer = require('buffer/').Buffer;");
//             this.push(data);
//             callback();
//           },
//         );
//       })
//   },
// };
