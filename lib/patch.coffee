fs      = require 'fs'
path    = require 'path'
crypto  = require 'crypto'


# file => file.coffee / file.js 
exports.realAllFilename = (file) ->
  f = file + '.coffee'
  return f if fs.existsSync f
  f = file + '.js'
  return f if fs.existsSync f
  file

exports.urlFix = (url, inModule) ->
  ext = path.extname(url).toLowerCase()
  basename = url.substr(0, url.length - ext.length)
  switch ext
    when '', '.js', '.coffee'       then url = basename + '.js'
    when '.css', '.stylus', '.styl' then url = basename + '.css'
    when '.html', '.htm'            then url = basename + '.html'
    when '.jade'
      url = basename + '.html' unless inModule
  url

exports.md5 = (data) ->
  data = [data] if typeof data is 'string'
  hash = crypto.createHash 'md5'
  hash.update chunk for chunk in data
  hash.digest 'hex'

exports.randRequestId = () ->
  requestId = undefined
  try
    requestId = crypto.randomBytes(24).toString 'base64'
    requestId = requestId.replace(/\+/g, '-')
    requestId = requestId.replace(/\//g, '.')
    requestId = requestId.replace(/\=/g, '_')
  catch err
    requestId = ''
    while requestId.length < 32
      requestId += (Math.random() * 0xffffffff).toString(36)
    requestId = requestId.substring(0, 32)
  return requestId

  