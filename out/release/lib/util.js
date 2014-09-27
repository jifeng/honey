var fs = require('fs');
var patch = require('./patch');
var spawn = require('child_process').spawn;
var os = require('options-stream');

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


exports.spawn = function (command, args, options, cb) {
  if ('function' === typeof options) {
    cb = options;
    options = {};
  }
  console.log('Now run the command: ', command, args, options);
  var changeUser = true;
  if ( options.changeUser === false ) {
    changeUser = false;
  }
  var user = exports.getUidAndGid(changeUser);
  user = os(process.env, user, options);
  var chunks = [];
  var error = false;
  var proc = spawn(command, args, user);
  proc.stdout.on('data', function (data) {
    chunks.push(data);
  });

  proc.stderr.on('data', function (data) {
    error = true;
    chunks.push(data);
  });

  proc.on('close', function (code) {
    //运行某些指令耗时比较长，所以设置的callback延时
    var str = Buffer.concat(chunks).toString();
    if (error) {
      return setTimeout(function () {
        cb (null, str);
      }, 50);
    }
    setTimeout(function () {
      cb(null, str);
    }, 100);

  });
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