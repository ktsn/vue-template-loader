const compiler = require('vue-template-compiler')
const genId = require('./gen-id')

module.exports = function (content) {
  this.cacheable()
  const isServer = this.options.target === 'node'
  const compiled = compiler.compile(content)
  const id = `data-v-${genId(this.resourcePath)}`

  compiled.errors.forEach(error => {
    this.emitError('template syntax error ' + error)
  })

  const shouldHotReload = !isServer &&
    !this.minimize &&
    process.env.NODE_ENV !== 'production'

  let output = writeRenderCode(compiled, id)
  if (shouldHotReload) {
    output += writeHotReloadCode(id)
  }

  return output
}

function writeRenderCode (compiled, id) {
  return [
    `var render = ${toFunction(compiled.render)}`,
    `var staticRenderFns = [${compiled.staticRenderFns.map(toFunction).join(',')}]`,
    'module.exports = function (_exports) {',
    '  var options = _exports',
    '  if (typeof _exports === "function") options = _exports.options',
    '  options.render = render',
    '  options.staticRenderFns = staticRenderFns',
    '  if (module.hot && api) {',
    `    api.createRecord("${id}", options)`,
    '  }',
    '  return _exports',
    '}\n'
  ].join('\n')
}

function writeHotReloadCode (id) {
  return [
    'var api = null',
    'if (module.hot) {(function () {',
    '  api = require("vue-hot-reload-api")',
    '  api.install(require("vue"))',
    '  if (!api.compatible) return',
    '  module.hot.accept()',
    '  if (module.hot.data) {',
    `    api.rerender("${id}", { render: render, staticRenderFns: staticRenderFns })`,
    '  }',
    '})()}\n'
  ].join('\n')
}

function toFunction (code) {
  return `function(){${code}}`
}
