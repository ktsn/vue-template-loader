const SourceMapConsumer = require('source-map').SourceMapConsumer
const compile = require('../../lib/modules/template-compiler')

describe('template-compiler', () => {
  it('transforms specified el\'s attr to require', () => {
    const actual = compile('<img src="./foo.png">', {
      transformAssetUrls: {
        img: 'src'
      }
    })
    expect(actual.code).toMatch(/require\("\.\/foo\.png"\)/)
  })

  it('does not transform unspecified attributes', () => {
    const actual = compile('<img src="./foo.png">')
    expect(actual.code).toMatch(/src: "\.\/foo\.png"/)
  })

  it('transforms "~" to module name require', () => {
    const actual = compile('<img src="~foo.png">', {
      transformAssetUrls: {
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
})
