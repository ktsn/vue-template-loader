const loader = require('../lib/scoped-style-loader')

describe('scoped style loader', () => {
  it('should add scoped id into the last node for each selector', done => {
    test(
      '1',
      'h1, h2 .foo {} h3 {}'
    ).then(done)
  })

  it('should not add scoped id into pseudo element/class', done => {
    test(
      '1',
      'p::before {} .test:first-child {}'
    ).then(done)
  })

  it('should add scoped id into the selectors in at-rules', done => {
    test(
      '1',
      '@media screen { p {} }'
    ).then(done)
  })

  it('should add scope attribute the selector before >>> combinator', done => {
    test(
      '1',
      '.foo .bar >>> .baz {}'
    ).then(done)
  })

  it('should add scope id to keyframes', done => {
    const id = 'abc'
    const input = [
      '.foo { animation: test 1s; }',
      '.bar { animation-name: test; animation-duration: 1s; }',
      '@keyframes test {',
      '  0% { opacity: 0; }',
      '  100% { opacity: 1; }',
      '}',
      '@-webkit-keyframes test {',
      '  from { opacity: 0; }',
      '  to { opacity: 1; }',
      '}'
    ].join('\n')
    test(id, input).then(done)
  })
})

function test (id, input) {
  return new Promise(resolve => {
    loader.call(
      {
        query: { id },
        resourcePath: 'test.css',
        async: () => (err, css) => {
          expect(css).toMatchSnapshot()
          resolve()
        },
        sourceMap: true
      },
      input
    )
  })
}

