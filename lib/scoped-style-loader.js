const assert = require('assert')
const loaderUtils = require('loader-utils')
const { compileStyleAsync } = require('@vue/component-compiler-utils')

module.exports = function (rawStyle, prevMap) {
  const cb = this.async()
  const { id } = loaderUtils.getOptions(this)

  assert(id)

  compileStyleAsync({
    source: rawStyle,
    filename: this.resourcePath,
    id: 'data-v-' + id,
    map: prevMap,
    scoped: true
  }).then(
    result => {
      if (result.errors.length > 0) {
        cb(result.errors.join('\n'))
        return
      }
      cb(null, result.code, result.map)
    },
    err => cb(err)
  )
}
