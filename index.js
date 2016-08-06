const compiler = require('vue-template-compiler')

module.exports = function (content) {
  const compiled = compiler.compile(content)

  compiled.errors.forEach(error => {
    this.emitError('template syntax error ' + error)
  })

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
