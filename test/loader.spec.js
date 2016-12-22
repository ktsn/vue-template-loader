const requireFromString = require('require-from-string')
const loader = require('../lib')
const Vue = require('vue')
const Component = require('vue-class-component').default

function mockRender (options, data = {}) {
  return options.render.call(Object.assign({
    _c (tag, data, children) {
      if (Array.isArray(data)) {
        children = data
        data = null
      }
      return {
        tag,
        data,
        children
      }
    },
    _m (index) {
      return options.staticRenderFns[index].call(this)
    },
    _v (str) {
      return String(str)
    },
    _s (str) {
      return String(str)
    }
  }, data))
}

function load (data) {
  return requireFromString(loader.call({
    cacheable: () => {},
    options: {}
  }, data))
}

describe('vue-template-loader', () => {
  it('renders static element', () => {
    const withRender = load('<div><p>hi</p></div>')
    const options = withRender({})
    const vnode = mockRender(options)
    expect(vnode.tag).toBe('div')
    expect(vnode.children[0].children[0]).toBe('hi')
  })

  it('renders data bound element', () => {
    const withRender = load('<div><p>{{ value }}</p></div>')
    const options = withRender({})
    const vnode = mockRender(options, { value: 'hello' })
    expect(vnode.children[0].children[0]).toBe('hello')
  })

  it('is used as decorator', () => {
    const WithRender = load('<div><p>hi</p></div>')

    @WithRender
    @Component
    class Comp extends Vue {
      value = 123
    }

    const c = new Comp()
    expect(c.value).toBe(123)

    const vnode = mockRender(Comp.options)
    expect(vnode.children[0].children[0]).toBe('hi')
  })
})
