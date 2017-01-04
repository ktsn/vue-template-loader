const querystring = require('querystring')
const compiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')
const genId = require('./gen-id')

module.exports = function (content) {
  this.cacheable()
  const isServer = this.options.target === 'node'
  const compiled = compiler.compile(content)
  const id = `data-v-${genId(this.resourcePath)}`

  // Acquire the query of target file
  const { style: stylePath } = querystring.parse(this.request.split('?').pop())

  compiled.errors.forEach(error => {
    this.emitError('template syntax error ' + error)
  })

  const transpiled = transpile(
    `var render = ${toFunction(compiled.render)}\n` +
    `var staticRenderFns = [${compiled.staticRenderFns.map(toFunction).join(',')}]`
  )

  const shouldHotReload = !isServer &&
    !this.minimize &&
    process.env.NODE_ENV !== 'production'

  let output = writeRenderCode(transpiled, id, stylePath)
  if (shouldHotReload) {
    output += writeHotReloadCode(id)
  }

  return output
}

function writeRenderCode (compiled, id, stylePath) {
  return [
    writeInjectStyle(stylePath, id),
    compiled,
    'module.exports = function (_exports) {',
    '  var options = _exports',
    '  if (typeof _exports === "function") options = _exports.options',
    `  ${writeInjectScopedId(stylePath, id)}`,
    '  options.render = render',
    '  options.staticRenderFns = staticRenderFns',
    '  if (module.hot && api) {',
    `    api.createRecord("${id}", options)`,
    '  }',
    '  return _exports',
    '}\n'
  ].join('\n')
}

function writeInjectStyle (stylePath, id) {
  const loaderPath = 'vue-template-loader/lib/scoped-style-loader.js'
  return stylePath
    ? `require('!!style-loader!css-loader!${loaderPath}?id=${id}!${stylePath}')`
    : ''
}

function writeInjectScopedId (isScoped, id) {
  return isScoped
    ? `options._scopeId = '${id}'`
    : ''
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
