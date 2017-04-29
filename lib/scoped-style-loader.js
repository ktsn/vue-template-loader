const assert = require('assert')
const loaderUtils = require('loader-utils')
const addScopedId = require('./modules/add-scoped-id')

module.exports = function (rawStyle, prevMap) {
  this.cacheable()
  const cb = this.async()
  const { id } = loaderUtils.getOptions(this)

  assert(id)

  addScopedId(id, rawStyle, {
    sourceMap: this.sourceMap,
    fileName: this.resourcePath,
    prevMap
  }).then(
    result => cb(null, result.css, result.map),
    err => cb(err)
  )
}
