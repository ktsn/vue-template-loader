const compiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')

const empty =
  `var render = ${toFunction('')}\n` +
  'var staticRenderFns = []'

module.exports = function compile (template, { transformToRequire = {}} = {}) {
  const compiled = compiler.compile(template, {
    modules: [{
      postTransformNode: el => transformAsset(el, transformToRequire)
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

  return {
    errors: [],
    code: transpiled
  }
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
    attr.value = `require(${value})`
  }
}

function toFunction (code) {
  return `function(){${code}}`
}
