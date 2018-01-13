const SourceMapConsumer = require('source-map').SourceMapConsumer
const Base64 = require('js-base64').Base64
const sass = require('node-sass')
const addScopedId = require('../../lib/modules/add-scoped-id')

describe('add scoped id module', () => {
  it('should add scoped id into the last node for each selector', done => {
    test(
      '1',
      'h1, h2 .foo {} h3 {}',
      'h1[data-v-1], h2 .foo[data-v-1] {} h3[data-v-1] {}'
    ).then(done)
  })

  it('should not add scoped id into pseudo element/class', done => {
    test(
      '1',
      'p::before {} .test:first-child {}',
      'p[data-v-1]::before {} .test[data-v-1]:first-child {}'
    ).then(done)
  })

  it('should add scoped id into the selectors in at-rules', done => {
    test(
      '1',
      '@media screen { p {} }',
      '@media screen { p[data-v-1] {} }'
    ).then(done)
  })

  it('should generate source map', done => {
    test(
      '1',
      'div p {}',
      'div p[data-v-1] {}',
      true
    ).then(result => {
      expect(result.map).toBeTruthy()

      const smc = new SourceMapConsumer(result.map)
      let pos = smc.originalPositionFor({ line: 1, column: 17 })
      expect(pos.line).toBe(1)
      expect(pos.column).toBe(0)

      pos = smc.originalPositionFor({ line: 1, column: 18 })
      expect(pos.line).toBe(1)
      expect(pos.column).toBe(8)

      done()
    })
  })

  it('should consume previous source map', done => {
    const result = sass.renderSync({
      file: 'test.css',
      data: [
        'div {',
        '  p {',
        '    color: red;',
        '  }',
        '}'
      ].join('\n'),

      outputStyle: 'expanded',
      sourceMapEmbed: true
    })

    const sourceMapRE = /^([\s\S]+)\n\n\/\*# sourceMappingURL=data:application\/json;base64,(.+) \*\/$/
    const m = result.css.toString().match(sourceMapRE)

    const css = m[1]
    const map = JSON.parse(Base64.decode(m[2]))

    test(
      '1',
      css,
      [
        'div p[data-v-1] {',
        '  color: red;',
        '}'
      ].join('\n'),
      map
    ).then(result => {
      expect(result.map).toBeTruthy()

      const smc = new SourceMapConsumer(result.map)
      const pos = smc.originalPositionFor({ line: 2, column: 3 })
      expect(pos.line).toBe(3)
      expect(pos.column).toBe(4)

      done()
    })
  })

  it('should add scope attribute the selector before >>> combinator', done => {
    test(
      '1',
      '.foo .bar >>> .baz {}',
      '.foo .bar[data-v-1] .baz {}'
    ).then(done)
  })
})

function test (id, input, expected, map) {
  return addScopedId(id, input, {
    sourceMap: !!map,
    fileName: 'test.css',
    prevMap: map === true ? null : map
  }).then(result => {
    expect(result.css).toBe(expected)
    return result
  })
}
