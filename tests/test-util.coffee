#mocha
e = require 'expect.js'
fs = require 'fs'
http = require 'http'
util = require '../lib/util'

describe 'Util', ->
  describe 'urlFix', ->
    urlFix = util.urlFix
    cases = [
      ['/hello.js',        '/hello.js']
      ['/hello.coffee',    '/hello.js']
      ['/js/hello.js',     '/js/hello.js']
      ['/hello.css',       '/hello.css']
      ['/hello.stylus',    '/hello.css']
      ['/hello.styl',      '/hello.css']
      ['/css/hello.css',   '/css/hello.css']
      ['/hello.html',      '/hello.html']
      ['/hello.htm',       '/hello.html']
      ['/hello.jade',      '/hello.html']
      ['/html/hello.html', '/html/hello.html']
    ]
    cases.forEach (item) ->
      it item[0] + ' ==> ' + item[1], () ->
        e(urlFix item[0]).to.eql item[1]
    it 'jade in module', ->
      e(urlFix '/hello.jade', true).to.be '/hello.jade'


  describe 'md5', ->
    md5 = util.md5
    cases = [
      ['jifeng.zjd', '56aba81f7fa6b8fad1167b48bd0236f0'],
      [['jifeng.zjd'], '56aba81f7fa6b8fad1167b48bd0236f0']
    ]
    cases.forEach (item) ->
      it 'md5(' + item[0] + ') ==> ' + item[1], () ->
        value = md5 item[0]
        e(value).to.eql(item[1])


  describe 'getLocalAddress', ->
    it 'success', ->
      ip = util.getLocalAddress()
      e(ip).to.match(/\d+\.\d+\.\d+\.\d+/)