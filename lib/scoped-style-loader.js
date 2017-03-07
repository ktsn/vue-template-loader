const assert = require('assert')
const loaderUtils = require('loader-utils')
const addScopedId = require('./modules/add-scoped-id')

module.exports = function (rawStyle) {
  this.cacheable()
  const cb = this.async()
  const { id } = loaderUtils.getOptions(this)

  assert(id)

  addScopedId(id, rawStyle)
    .then(
      result => cb(null, result.css),
      err => cb(err)
    )
}
