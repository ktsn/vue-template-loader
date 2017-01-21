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
})
