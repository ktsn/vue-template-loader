const addScopedId = require('../../lib/modules/add-scoped-id')

describe('add scoped id module', () => {
  it('should add scoped id into the last node for each selector', done => {
    test(
      'data-v-1',
      'h1, h2 .foo {} h3 {}',
      'h1[data-v-1], h2 .foo[data-v-1] {} h3[data-v-1] {}'
    ).then(done)
  })

  it('should not add scoped id into pseudo element/class', done => {
    test(
      'data-v-1',
      'p::before {} .test:first-child {}',
      'p[data-v-1]::before {} .test[data-v-1]:first-child {}'
    ).then(done)
  })

  it('should add scoped id into the selectors in at-rules', done => {
    test(
      'data-v-1',
      '@media screen { p {} }',
      '@media screen { p[data-v-1] {} }'
    ).then(done)
  })
})

function test (id, input, expected) {
  return addScopedId(id, input)
    .then(
      result => {
        expect(result.css).toBe(expected)
      },
      err => {
        console.error(err)
        throw err
      }
    )
}
