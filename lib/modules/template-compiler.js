const assert = require('assert')
const compiler = require('vue-template-compiler')
const { compileTemplate } = require('@vue/component-compiler-utils')
const SourceMapGenerator = require('source-map').SourceMapGenerator

const empty =
  'var render = function(){}\n' +
  'var staticRenderFns = []'

module.exports = function compile (template, options = {}) {
  const compiled = compileTemplate({
    source: template,
    filename: options.filename,
    compiler,
    transformAssetUrls: options.transformAssetUrls,
    isFunctional: options.functional,
    isProduction: options.isProduction,
    optimizeSSR: options.optimizeSSR
  })

  if (compiled.errors.length > 0) {
    return {
      errors: compiled.errors,
      code: empty
    }
  }

  const result = {
    errors: [],
    code: compiled.code
  }

  if (options.sourceMap) {
    assert(options.fileName, 'fileName is required if sourceMap === true')

    const generator = new SourceMapGenerator({
      file: options.fileName
    })

    // Simply map whole generated content to template
    // since template compiler does not support source map yet.
    generator.addMapping({
      source: options.fileName,
      original: { line: 1, column: 0 },
      generated: { line: 1, column: 0 }
    })
    generator.setSourceContent(options.fileName, template)

    result.map = JSON.parse(generator.toString())
  }

  return result
}
