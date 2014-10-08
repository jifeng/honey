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
  console.log(command, args, options);
  if ('function' === typeof options) {
    cb = options;
    options = {};
  }
  console.log('[%s] Now run the command: %s %s AT Env of (%s)', new Date(), command, args.join(' '), JSON.stringify(options));
  var changeUser = true;
  if ( options.changeUser === false ) {
    changeUser = false;
  }
  var user = exports.getUidAndGid(changeUser);
  user = os(process.env, user, options);
  var chunks = [];
  var error = false;
  var proc = spawn(command, args, user);

  hasCallback = false;
  proc.on('error', function(err) {
    console.log('[%s] ERROR Happen\n [%s]', new Date(), err.stack);
    if (hasCallback === true) {
      return;
    }
    hasCallback = true;
    setTimeout(function () {
      var str = Buffer.concat(chunks).toString();
      if (str) {
        err = new Error(str)
      }
      cb(err);
    }, 50);
  });

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
    
    if (hasCallback === true) {
      return;
    }
    hasCallback = true;
    if (error) {
      return setTimeout(function () {
        cb (undefined, str);
      }, 50);
    }
    setTimeout(function () {
      cb(undefined, str);
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