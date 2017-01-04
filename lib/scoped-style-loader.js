const assert = require('assert')
const querystring = require('querystring')
const addScopedId = require('./modules/add-scoped-id')

module.exports = function (rawStyle) {
  this.cacheable()
  const cb = this.async()
  const { id } = querystring.parse(this.query.slice(1))

  assert(id)

  addScopedId(id, rawStyle)
    .then(
      result => cb(null, result.css),
      err => cb(err)
    )
}
