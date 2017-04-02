const Builder = require('../lib/builder/builder')

describe('Builder', () => {
  it('adds line on code', () => {
    const b = new Builder()

    b.addLine('var a = "foo"')
    b.addLine('var b = "bar"')
    b.addLine('console.log(a + b)')

    expect(b.generate()).toBe([
      'var a = "foo"',
      'var b = "bar"',
      'console.log(a + b)'
    ].join('\n'))
  })

  it('enters block', () => {
    const b = new Builder()

    b.addLine('var a = "a"')
    b.enterBlock('function foo () {', '}', () => {
      b.addLine('var b = "b"')
    })
    b.addLine('var c = "c"')

    expect(b.generate()).toBe([
      'var a = "a"',
      'function foo () {',
      '  var b = "b"',
      '}',
      'var c = "c"'
    ].join('\n'))
  })
})
