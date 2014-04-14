var fs = require('fs');
var patch = require('./patch');

exports.getUidAndGid = function (changeUser) {
  if (!changeUser) {
    return {};
  }
  var uid = process.getuid();
  if (uid >= 500) {
    return {uid: process.getuid(), gid: process.getgid()}
  }
  var gidFile = '/etc/passwd';
  var str = fs.readFileSync(gidFile, 'utf-8');
  reg  = /[^app]admin:x:+(\d+):(\d+)/
  res  = str.match(reg);
  if (!res) {
    return {}
  }
  var user = {
    uid : +res[1],
    gid : +res[2]
  }
  return user;
};

for ( var key in patch ) {
  exports[key] = patch[key];
}

/**
 * get local ip
 * @return {String} 
 */
exports.getLocalAddress = function() {
  var os = require('os');
  var ifaces = os.networkInterfaces();
  for (var dev in ifaces) {
    for (var l = ifaces[dev].length; l--; ) {
      var details = ifaces[dev][l];
      if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
        return details.address;
      }
    }
  }
  return null;
}