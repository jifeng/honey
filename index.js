require('coffee-script');
if (require.extensions['.coffee']) {
  module.exports = require('./lib/util.js');
} else {
  module.exports = require('./out/release/lib/util.js');
}