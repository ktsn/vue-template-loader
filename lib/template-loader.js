/**
 * Some part of codes are borrowed/modified from vue-loader
 * https://github.com/vuejs/vue-loader
 * Released under the MIT License
 */

const loaderUtils = require('loader-utils')
const compile = require('./modules/template-compiler')
const genId = require('./modules/gen-id')

module.exports = function (content) {
  this.cacheable()
  const isServer = this.options.target === 'node'
  const id = `data-v-${genId(this.resourcePath, process.cwd())}`

  // Acquire the query of target file
  const { style: stylePath } = parseQuery(this.request.split('?').pop())
  const options = loaderUtils.getOptions(this) || {}
  const isHmrEnabled = options.hmr !== false

  const compiled = compile(content, options)
  compiled.errors.forEach(error => {
    this.emitError('template syntax error ' + error)
  })

  const shouldHotReload = isHmrEnabled && !isServer && !this.minimize &&
    process.env.NODE_ENV !== 'production'

  let output = writeRenderCode(compiled.code, id, stylePath, options.scoped, shouldHotReload)
  if (shouldHotReload) {
    output += writeHotReloadCode(id)
  }

  return output
}

function writeRenderCode (compiled, id, stylePath, isScoped, shouldHotReload) {
  return [
    writeInjectStyle(stylePath, isScoped, id),
    compiled,
    'module.exports = function (_exports) {',
    '  var options = _exports',
    '  if (typeof _exports === "function") options = _exports.options',
    writeInjectScopedId(stylePath && isScoped, id),
    writeInjectCssModules(stylePath),
    '  options.render = render',
    '  options.staticRenderFns = staticRenderFns',
    writeHotReloadCreateRecord(id, shouldHotReload),
    '  return _exports',
    '}\n'
  ].join('\n')
}

function writeInjectStyle (stylePath, isScoped, id) {
  if (!stylePath) return ''

  if (!isScoped) {
    return `var styles = require('${stylePath}')`
  }

  const loaderPath = require.resolve('./scoped-style-loader.js')
  return `var styles = require('${loaderPath}?id=${id}!${stylePath}')`
}

function writeInjectScopedId (isScoped, id) {
  return isScoped
    ? `  options._scopeId = '${id}'`
    : ''
}

function writeInjectCssModules (isEnabled) {
  if (!isEnabled) return ''

  return [
    '  if (Object.keys(styles).length > 0) {',
    '    if (!options.computed) options.computed = {}',
    '    options.computed.$style = function () { return styles }',
    '  }'
  ].join('\n')
}

function writeHotReloadCreateRecord (id, shouldHotReload) {
  return shouldHotReload
    ? [
      '  if (module.hot && api) {',
      `    api.createRecord("${id}", options)`,
      '  }'
    ].join('\n')
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

function parseQuery (query) {
  const res = {}
  query.replace(/^\?/, '').split('&').forEach(param => {
    const p = param.split('=')
    res[p[0]] = p[1] || true
  })
  return res
}
