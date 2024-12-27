module.exports = {
  input: "src/index.ts",
  output: {
    path: "dist",
  },
  polyfills: {
    assert: true,
    url: true,
    crypto: true,
    stream: true,
    string_decoder: true,
    util: true,
    punycode: true,
    events: true,
  },
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
