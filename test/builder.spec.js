const { SourceMapGenerator, SourceMapConsumer } = require('source-map')
const Builder = require('../lib/builder/builder')

function code (lines) {
  return lines.join('\n') + '\n'
}

describe('Builder', () => {
  it('adds line on code', () => {
    const b = new Builder()

    b.addLine('var a = "foo"')
    b.addLine('var b = "bar"')
    b.addLine('console.log(a + b)')

    expect(b.generate().code).toBe(code([
      'var a = "foo"',
      'var b = "bar"',
      'console.log(a + b)'
    ]))
  })

  it('enters block', () => {
    const b = new Builder()

    b.addLine('var a = "a"')
    b.enterBlock('function foo () {', '}', () => {
      b.addLine('var b = "b"')
    })
    b.addLine('var c = "c"')

    expect(b.generate().code).toBe(code([
      'var a = "a"',
      'function foo () {',
      '  var b = "b"',
      '}',
      'var c = "c"'
    ]))
  })

  it('generates source map', () => {
    const generator = new SourceMapGenerator({
      file: 'test.html'
    })
    generator.addMapping({
      source: 'test.html',
      original: { line: 1, column: 0 },
      generated: { line: 1, column: 0 }
    })
    const map = JSON.parse(generator.toString())

    const b = new Builder()
    b.addLine('var a = "a"')
    b.enterBlock('function foo () {', '}', () => {
      b.addLine('var render = function () { return "test" }', map)
      b.addLine('var b = "b"')
    })

    const result = b.generate()
    const smc = new SourceMapConsumer(result.map)
    const pos = smc.originalPositionFor({ line: 3, column: 0 })

    expect(result.code).toBe(code([
      'var a = "a"',
      'function foo () {',
      '  var render = function () { return "test" }',
      '  var b = "b"',
      '}'
    ]))

    expect(pos.source).toBe('test.html')
    expect(pos.line).toBe(1)
    expect(pos.column).toBe(0)
  })
})
