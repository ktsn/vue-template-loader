// borrowed from vue-loader
const path = require('path')
const hash = require('hash-sum')
const cache = Object.create(null)
const sepRE = new RegExp(path.sep.replace('\\', '\\\\'), 'g')

module.exports = function genId (file, context) {
  const contextPath = context.split(path.sep)
  const rootId = contextPath[contextPath.length - 1]
  file = rootId + '/' + path.relative(context, file).replace(sepRE, '/')
  return cache[file] || (cache[file] = hash(file))
}
