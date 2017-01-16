const compiler = require('vue-template-compiler')
const transpile = require('vue-template-es2015-compiler')

const empty =
  `var render = ${toFunction('')}\n` +
  'var staticRenderFns = []'

module.exports = function compile (template) {
  const compiled = compiler.compile(template)

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

function toFunction (code) {
  return `function(){${code}}`
}
