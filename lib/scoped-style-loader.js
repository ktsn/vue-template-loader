const assert = require('assert')
const loaderUtils = require('loader-utils')
const addScopedId = require('./modules/add-scoped-id')

module.exports = function (rawStyle, prevMap) {
  this.cacheable()
  const cb = this.async()
  const { id } = loaderUtils.getOptions(this)

  assert(id)

  addScopedId(id, this.resourcePath, rawStyle, prevMap)
    .then(
      result => {
        const map = this.sourceMap ? result.map.toJSON() : undefined
        cb(null, result.css, map)
      },
      err => cb(err)
    )
}
