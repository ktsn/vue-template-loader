/**
 * Some part of codes are borrowed/modified from vue-loader
 * https://github.com/vuejs/vue-loader
 * Released under the MIT License
 */

const loaderUtils = require('loader-utils')
const compile = require('./modules/template-compiler')
const genId = require('./modules/gen-id')
const Builder = require('./builder/builder')

module.exports = function (content) {
  this.cacheable()
  const isServer = this.options.target === 'node'
  const id = `data-v-${genId(this.resourcePath, process.cwd())}`

  // Acquire the query of target file
  const { style: stylePath } = loaderUtils.parseQuery('?' + this.request.split('?').pop())
  const options = Object.assign(loaderUtils.getOptions(this) || {}, {
    sourceMap: this.sourceMap,
    fileName: this.resourcePath
  })

  const isHmrEnabled = options.hmr !== false

  const compiled = compile(content, options)
  compiled.errors.forEach(error => {
    this.emitError('template syntax error ' + error)
  })

  const shouldHotReload = isHmrEnabled && !isServer && !this.minimize &&
    process.env.NODE_ENV !== 'production'

  const builder = new Builder()

  // Inject require statement for style if it is specified
  if (stylePath) {
    if (!options.scoped) {
      builder.addLine(`
        var styles = require('${stylePath}')
      `)
    } else {
      const loaderPath = require.resolve('./scoped-style-loader.js')
      const req = loaderUtils.stringifyRequest(
        this,
        `${loaderPath}?id=${id}!${stylePath}`
      )

      builder.addLine(`
        var styles = require(${req})
      `)
    }
  }

  // Inject compiled render functions
  builder.addLine(compiled.code, compiled.map)

  // Start to write the exported function
  builder.enterBlock('module.exports = function (_exports) {', '}', () => {

    // Extract component options object and inject render functions
    builder.addLine(`
      var options = typeof _exports === 'function'
        ? _exports.options
        : _exports
      options.render = render
      options.staticRenderFns = staticRenderFns
    `)

    // Set _scopeId if scoped CSS is enabled
    if (options.scoped) {
      builder.addLine(`
        options._scopeId = '${id}'
      `)
    }

    // Inject a snippet for adding CSS Modules object in computed
    if (stylePath) {
      builder.addLine(`
        if (Object.keys(styles).length > 0) {
          if (!options.computed) options.computed = {}
          options.computed.$style = function () { return styles }
        }
      `)
    }

    // Register vue-hot-reload-api if HMR is enabled
    if (shouldHotReload) {
      builder.addLine(`
        if (module.hot && api) {
          api.createRecord("${id}", options)
        }
      `)
    }

    builder.addLine('return _exports')
  })

  if (shouldHotReload) {
    builder.addLine(`
      var api = null
      if (module.hot) {(function () {
        api = require("vue-hot-reload-api")
        api.install(require("vue"))
        if (!api.compatible) return
        module.hot.accept()
        if (module.hot.data) {
          api.rerender("${id}", { render: render, staticRenderFns: staticRenderFns })
        }
      })()}
    `)
  }

  const result = builder.generate()
  this.callback(null, result.code, result.map)
}
