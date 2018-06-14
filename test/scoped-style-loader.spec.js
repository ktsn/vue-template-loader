const loader = require('../lib/scoped-style-loader')

describe('scoped style loader', () => {
  it('should add scoped id into the last node for each selector', done => {
    test(
      '1',
      'h1, h2 .foo {} h3 {}',
      'h1[data-v-1], h2 .foo[data-v-1] {\n}\nh3[data-v-1] {\n}'
    ).then(done)
  })

  it('should not add scoped id into pseudo element/class', done => {
    test(
      '1',
      'p::before {} .test:first-child {}',
      'p[data-v-1]::before {\n}\n.test[data-v-1]:first-child {\n}'
    ).then(done)
  })

  it('should add scoped id into the selectors in at-rules', done => {
    test(
      '1',
      '@media screen { p {} }',
      '@media screen {\np[data-v-1] {\n}\n}'
    ).then(done)
  })

  it('should add scope attribute the selector before >>> combinator', done => {
    test(
      '1',
      '.foo .bar >>> .baz {}',
      '.foo .bar[data-v-1] .baz {\n}'
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
    const expected = [
      `.foo[data-v-${id}] { animation: test-data-v-${id} 1s;\n}`,
      `.bar[data-v-${id}] { animation-name: test-data-v-${id}; animation-duration: 1s;\n}`,
      `@keyframes test-data-v-${id} {`,
      '0% { opacity: 0;\n}',
      '100% { opacity: 1;\n}',
      '}',
      `@-webkit-keyframes test-data-v-${id} {`,
      'from { opacity: 0;\n}',
      'to { opacity: 1;\n}',
      '}'
    ].join('\n')
    test(id, input, expected).then(done)
  })
})

function test (id, input, expected, map) {
  return new Promise(resolve => {
    loader.call(
      {
        query: { id },
        resourcePath: 'test.css',
        async: () => (err, css, map) => {
          expect(err).toBe(null)
          expect(css.trim()).toBe(expected.trim())
          resolve({ css, map })
        },
        sourceMap: true
      },
      input,
      map === true ? null : map
    )
  })
}

