const assert = require('assert')
const compiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')
const SourceMapGenerator = require('source-map').SourceMapGenerator
const url = require('url')
const loaderUtils = require('loader-utils')

const empty =
  `var render = ${toFunction('')}\n` +
  'var staticRenderFns = []'

module.exports = function compile (template, options = {}) {
  const compiled = compiler.compile(template, {
    modules: [{
      postTransformNode: el => transformAsset(el, options.transformToRequire || {})
    }]
  })

  if (compiled.errors.length > 0) {
    return {
      errors: compiled.errors,
      code: empty
    }
  }

  const transpiled = transpile(
    `var render = ${toFunction(compiled.render)}\n` +
    `var staticRenderFns = [${compiled.staticRenderFns.map(toFunction).join(',')}]`
  )

  const result = {
    errors: [],
    code: transpiled
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

function transformAsset (el, transformToRequire) {
  if (!el.attrs) return

  Object.keys(transformToRequire).forEach(targetTag => {
    if (el.tag !== targetTag) return

    let targetAttrs = transformToRequire[targetTag]
    el.attrs.forEach(attr => {
      if (typeof targetAttrs === 'string') {
        targetAttrs = [targetAttrs]
      }

      targetAttrs.forEach(targetName => {
        if (attr.name !== targetName) return
        rewriteAsset(attr)
      })
    })
  })
}

function rewriteAsset (attr) {
  let value = attr.value

  const isStatic = value[0] === '"'
    && value[value.length - 1] === '"'
  if (!isStatic) {
    return
  }

  const first = value[1]
  if (first === '.' || first === '~') {
    if (first === '~') {
      value = '"' + value.slice(2)
    }

    const uriParts = evalUriParts(value)

    attr.value =
      !uriParts.uriFragment
        ? `require(${value})`
        :
        // support uri fragment case by excluding it from
        // the require and instead appending it as string
        `require("${uriParts.uriPath}") + "${uriParts.uriFragment}"`
  }
}

function toFunction (code) {
  return `function(){${code}}`
}

/**
 * ktsn/vue-template-loader#49 Support uri fragment in transformed require
 * @param candidate {string}
 * @returns {{uriFragment: string, uriPath: string}}
 */
function evalUriParts(candidate) {
  // initialize return value
  const returnValue = {
    uriFragment: null,
    uriPath: null
  }
  if (candidate) {
    // if we have enough input to eliminate the sourrounding quotes
    const fullUri =
      candidate.length > 2 ? candidate.slice(1, candidate.length - 1) : null
    // isUrlRequest throws TypeError if url is not of type string
    if ('string' === typeof fullUri && loaderUtils.isUrlRequest(fullUri)) {
      // check is an uri
      const uri = url.parse(fullUri) // take apart the uri
      if (uri.hash) {
        // if there is a fragment part
        // memo the fragment part(contains the  leading #)
        returnValue.uriFragment = uri.hash
        // memo the uri minus the fragment part
        returnValue.uriPath = uri.path
      }
    }
  }
  return returnValue
}
