const SourceMapConsumer = require('source-map').SourceMapConsumer
const compile = require('../../lib/modules/template-compiler')

describe('template-compiler', () => {
  it('transforms specified el\'s attr to require', () => {
    const actual = compile('<img src="./foo.png">', {
      transformToRequire: {
        img: 'src'
      }
    })
    expect(actual.code).toMatch(/require\("\.\/foo\.png"\)/)
  })

  it('does not transform unspecified attributes', () => {
    const actual = compile('<img src="./foo.png">')
    expect(actual.code).toMatch(/"src":"\.\/foo\.png"/)
  })

  it('transforms "~" to module name require', () => {
    const actual = compile('<img src="~foo.png">', {
      transformToRequire: {
        img: 'src'
      }
    })
    expect(actual.code).toMatch(/require\("foo\.png"\)/)
  })

  it('generates source map', () => {
    const src = '<p>Hello</p>'
    const actual = compile(src, {
      sourceMap: true,
      fileName: 'test.html'
    })
    expect(actual.map).toBeTruthy()

    const smc = new SourceMapConsumer(actual.map)
    const pos = smc.originalPositionFor({ line: 1, column: actual.code.length })
    expect(pos.line).toBe(1)
    expect(pos.column).toBe(0)
  })

  /**
   * ktsn/vue-template-loader#49 Support uri fragment in transformed require
   */
  it('supports uri fragment in transformed require', () => {
    const src = //
    '<svg>\
      <use href="~@svg/file.svg#fragment"></use>\
    </svg>'
    const actual = compile(src, {
      transformToRequire: {
        use: 'href'
      }
    })
    expect(actual.code).toMatch(/"href":require\("@svg\/file.svg"\) \+ "#fragment"/)
  })

  /**
   * ktsn/vue-template-loader#49 Support uri fragment in transformed require
   */
  it('when too short uri then empty require', () => {
    const src = //
    '<svg>\
      <use href="~"></use>\
    </svg>'
    const actual = compile(src, {
      transformToRequire: {
        use: 'href'
      }
    })
    expect(actual.code).toMatch(/"href":require\(""\)/)
  })
})
