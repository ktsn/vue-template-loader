const code = require('../lib/builder/code')

describe('code helper', () => {
  it('trims a code', () => {
    const c = code('  foo  \n')
    expect(c).toBe('foo')
  })

  it('deindents a code', () => {
    const c = code(`
    function foo () {
      console.log('test')
    }
    `)
    expect(c).toBe([
      'function foo () {',
      '  console.log(\'test\')',
      '}'
    ].join('\n'))
  })

  it('throws if a latter line has less indent than the first line', () => {
    expect(() => {
      /* eslint-disable */
      code(`
        first
      second
      `)
      /* eslint-enable */
    }).toThrow()
  })

  it('preserves provided indent number', () => {
    const c = code(`
      function foo () {
        return "bar"
      }
    `, 2)

    expect(c).toBe([
      '  function foo () {',
      '    return "bar"',
      '  }'
    ].join('\n'))
  })

  it('adds indent if it is not enought to preserve', () => {
    const c = code([
      'function foo () {',
      '  return "bar"',
      '}'
    ].join('\n'), 4)

    expect(c).toBe([
      '    function foo () {',
      '      return "bar"',
      '    }'
    ].join('\n'))
  })
})
