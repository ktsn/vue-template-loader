const compiler = require('vue-template-compiler')

module.exports = function (content) {
  const compiled = compiler.compile(content)

  if (compiled.errors.length > 0) throw compiled.errors

  const output =
    'module.exports = function (options) {\n' +
    `  options.render = ${toFunction(compiled.render)}\n` +
    `  options.staticRenderFns = [${compiled.staticRenderFns.map(toFunction).join(',')}]\n` +
    '  return options\n' +
    '}'

  return output
}

function toFunction (code) {
  return `function(){${code}}`
}
